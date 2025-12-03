import { useEffect } from 'react';
import { getPendingNotes, updateTransactionStatus } from '../utils/database';
import { checkTransactionStatus } from '../utils/cardano';

// Background worker that checks transaction status every 20 seconds
export const useBlockchainSync = () => {
  useEffect(() => {
    const syncBlockchainState = async () => {
      try {
        // Get all notes with pending status
        const pendingNotes = getPendingNotes();
        
        if (pendingNotes.length === 0) return;

        console.log(`Checking ${pendingNotes.length} pending transactions...`);

        // Check each pending transaction
        for (const note of pendingNotes) {
          if (!note.txHash) continue;

          try {
            const status = await checkTransactionStatus(note.txHash);
            
            if (status === 'confirmed') {
              console.log(`✅ Transaction confirmed: ${note.txHash}`);
              updateTransactionStatus(note.id, note.txHash, 'confirmed');
            } else if (status === 'failed') {
              console.log(`❌ Transaction failed: ${note.txHash}`);
              updateTransactionStatus(note.id, note.txHash, 'failed');
            } else {
              console.log(`⏳ Transaction still pending: ${note.txHash}`);
            }
          } catch (error) {
            console.error(`Failed to check transaction ${note.txHash}:`, error);
          }
        }
      } catch (error) {
        console.error("Blockchain sync error:", error);
      }
    };

    // Run immediately on mount
    syncBlockchainState();

    // Set up interval to check every 20 seconds
    const interval = setInterval(syncBlockchainState, 20000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);
};
