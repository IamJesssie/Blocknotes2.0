import { motion } from 'motion/react';
import { FileText, Archive, Trash2, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentView: 'all' | 'archived' | 'trashed';
  onViewChange: (view: 'all' | 'archived' | 'trashed') => void;
  noteCounts: {
    all: number;
    archived: number;
    trashed: number;
  };
}

export function Sidebar({ currentView, onViewChange, noteCounts }: SidebarProps) {
  const menuItems = [
    { id: 'all' as const, icon: FileText, label: 'All Notes', count: noteCounts.all },
    { id: 'archived' as const, icon: Archive, label: 'Archived', count: noteCounts.archived },
    { id: 'trashed' as const, icon: Trash2, label: 'Trash', count: noteCounts.trashed },
  ];

  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6"
    >
      <div className="mb-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur-md"
            />
            <div className="relative bg-slate-900 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Blocknotes
            </h2>
            <p className="text-xs text-slate-500">Web3 Note Blocks</p>
          </div>
        </motion.div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-800/30 border border-slate-700/50 hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500' 
                    : 'bg-slate-700'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={isActive ? 'text-white' : 'text-slate-300'}>
                  {item.label}
                </span>
              </div>
              
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`
                  px-2 py-1 rounded-full text-xs
                  ${isActive 
                    ? 'bg-cyan-500/30 text-cyan-300' 
                    : 'bg-slate-700 text-slate-400'
                  }
                `}
              >
                {item.count}
              </motion.span>
            </motion.button>
          );
        })}
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-auto pt-8 mt-8 border-t border-slate-800"
      >
        <div className="p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30">
          <p className="text-xs text-slate-400 mb-2">Coming Soon</p>
          <p className="text-sm text-slate-300 mb-1">🔗 LACE Wallet Integration</p>
          <p className="text-sm text-slate-300 mb-1">📦 IPFS Storage</p>
          <p className="text-sm text-slate-300">⚡ Blaze SDK</p>
        </div>
      </motion.div>
    </motion.aside>
  );
}
