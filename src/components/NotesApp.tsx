import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar } from './Sidebar';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { TransactionHistoryModal } from './TransactionHistoryModal';
import { TutorialOverlay } from './TutorialOverlay';
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
  getReceiverAddress,
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
  const [selectedNoteForHistory, setSelectedNoteForHistory] = useState<Note | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0.000000');
  const [networkName, setNetworkName] = useState<string>('Loading...');

  const [provider] = useState(() => createBlockfrostProvider());
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

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

      // Get the receiver address from environment config
      const receiverAddress = getReceiverAddress();

      // Submit transaction using wallet API + Blaze/Blockfrost
      const txId = await sendNoteTransaction(
        provider,
        user.walletApi,
        receiverAddress, // Send to configured receiver address
        '1000000', // 1 ADA minimum (1,000,000 lovelace)
        note.content,
        note.title,
        action,
        note.id
      );

      // Update note with transaction hash
      updateNoteTxHash(noteId, txId, action);
      loadNotes();

      // Store tx URL for later access (will be logged when confirmed)
      const cardanoscanUrl = `https://preview.cardanoscan.io/transaction/${txId}`;
      (window as any).lastTxUrl = cardanoscanUrl;
      
      // Log submission (Cardanoscan link will appear after confirmation)
      console.log(`✅ Transaction submitted: ${txId}`);
      console.log(`⏳ Waiting for blockchain confirmation... (check every 20s)`);

      // Show success message
      const isDemoTx = txId.startsWith('demo_');
      const actionLabel = action === 'delete' ? 'deleted' : action === 'update' ? 'updated' : 'created';
      
      if (isDemoTx) {
        toast.success(`✨ Note ${actionLabel} (DEMO MODE)`, {
          description: `Tx Hash: ${txId}\nStatus will auto-confirm in 20 seconds`,
          duration: 6000,
          icon: '🎉',
        });
      } else {
        toast.success(`✨ Transaction submitted!`, {
          description: `Tx Hash: ${txId}\nView on Cardanoscan`,
          duration: 6000,
          icon: '⛓️',
          action: {
            label: 'View',
            onClick: () => window.open(`https://preview.cardanoscan.io/transaction/${txId}`, '_blank'),
          },
        });
      }

    } catch (error: any) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed', {
        description: error.message,
        duration: 6000,
        icon: '❌',
      });
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
    
    toast.success('✏️ Block updated!', {
      description: 'Preparing to submit changes to blockchain...',
      duration: 5000,
    });

    setEditingNote(null);
    loadNotes();

    // Submit update to blockchain
    await submitToBlockchain(noteId, 'update');
  };

  // Hard delete - removes from localStorage only (no blockchain tx)
  // Used for cleaning up notes that are already in trash
  const hardDeleteNoteHandler = (noteId: string) => {
    if (!confirm('Permanently remove this note from your device? This cannot be undone.')) {
      return;
    }
    
    dbDeleteNote(noteId);
    loadNotes();
    toast.success('🗑️ Block permanently removed!', {
      description: 'The note has been removed from your device.',
      duration: 5000,
      icon: '🗑️',
    });
  };

  // Trash note - submits "delete" transaction to blockchain
  // Note moves to trash and stays there with transaction history
  const trashNoteHandler = async (noteId: string) => {
    try {
      // First move to trash
      dbTrashNote(noteId);
      loadNotes();
      
      toast.info('🗑️ Moving to trash...', {
        description: 'Please sign the transaction in your wallet.',
        duration: 5000,
      });

      // Submit delete transaction to blockchain
      await submitToBlockchain(noteId, 'delete');
      
      toast.success('🗑️ Block moved to trash!', {
        description: 'Delete transaction submitted. Check Trash for confirmation status.',
        duration: 5000,
        icon: '🗑️',
      });
    } catch (error) {
      console.error('Trash transaction failed:', error);
      toast.error('Failed to submit delete transaction', {
        description: 'The note is in trash but not recorded on blockchain.',
        duration: 5000,
      });
    }
  };

  const archiveNoteHandler = (noteId: string) => {
    dbArchiveNote(noteId);
    loadNotes();
    toast.success('📦 Block archived!', {
      description: 'You can find it in the Archived section.',
      duration: 5000,
      icon: '📦',
    });
  };

  const unarchiveNoteHandler = (noteId: string) => {
    dbUnarchiveNote(noteId);
    loadNotes();
    toast.success('📝 Block restored!', {
      description: 'The block is back in your notes.',
      duration: 5000,
      icon: '✨',
    });
  };

  const restoreNoteHandler = (noteId: string) => {
    dbRestoreNote(noteId);
    loadNotes();
    toast.success('♻️ Block restored!', {
      description: 'The block has been restored to your notes.',
      duration: 5000,
      icon: '✨',
    });
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

  const getStatusBadgeColor = (status: Note['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'confirmed':
        return 'bg-green-500/10 border-green-500/30 text-green-300';
      case 'failed':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <motion.div key={note.id} className="relative">
                    {/* Status Badge with animations */}
                    {note.status === 'pending' && (
                      <motion.div
                        className={`absolute -top-2 -right-2 z-10 border rounded-full px-3 py-1 flex items-center gap-2 text-xs font-medium backdrop-blur-sm ${getStatusBadgeColor(note.status)}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {/* Pulsing glow effect for pending */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-yellow-400/20"
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(250, 204, 21, 0.3)',
                              '0 0 20px rgba(250, 204, 21, 0.6)',
                              '0 0 10px rgba(250, 204, 21, 0.3)',
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className="relative flex items-center gap-2">
                          {getStatusIcon(note.status)}
                          <span>{getStatusText(note.status)}</span>
                        </div>
                      </motion.div>
                    )}

                    {note.status === 'confirmed' && (
                      <motion.div
                        className={`absolute -top-2 -right-2 z-10 border rounded-full px-3 py-1 flex items-center gap-2 text-xs font-medium backdrop-blur-sm ${getStatusBadgeColor(note.status)}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {/* Subtle glow for confirmed */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-green-400/10"
                          animate={{
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <div className="relative flex items-center gap-2">
                          {getStatusIcon(note.status)}
                          <span>{getStatusText(note.status)}</span>
                        </div>
                      </motion.div>
                    )}

                    {note.status === 'failed' && (
                      <motion.div
                        className={`absolute -top-2 -right-2 z-10 border rounded-full px-3 py-1 flex items-center gap-2 text-xs font-medium backdrop-blur-sm ${getStatusBadgeColor(note.status)}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {/* Shake animation for failed */}
                        <motion.div
                          className="relative flex items-center gap-2"
                          animate={{ x: [0, -2, 2, -2, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                          {getStatusIcon(note.status)}
                          <span>{getStatusText(note.status)}</span>
                        </motion.div>
                      </motion.div>
                    )}

                    <NoteCard
                      note={note}
                      isNew={false}
                      shake={false}
                      onEdit={() => setEditingNote(note)}
                      onDelete={() => hardDeleteNoteHandler(note.id)}
                      onArchive={() => archiveNoteHandler(note.id)}
                      onUnarchive={() => unarchiveNoteHandler(note.id)}
                      onTrash={() => trashNoteHandler(note.id)}
                      onRestore={() => restoreNoteHandler(note.id)}
                      onColorChange={(color) => changeColorHandler(note.id, color)}
                      onShowHistory={() => setSelectedNoteForHistory(note)}
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

        {selectedNoteForHistory && (
          <TransactionHistoryModal
            noteTitle={selectedNoteForHistory.title || 'Untitled Block'}
            transactions={selectedNoteForHistory.transactions}
            onClose={() => setSelectedNoteForHistory(null)}
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

      {/* Help/Tutorial Button */}
      <motion.button
        onClick={() => setIsTutorialOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-8 w-14 h-14 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors z-40"
        title="View Tutorial"
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
