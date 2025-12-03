import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Archive, Trash2, Sparkles, Wallet, Globe, Coins, AlertTriangle } from 'lucide-react';

interface SidebarProps {
  currentView: 'all' | 'archived' | 'trashed';
  onViewChange: (view: 'all' | 'archived' | 'trashed') => void;
  noteCounts: {
    all: number;
    archived: number;
    trashed: number;
  };
  userAddress: string;
  walletBalance: string;
  networkName: string;
  onDisconnect: () => void;
}

export function Sidebar({ currentView, onViewChange, noteCounts, userAddress, walletBalance, networkName, onDisconnect }: SidebarProps) {
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleDisconnectClick = () => {
    setShowWalletMenu(false);
    setShowDisconnectConfirm(true);
  };

  const handleConfirmDisconnect = () => {
    setShowDisconnectConfirm(false);
    onDisconnect();
  };

  const handleCancelDisconnect = () => {
    setShowDisconnectConfirm(false);
  };

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

      {/* Wallet Info Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-auto pt-8 mt-8 border-t border-slate-800"
      >
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowWalletMenu(!showWalletMenu)}
            className="w-full flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-xs text-slate-400">Connected Wallet</p>
              <p className="text-sm font-mono text-slate-300 truncate">
                {userAddress.substring(0, 8)}...{userAddress.substring(userAddress.length - 8)}
              </p>
            </div>
          </motion.button>

          {showWalletMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl z-50"
            >
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="w-8 h-8 text-cyan-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-1">Full Address</p>
                    <p className="text-xs font-mono break-all text-slate-300">{userAddress}</p>
                  </div>
                </div>
                
                {/* Balance Display */}
                <div className="flex items-center gap-2 mb-2 p-2 bg-slate-900/50 rounded-lg">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-300">
                    <span className="font-semibold text-yellow-400">{walletBalance}</span> ADA
                  </span>
                </div>
                
                {/* Network Display */}
                <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg">
                  <Globe className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">
                    Network: <span className="text-green-400">{networkName}</span>
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                onClick={handleDisconnectClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                Disconnect Wallet
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Disconnect Confirmation Dialog */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={handleCancelDisconnect}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Disconnect Wallet?</h3>
              </div>
              
              <p className="text-slate-400 mb-6">
                Are you sure you want to disconnect your wallet? You'll need to reconnect to access your notes.
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelDisconnect}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmDisconnect}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-colors"
                >
                  Disconnect
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
