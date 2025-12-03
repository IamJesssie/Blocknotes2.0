import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Wallet, Cloud, Zap, Shield, Blocks } from 'lucide-react';
import { IsometricGrid } from './IsometricGrid';

interface HomepageProps {
  onWalletConnect: () => void;
}

export function Homepage({ onWalletConnect }: HomepageProps) {
  const features = [
    {
      icon: Blocks,
      title: 'Block-Based Notes',
      description: 'Organize your thoughts in beautiful, animated blocks'
    },
    {
      icon: Cloud,
      title: 'IPFS Storage',
      description: 'Decentralized storage powered by Blockfrost IPFS'
    },
    {
      icon: Shield,
      title: 'Web3 Wallet',
      description: 'Connect with LACE wallet via CIP-30'
    },
    {
      icon: Zap,
      title: 'Blaze SDK',
      description: 'Lightning-fast blockchain interactions'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Isometric Grid */}
        <IsometricGrid />

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 flex items-center justify-between max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3">
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
                TEXAS HOLDEM
              </h2>
              <p className="text-xs text-slate-500"></p>
            </div>
          </div>

        </motion.header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur-2xl opacity-50"
                />
                <div className="relative bg-slate-900 p-8 rounded-3xl border border-slate-700">
                  <Blocks className="w-24 h-24 text-cyan-400" />
                </div>
              </div>
            </motion.div>

            <h1 className="text-7xl mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Blocknotes
            </h1>

            <p className="text-2xl text-slate-400 mb-8 max-w-3xl mx-auto">
              The future of note-taking is here. Experience Web3-powered notes with
              <span className="text-cyan-400"> blockchain integration</span>,
              <span className="text-purple-400"> decentralized storage</span>, and
              <span className="text-pink-400"> wallet connectivity</span>.
            </p>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onWalletConnect}
              className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl text-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all inline-flex items-center gap-3"
            >
              <Wallet className="w-6 h-6" />
              Connect LACE Wallet
            </motion.button>

            <p className="text-sm text-slate-500 mt-4">
              Wallet authentication via CIP-30 protocol
            </p>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 py-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, rotateY: 5 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />

                  <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl inline-block mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Demo Preview */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur-3xl opacity-30" />

            <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-8 overflow-hidden">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5, rotateY: 5 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                  >
                    <div className={`h-2 rounded mb-3 bg-gradient-to-r ${['from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500'][i % 3]
                      }`} />
                    <div className="h-3 bg-slate-700 rounded mb-2" />
                    <div className="h-3 bg-slate-700 rounded w-3/4" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
            <p>© 2025 Blocknotes. A Web3 Note-Taking Experience.</p>
            <p className="mt-2">Built with LACE • CIP-30 • Blockfrost • Blaze SDK</p>
          </div>
        </footer>
      </div>
    </div>
  );
}