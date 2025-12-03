import { useState } from 'react';
import { Toaster } from 'sonner';
import { Homepage } from './components/Homepage';
import { NotesApp } from './components/NotesApp';
import { connectWallet, getWalletAddress } from './utils/cardano';

interface WalletUser {
  address: string;
  walletApi: any;
}

export default function App() {
  const [user, setUser] = useState<WalletUser | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Connect to LACE wallet via CIP-30
      const walletApi = await connectWallet('lace');
      
      // Get wallet address
      const address = await getWalletAddress(walletApi);
      
      setUser({
        address,
        walletApi,
      });
      
      console.log('✅ Wallet connected:', address);
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      setError(err.message || 'Failed to connect wallet. Please ensure LACE wallet is installed and unlocked.');
      alert(err.message || 'Failed to connect wallet. Please install LACE wallet extension.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setUser(null);
    setError('');
  };

  // Show notes app if wallet is connected
  if (user) {
    return (
      <>
        <NotesApp user={user} onDisconnect={handleDisconnect} />
        <Toaster 
          position="top-right" 
          richColors 
          theme="dark"
          closeButton
          expand={true}
        />
      </>
    );
  }

  // Show homepage with wallet connect button
  return (
    <div>
      <Homepage onWalletConnect={handleWalletConnect} />
      <Toaster 
        position="top-right" 
        richColors 
        theme="dark"
        closeButton
        expand={true}
      />
      
      {/* Connection status overlay */}
      {isConnecting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-white text-center">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Connecting to LACE wallet...</p>
            <p className="text-sm text-slate-400 mt-2">Please approve the connection in your wallet extension</p>
          </div>
        </div>
      )}
    </div>
  );
}
