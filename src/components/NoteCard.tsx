import { motion } from 'motion/react';
import { Edit, Archive, ArchiveRestore, Trash2, RotateCcw, Palette, Paperclip } from 'lucide-react';
import { type Note } from '../utils/database';
import { useState } from 'react';
import { ColorPicker } from './ColorPicker';

interface NoteCardProps {
  note: Note;
  isNew?: boolean;
  shake?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onColorChange: (color: string) => void;
  currentView: 'all' | 'archived' | 'trashed';
}

export function NoteCard({
  note,
  isNew = false,
  shake = false,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onTrash,
  onRestore,
  onColorChange,
  currentView
}: NoteCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <motion.div
        className={`absolute -inset-1 bg-gradient-to-r ${note.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`}
      />

      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
        {/* Color strip */}
        <div className={`h-2 bg-gradient-to-r ${note.color}`} />

        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl mb-3 line-clamp-2 min-h-[3.5rem]">
            {note.title || 'Untitled Block'}
          </h3>

          {/* Content preview */}
          <p className="text-slate-400 text-sm mb-4 line-clamp-3 min-h-[4rem]">
            {note.content || 'No content'}
          </p>

          {/* Attachments indicator */}
          {note.attachments.length > 0 && (
            <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
              <Paperclip className="w-3 h-3" />
              <span>{note.attachments.length} attachment{note.attachments.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            className="flex items-center gap-2 flex-wrap"
          >
            {currentView === 'all' && (
              <>
                <ActionButton
                  icon={Edit}
                  onClick={onEdit}
                  color="from-blue-500 to-cyan-500"
                  label="Edit"
                />
                <ActionButton
                  icon={Palette}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  color="from-purple-500 to-pink-500"
                  label="Color"
                />
                <ActionButton
                  icon={Archive}
                  onClick={onArchive}
                  color="from-amber-500 to-orange-500"
                  label="Archive"
                />
                <ActionButton
                  icon={Trash2}
                  onClick={onTrash}
                  color="from-red-500 to-pink-500"
                  label="Trash"
                />
              </>
            )}

            {currentView === 'archived' && (
              <>
                <ActionButton
                  icon={ArchiveRestore}
                  onClick={onUnarchive}
                  color="from-green-500 to-emerald-500"
                  label="Restore"
                />
                <ActionButton
                  icon={Trash2}
                  onClick={onTrash}
                  color="from-red-500 to-pink-500"
                  label="Trash"
                />
              </>
            )}

            {currentView === 'trashed' && (
              <>
                <ActionButton
                  icon={RotateCcw}
                  onClick={onRestore}
                  color="from-green-500 to-emerald-500"
                  label="Restore"
                />
                <ActionButton
                  icon={Trash2}
                  onClick={onDelete}
                  color="from-red-500 to-pink-500"
                  label="Delete Forever"
                />
              </>
            )}
          </motion.div>

          {/* Color Picker */}
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="mt-4"
            >
              <ColorPicker
                currentColor={note.color}
                onColorChange={(color) => {
                  onColorChange(color);
                  setShowColorPicker(false);
                }}
              />
            </motion.div>
          )}
        </div>

        {/* Date info */}
        <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Updated {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon: Icon,
  onClick,
  color,
  label
}: {
  icon: any;
  onClick: () => void;
  color: string;
  label: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`p-2 rounded-lg bg-gradient-to-r ${color} hover:shadow-lg transition-shadow`}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </motion.button>
  );
}