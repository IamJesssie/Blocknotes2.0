import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { BlocknotesBackground } from './BlocknotesBackground';
import { useBlockchainSync } from '../hooks/useBlockchainSync';
import {
  getAllNotes,
  createNote as dbCreateNote,
  updateNote as dbUpdateNote,
  updateNoteTxHash,
  deleteNote as dbDeleteNote,
  archiveNote as dbArchiveNote,
  unarchiveNote as dbUnarchiveNote,
  trashNote as dbTrashNote,
  restoreNote as dbRestoreNote,
  changeNoteColor as dbChangeNoteColor,
  type Note
} from '../utils/database';
import {
  sendNoteTransaction,
  getWalletBalance,
  getWalletNetworkId,
  getNetworkName,
  createBlockfrostProvider,
} from '../utils/cardano';

type View = 'all' | 'archived' | 'trashed';

interface NotesAppProps {
  user: { address: string; walletApi: any };
  onDisconnect: () => void;
}

export function NotesApp({ user, onDisconnect }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentView, setCurrentView] = useState<View>('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submittingTx, setSubmittingTx] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0.000000');
  const [networkName, setNetworkName] = useState<string>('Loading...');
  const [provider] = useState(() => createBlockfrostProvider());

  // Activate blockchain sync worker
  useBlockchainSync();

  // Fetch wallet info on mount
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        // Get balance
        const balance = await getWalletBalance(user.walletApi);
        setWalletBalance(balance);
        
        // Get network
        const networkId = await getWalletNetworkId(user.walletApi);
        setNetworkName(getNetworkName(networkId));
      } catch (error) {
        console.error('Failed to fetch wallet info:', error);
      }
    };
    
    fetchWalletInfo();
    
    // Refresh balance periodically (every 30 seconds)
    const interval = setInterval(fetchWalletInfo, 30000);
    return () => clearInterval(interval);
  }, [user.walletApi]);

  // Load notes from database
  const loadNotes = () => {
    const allNotes = getAllNotes();
    setNotes(allNotes);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Refresh notes every 2 seconds to show status updates
  useEffect(() => {
    const interval = setInterval(loadNotes, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredNotes = notes.filter((note) => {
    if (currentView === 'all') return !note.archived && !note.trashed;
    if (currentView === 'archived') return note.archived && !note.trashed;
    if (currentView === 'trashed') return note.trashed;
    return false;
  });

  const submitToBlockchain = async (noteId: string, action: 'create' | 'update' | 'delete', noteData?: { title: string; content: string }) => {
    setSubmittingTx(noteId);

    try {
      // Reload notes to ensure we have the latest state
      loadNotes();
      
      // Try to find note from state, or use provided noteData
      let note = notes.find(n => n.id === noteId);
      
      // If note not found and we have noteData (for create), use it
      if (!note && noteData) {
        // Get all notes fresh from database
        const allNotes = getAllNotes();
        note = allNotes.find(n => n.id === noteId);
      }
      
      if (!note) {
        console.error(`Note ${noteId} not found`);
        throw new Error(`Note ${noteId} not found`);
      }

      console.log(`📤 Submitting ${action} transaction for note:`, noteId);

      // Submit transaction using wallet API + Blaze/Blockfrost
      const txId = await sendNoteTransaction(
        provider,
        user.walletApi,
        user.address, // Send to self
        '1000000', // 1 ADA minimum (1,000,000 lovelace)
        note.content,
        note.title,
        action,
        note.id
      );

      // Update note with transaction hash
      updateNoteTxHash(noteId, txId);
      loadNotes();

      const cardanoscanUrl = `https://preview.cardanoscan.io/transaction/${txId}`;
      
      // Log clickable Cardanoscan link to console
      console.log(`✅ Transaction submitted: ${txId}`);
      console.log(`🔗 View on Cardanoscan:`, cardanoscanUrl);
      // Most browsers make URLs in console clickable automatically
      // Also store in window for easy access
      (window as any).lastTxUrl = cardanoscanUrl;
      console.log(`%c🔗 Click to open Cardanoscan: ${cardanoscanUrl}`, 'color: #3b82f6; font-weight: bold;');
      console.log('💡 Or run: window.open(window.lastTxUrl)');

      // Show success message
      const isDemoTx = txId.startsWith('demo_');
      if (isDemoTx) {
        alert(
          `🎉 Note submitted to blockchain (DEMO MODE)!\n\n` +
          `Tx Hash: ${txId}\n\n` +
          `Status: Pending → will auto-confirm in 20 seconds\n\n` +
          `Note: Install Blaze SDK locally for real transactions.\n` +
          `See SETUP_INSTRUCTIONS.md for details.`
        );
      } else {
        alert(
          `🎉 Transaction submitted!\n\n` +
          `Tx Hash: ${txId}\n\n` +
          `Check Cardanoscan: ${cardanoscanUrl}`
        );
      }

    } catch (error: any) {
      console.error('Transaction failed:', error);
      alert(`❌ Transaction failed: ${error.message}`);
    } finally {
      setSubmittingTx(null);
    }
  };

  const createNoteHandler = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'address' | 'txHash' | 'status'>) => {
    try {
      // Create note in local database immediately (good UX)
      const newNote = dbCreateNote(
        user.address,
        noteData.title,
        noteData.content,
        noteData.color,
        noteData.attachments
      );

      setIsCreating(false);
      loadNotes();

      console.log('✅ Note created locally:', newNote.id);
      
      // Submit to blockchain in background - this will prompt LACE wallet to sign
      // Pass noteData to ensure we have the content even if state hasn't updated
      await submitToBlockchain(newNote.id, 'create', {
        title: noteData.title,
        content: noteData.content
      });
    } catch (error) {
      console.error('Failed to create note:', error);
      alert(`Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const updateNoteHandler = async (noteId: string, updates: Partial<Note>) => {
    dbUpdateNote(noteId, updates);
    setEditingNote(null);
    loadNotes();

    // Submit update to blockchain
    await submitToBlockchain(noteId, 'update');
  };

  const deleteNoteHandler = async (noteId: string) => {
    if (!confirm('Permanently delete this note? This will also submit a delete transaction to the blockchain.')) {
      return;
    }

    try {
      // Submit delete transaction first - this will prompt LACE wallet to sign
      await submitToBlockchain(noteId, 'delete');

      // Only delete from local database after successful blockchain submission
      dbDeleteNote(noteId);
      loadNotes();
    } catch (error) {
      // If transaction fails, note remains in local database
      console.error('Delete transaction failed, note not deleted:', error);
    }
  };

  const archiveNoteHandler = (noteId: string) => {
    dbArchiveNote(noteId);
    loadNotes();
  };

  const unarchiveNoteHandler = (noteId: string) => {
    dbUnarchiveNote(noteId);
    loadNotes();
  };

  const trashNoteHandler = (noteId: string) => {
    dbTrashNote(noteId);
    loadNotes();
  };

  const restoreNoteHandler = (noteId: string) => {
    dbRestoreNote(noteId);
    loadNotes();
  };

  const changeColorHandler = (noteId: string, color: string) => {
    dbChangeNoteColor(noteId, color);
    loadNotes();
  };

  const getStatusIcon = (status: Note['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = (status: Note['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'failed':
        return 'Failed';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <BlocknotesBackground />

      <div className="relative z-10 flex h-screen">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          noteCounts={{
            all: notes.filter(n => !n.archived && !n.trashed).length,
            archived: notes.filter(n => n.archived && !n.trashed).length,
            trashed: notes.filter(n => n.trashed).length,
          }}
          userAddress={user.address}
          walletBalance={walletBalance}
          networkName={networkName}
          onDisconnect={onDisconnect}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <motion.div
            className="max-w-7xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-5xl mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {currentView === 'all' && 'All Notes'}
                  {currentView === 'archived' && 'Archived'}
                  {currentView === 'trashed' && 'Trash'}
                </h1>
                <p className="text-slate-400">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'block' : 'blocks'}
                </p>
              </div>

              {currentView === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  New Block
                </motion.button>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <motion.div key={note.id} className="relative">
                    {/* Status Badge */}
                    <motion.div
                      className="absolute -top-2 -right-2 z-10 bg-slate-800 border border-slate-700 rounded-full px-3 py-1 flex items-center gap-2 text-xs"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {getStatusIcon(note.status)}
                      <span>{getStatusText(note.status)}</span>
                    </motion.div>

                    <NoteCard
                      note={note}
                      isNew={false}
                      shake={false}
                      onEdit={() => setEditingNote(note)}
                      onDelete={() => deleteNoteHandler(note.id)}
                      onArchive={() => archiveNoteHandler(note.id)}
                      onUnarchive={() => unarchiveNoteHandler(note.id)}
                      onTrash={() => trashNoteHandler(note.id)}
                      onRestore={() => restoreNoteHandler(note.id)}
                      onColorChange={(color) => changeColorHandler(note.id, color)}
                      currentView={currentView}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredNotes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl text-slate-400 mb-2">No blocks here</h3>
                <p className="text-slate-500">
                  {currentView === 'all' && 'Create your first block to get started!'}
                  {currentView === 'archived' && 'No archived blocks yet.'}
                  {currentView === 'trashed' && 'Trash is empty.'}
                </p>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {(isCreating || editingNote) && (
          <NoteEditor
            note={editingNote}
            onSave={(noteData) => {
              if (editingNote) {
                updateNoteHandler(editingNote.id, noteData);
              } else {
                createNoteHandler(noteData);
              }
            }}
            onClose={() => {
              setIsCreating(false);
              setEditingNote(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Transaction Loading Overlay */}
      {submittingTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center max-w-md"
          >
            <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl mb-2">Submitting to Blockchain</h3>
            <p className="text-slate-400 text-sm mb-4">
              Building transaction with metadata...
            </p>
            <div className="bg-slate-800 rounded-lg p-3 text-xs font-mono text-left">
              <p className="text-slate-500">✓ Building transaction...</p>
              <p className="text-slate-500">✓ Attaching metadata...</p>
              <p className="text-slate-500">⏳ Processing...</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
