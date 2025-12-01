// Local database using localStorage with status tracking

export interface Note {
  id: string;
  address: string; // Wallet address
  txHash: string | null; // Transaction hash
  status: 'pending' | 'confirmed' | 'failed'; // Blockchain status
  title: string;
  content: string;
  color: string;
  attachments: string[];
  archived: boolean;
  trashed: boolean;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'blocknotes_db';

// Get all notes from localStorage
export const getAllNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const notes = getAllNotes();
  notes.unshift(note);
  saveAllNotes(notes);
  
  return note;
};

// Update note with transaction hash
export const updateNoteTxHash = (noteId: string, txHash: string): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.map(note => 
    note.id === noteId 
      ? { ...note, txHash, status: 'pending' as const, updatedAt: Date.now() }
      : note
  );
  saveAllNotes(updatedNotes);
};

// Update note status
export const updateNoteStatus = (noteId: string, status: 'pending' | 'confirmed' | 'failed'): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.map(note => 
    note.id === noteId 
      ? { ...note, status, updatedAt: Date.now() }
      : note
  );
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

// Delete note
export const deleteNote = (noteId: string): void => {
  const notes = getAllNotes();
  const filteredNotes = notes.filter(n => n.id !== noteId);
  saveAllNotes(filteredNotes);
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
