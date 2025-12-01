import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, Paperclip, Trash2 } from 'lucide-react';
import { Note } from '../App';
import { ColorPicker } from './ColorPicker';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || 'from-purple-500 to-pink-500');
  const [attachments, setAttachments] = useState<string[]>(note?.attachments || []);
  const [newAttachment, setNewAttachment] = useState('');

  useEffect(() => {
    // Prevent body scroll when editor is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      return;
    }
    
    onSave({
      title: title.trim(),
      content: content.trim(),
      color,
      attachments,
      archived: note?.archived || false,
      trashed: note?.trashed || false,
    });
  };

  const addAttachment = () => {
    if (newAttachment.trim()) {
      setAttachments([...attachments, newAttachment.trim()]);
      setNewAttachment('');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, rotateX: -15, y: 50 }}
        animate={{ scale: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.9, rotateX: 15, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-2xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/20"
      >
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${color} relative overflow-hidden`}>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-white/10 rounded-full blur-3xl"
          />
          
          <div className="relative flex items-center justify-between">
            <h2 className="text-2xl">
              {note ? 'Edit Block' : 'New Block'}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Title Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Title</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter block title..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Content</label>
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your content..."
              rows={8}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm text-slate-400 mb-3">Block Color</label>
            <ColorPicker currentColor={color} onColorChange={setColor} />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm text-slate-400 mb-3">Attachments</label>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAttachment}
                onChange={(e) => setNewAttachment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAttachment()}
                placeholder="Add attachment URL or text..."
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addAttachment}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-shadow"
              >
                <Paperclip className="w-5 h-5" />
              </motion.button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-300 truncate">{attachment}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Save Block
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
