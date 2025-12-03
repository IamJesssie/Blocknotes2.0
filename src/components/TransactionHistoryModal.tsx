import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Copy, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Transaction } from '../utils/database';
import { toast } from 'sonner';

interface TransactionHistoryModalProps {
  noteTitle: string;
  transactions: Transaction[];
  onClose: () => void;
}

export function TransactionHistoryModal({
  noteTitle,
  transactions,
  onClose,
}: TransactionHistoryModalProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success('Tx hash copied!', { duration: 2000 });
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleOpenCardanoscan = (hash: string) => {
    window.open(`https://preview.cardanoscan.io/transaction/${hash}`, '_blank');
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusBadgeColor = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'confirmed':
        return 'bg-green-500/10 border-green-500/30 text-green-300';
      case 'failed':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
    }
  };

  const getActionLabel = (action: Transaction['action']) => {
    switch (action) {
      case 'create':
        return '📝 Created';
      case 'update':
        return '✏️ Updated';
      case 'delete':
        return '🗑️ Deleted';
      case 'restore':
        return '♻️ Restored';
    }
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
        className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl shadow-purple-500/20"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-cyan-500 to-purple-500 relative overflow-hidden">
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
            <div>
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <p className="text-white/80 text-sm mt-1">📦 {noteTitle}</p>
            </div>
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
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {transactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-4xl mb-3">⛓️</div>
              <p className="text-slate-400">No transactions yet</p>
              <p className="text-slate-500 text-sm mt-1">Transactions will appear here when submitted to the blockchain</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={`${tx.hash}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(tx.status)}
                        <div>
                          <p className="font-medium">{getActionLabel(tx.action)}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusBadgeColor(tx.status)}`}
                      >
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </motion.div>
                    </div>

                    {/* Transaction Hash */}
                    <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 mb-3">
                      <code className="text-xs text-slate-300 font-mono flex-1 truncate">
                        {tx.hash}
                      </code>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopyHash(tx.hash)}
                        className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Copy transaction hash"
                      >
                        {copiedHash === tx.hash ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleOpenCardanoscan(tx.hash)}
                        className="p-2 text-slate-400 hover:text-purple-400 transition-colors"
                        title="View on Cardanoscan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
