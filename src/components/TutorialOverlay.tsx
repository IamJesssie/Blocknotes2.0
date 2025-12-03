import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Blocks,
  Wallet,
  Plus,
  Edit2,
  Trash2,
  Archive,
  History,
  Palette,
  Save,
  HelpCircle,
} from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  highlights?: string;
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: 'Welcome to Blocknotes',
      description:
        'Your Web3-powered note-taking experience. Store your thoughts securely on the blockchain with LACE wallet integration.',
      icon: <Sparkles className="w-16 h-16 text-cyan-400" />,
      tips: [
        'All notes are stored on-chain via blockchain',
        'Connect your LACE wallet to get started',
        'Your data is decentralized and secure',
      ],
    },
    {
      id: 2,
      title: 'Creating Notes',
      description:
        'Create new notes by clicking the "+" button. Each note is a block that stores your ideas, tasks, and thoughts.',
      icon: <Plus className="w-16 h-16 text-purple-400" />,
      tips: [
        'Click the "+" button to create a new note',
        'Give your note a title and content',
        'Choose a color to organize visually',
        'Notes are auto-saved to localStorage',
      ],
    },
    {
      id: 3,
      title: 'Editing Notes',
      description:
        'Click on any note to edit its content. Your changes are tracked and can be submitted to the blockchain.',
      icon: <Edit2 className="w-16 h-16 text-blue-400" />,
      tips: [
        'Click a note card to open the editor',
        'Edit title and content freely',
        'Changes are tracked in real-time',
        'Submit to blockchain for permanent recording',
      ],
    },
    {
      id: 4,
      title: 'Blockchain Submission',
      description:
        'Submit your notes to the Cardano blockchain using your LACE wallet. This records your notes permanently with a transaction hash.',
      icon: <Wallet className="w-16 h-16 text-emerald-400" />,
      tips: [
        'Click "Submit to Blockchain" in the editor',
        'Sign the transaction in your LACE wallet',
        'Transaction status updates automatically',
        'Pending: yellow glow, Confirmed: green ✓, Failed: red ✗',
      ],
    },
    {
      id: 5,
      title: 'Transaction History',
      description:
        'View all blockchain transactions for a note. Click the History button to see when notes were created, updated, or deleted on-chain.',
      icon: <History className="w-16 h-16 text-orange-400" />,
      tips: [
        'Click the History icon on confirmed notes',
        'See all on-chain transactions for that note',
        'Copy transaction hash with one click',
        'Open in Cardanoscan block explorer',
      ],
    },
    {
      id: 6,
      title: 'Organizing Notes',
      description:
        'Use colors and the Archive/Trash features to organize your notes. Archived notes stay safe but hidden; Trashed notes can be restored.',
      icon: <Palette className="w-16 h-16 text-pink-400" />,
      tips: [
        'Right-click any note to change its color',
        'Archive notes to keep them but hide from view',
        'Trash notes when you want to delete them',
        'Restore from Trash before permanent deletion',
      ],
    },
    {
      id: 7,
      title: 'Status Badges',
      description:
        'Each note shows a status badge indicating its blockchain state. Watch the animations to understand the current transaction status.',
      icon: <Blocks className="w-16 h-16 text-yellow-400" />,
      tips: [
        '🟡 Pending: Waiting for blockchain confirmation (pulsing glow)',
        '🟢 Confirmed: Successfully recorded on-chain (steady)',
        '🔴 Failed: Transaction failed (shake animation)',
        'Status updates automatically every 20 seconds',
      ],
    },
    {
      id: 8,
      title: 'Views & Sidebar',
      description:
        'Navigate between All Notes, Archived, and Trash using the sidebar. Each view shows different categories of your notes.',
      icon: <HelpCircle className="w-16 h-16 text-cyan-400" />,
      tips: [
        'Sidebar shows your current wallet address',
        'Displays ADA balance from connected wallet',
        'Switch views to organize your workflow',
        'Archives protect notes from accidental deletion',
      ],
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-6 h-6 text-slate-300" />
            </motion.button>

            {/* Progress bar */}
            <div className="h-1 bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              />
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              {/* Step counter and title */}
              <div className="mb-8">
                <motion.p
                  key={currentStep}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-cyan-400 mb-2"
                >
                  Step {currentStep + 1} of {steps.length}
                </motion.p>

                <motion.h2
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl font-bold mb-4"
                >
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {step.title}
                  </span>
                </motion.h2>

                <motion.p
                  key={`desc-${currentStep}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-400 text-lg"
                >
                  {step.description}
                </motion.p>
              </div>

              {/* Icon */}
              <motion.div
                key={`icon-${currentStep}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="flex justify-center mb-8"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(6, 182, 212, 0.3)',
                        '0 0 40px rgba(168, 85, 247, 0.3)',
                        '0 0 20px rgba(6, 182, 212, 0.3)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-3xl"
                  />
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
              </motion.div>

              {/* Tips */}
              <motion.div
                key={`tips-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
              >
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-cyan-400" />
                  Key Points
                </h3>
                <ul className="space-y-2">
                  {step.tips.map((tip, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.05 }}
                      className="text-slate-400 text-sm flex items-start gap-3"
                    >
                      <span className="text-cyan-400 font-bold mt-1 flex-shrink-0">→</span>
                      <span>{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>

                {/* Dot indicators */}
                <div className="flex gap-2">
                  {steps.map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentStep
                          ? 'bg-cyan-400 w-8'
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                      whileHover={{ scale: 1.2 }}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>

              {/* Finish button on last step */}
              {currentStep === steps.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onClose}
                  className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-semibold"
                >
                  Let&apos;s Get Started! 🚀
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
