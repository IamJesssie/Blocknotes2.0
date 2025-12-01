import { motion } from 'motion/react';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

const colors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-amber-500 to-orange-500',
  'from-red-500 to-pink-500',
  'from-indigo-500 to-purple-500',
  'from-teal-500 to-green-500',
  'from-yellow-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
];

export function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {colors.map((color) => (
        <motion.button
          key={color}
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onColorChange(color)}
          className={`
            w-8 h-8 rounded-lg bg-gradient-to-r ${color}
            ${currentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}
          `}
        />
      ))}
    </div>
  );
}
