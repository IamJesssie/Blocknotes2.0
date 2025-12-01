import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Wallet, CheckCircle2, Clock, XCircle } from 'lucide-react';
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
import { sendNoteTransaction } from '../utils/cardano';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [submittingTx, setSubmittingTx] = useState<string | null>(null);

  // Activate blockchain sync worker
  useBlockchainSync();

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

  const submitToBlockchain = async (noteId: string, action: 'create' | 'update' | 'delete') => {
    setSubmittingTx(noteId);

    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      // TODO: Replace with actual Blockfrost provider
      // For now, show the intent to submit transaction
      console.log(`📤 Submitting ${action} transaction for note:`, noteId);

      // Uncomment when you have Blockfrost provider set up:
      /*
      const txId = await sendNoteTransaction(
        provider, // Your Blockfrost provider
        user.walletApi,
        user.address, // Send to self
        '1000000', // 1 ADA minimum
        note.content,
        note.title,
        action,
        note.id
      );
      
      updateNoteTxHash(noteId, txId);
      loadNotes();
      
      console.log(`✅ Transaction submitted: ${txId}`);
      */

      // For demo: simulate transaction submission
      const mockTxId = `demo_tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      updateNoteTxHash(noteId, mockTxId);
      loadNotes();

      alert(`🎉 Note submitted to blockchain!\n\nTx Hash: ${mockTxId}\n\nStatus: Pending confirmation (~20 seconds)\n\nNote: This is a DEMO. Replace with real Blaze SDK integration.`);

    } catch (error: any) {
      console.error('Transaction failed:', error);
      alert(`❌ Transaction failed: ${error.message}`);
    } finally {
      setSubmittingTx(null);
    }
  };

  const createNoteHandler = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
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

    // Submit to blockchain in background
    await submitToBlockchain(newNote.id, 'create');
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

    // Submit delete transaction first
    await submitToBlockchain(noteId, 'delete');

    // Then delete from local database
    dbDeleteNote(noteId);
    loadNotes();
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

              <div className="flex items-center gap-4">
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

                {/* Wallet Info */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600"
                  >
                    <Wallet className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-mono">
                      {user.address.substring(0, 8)}...{user.address.substring(user.address.length - 8)}
                    </span>
                  </motion.button>

                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl"
                    >
                      <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                          <Wallet className="w-10 h-10 text-cyan-400" />
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-1">Connected Wallet</p>
                            <p className="text-xs font-mono break-all">{user.address}</p>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        onClick={onDisconnect}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Wallet className="w-4 h-4" />
                        Disconnect Wallet
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
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
              Please sign the transaction in your LACE wallet
            </p>
            <div className="bg-slate-800 rounded-lg p-3 text-xs font-mono text-left">
              <p className="text-slate-500">Building transaction...</p>
              <p className="text-slate-500">Attaching metadata...</p>
              <p className="text-slate-500">Waiting for signature...</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
