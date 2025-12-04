// Local database using localStorage with status tracking

export interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  action: 'create' | 'update' | 'delete' | 'restore';
  timestamp: number;
}

export interface Note {
  id: string;
  address: string; // Wallet address
  txHash: string | null; // Current/latest transaction hash
  status: 'pending' | 'confirmed' | 'failed'; // Blockchain status
  title: string;
  content: string;
  color: string;
  attachments: string[];
  archived: boolean;
  trashed: boolean;
  pendingDelete?: boolean; // Marked for deletion after tx confirms
  transactions: Transaction[]; // History of all transactions
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'blocknotes_db';

// Get all notes from localStorage (with migration for old notes)
export const getAllNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const notes = JSON.parse(data);
    
    // Migrate old notes that may be missing new fields
    return notes.map((note: any) => ({
      ...note,
      transactions: note.transactions || [],
      attachments: note.attachments || [],
      status: note.status || 'confirmed',
      txHash: note.txHash || null,
      pendingDelete: note.pendingDelete || false,
    }));
  } catch (error) {
    console.error("Failed to load notes:", error);
    return [];
  }
};

// Save all notes to localStorage
const saveAllNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to save notes:", error);
  }
};

// Create a new note (initially pending)
export const createNote = (
  address: string,
  title: string,
  content: string,
  color: string,
  attachments: string[] = []
): Note => {
  const note: Note = {
    id: Date.now().toString(),
    address,
    txHash: null,
    status: 'pending',
    title,
    content,
    color,
    attachments,
    archived: false,
    trashed: false,
    transactions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const notes = getAllNotes();
  notes.unshift(note);
  saveAllNotes(notes);
  
  return note;
};

// Update note with transaction hash and record in history
export const updateNoteTxHash = (noteId: string, txHash: string, action: 'create' | 'update' | 'delete' | 'restore' = 'create'): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.map(note => {
    if (note.id === noteId) {
      const newTransaction: Transaction = {
        hash: txHash,
        status: 'pending',
        action,
        timestamp: Date.now(),
      };
      return {
        ...note,
        txHash,
        status: 'pending' as const,
        transactions: [newTransaction, ...note.transactions],
        updatedAt: Date.now(),
      };
    }
    return note;
  });
  saveAllNotes(updatedNotes);
};

// Update transaction status in history
export const updateTransactionStatus = (
  noteId: string,
  txHash: string,
  status: 'pending' | 'confirmed' | 'failed'
): void => {
  const notes = getAllNotes();
  
  // Find the note to check if it's pending delete
  const targetNote = notes.find(n => n.id === noteId);
  
  // If delete transaction is confirmed, remove the note entirely
  if (targetNote?.pendingDelete && status === 'confirmed') {
    console.log(`🗑️ Delete transaction confirmed, removing note: ${noteId}`);
    const filteredNotes = notes.filter(n => n.id !== noteId);
    saveAllNotes(filteredNotes);
    return;
  }
  
  const updatedNotes = notes.map(note => {
    if (note.id === noteId) {
      return {
        ...note,
        status: status,
        transactions: note.transactions.map(tx =>
          tx.hash === txHash ? { ...tx, status } : tx
        ),
      };
    }
    return note;
  });
  saveAllNotes(updatedNotes);
};

// Update note content
export const updateNote = (noteId: string, updates: Partial<Note>): Note | null => {
  const notes = getAllNotes();
  const noteIndex = notes.findIndex(n => n.id === noteId);
  
  if (noteIndex === -1) return null;
  
  const updatedNote = {
    ...notes[noteIndex],
    ...updates,
    updatedAt: Date.now(),
    // Reset status to pending when content changes
    status: 'pending' as const,
    txHash: null,
  };
  
  notes[noteIndex] = updatedNote;
  saveAllNotes(notes);
  
  return updatedNote;
};

// Delete note immediately (use markNoteForDeletion for blockchain-tracked deletion)
export const deleteNote = (noteId: string): void => {
  const notes = getAllNotes();
  const filteredNotes = notes.filter(n => n.id !== noteId);
  saveAllNotes(filteredNotes);
};

// Mark note for deletion (will be removed after tx confirms)
export const markNoteForDeletion = (noteId: string): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.map(note =>
    note.id === noteId
      ? { ...note, pendingDelete: true, updatedAt: Date.now() }
      : note
  );
  saveAllNotes(updatedNotes);
};

// Archive note
export const archiveNote = (noteId: string): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.map(note => 
    note.id === noteId 
      ? { ...note, archived: true, updatedAt: Date.now() }
      : note
  );
  saveAllNotes(updatedNotes);
};

// Unarchive note
export const unarchiveNote = (noteId: string): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.map(note => 
    note.id === noteId 
      ? { ...note, archived: false, updatedAt: Date.now() }
      : note
  );
  saveAllNotes(updatedNotes);
};

// Trash note
export const trashNote = (noteId: string): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.map(note => 
    note.id === noteId 
      ? { ...note, trashed: true, updatedAt: Date.now() }
      : note
  );
  saveAllNotes(updatedNotes);
};

// Restore note from trash
export const restoreNote = (noteId: string): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.map(note => 
    note.id === noteId 
      ? { ...note, trashed: false, archived: false, updatedAt: Date.now() }
      : note
  );
  saveAllNotes(updatedNotes);
};

// Change note color
export const changeNoteColor = (noteId: string, color: string): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.map(note => 
    note.id === noteId 
      ? { ...note, color, updatedAt: Date.now() }
      : note
  );
  saveAllNotes(updatedNotes);
};

// Get pending notes (for background worker)
export const getPendingNotes = (): Note[] => {
  const notes = getAllNotes();
  return notes.filter(note => note.status === 'pending' && note.txHash !== null);
};

// Get notes by wallet address
export const getNotesByAddress = (address: string): Note[] => {
  const notes = getAllNotes();
  return notes.filter(note => note.address === address);
};
