import { useEffect } from 'react';
import { getPendingNotes, updateTransactionStatus } from '../utils/database';
import { checkTransactionStatus } from '../utils/cardano';

// Minimum age (ms) before checking a transaction - gives blockchain time to propagate
const MIN_TX_AGE_MS = 10000; // 10 seconds

// Background worker that checks transaction status every 20 seconds
export const useBlockchainSync = () => {
  useEffect(() => {
    const syncBlockchainState = async () => {
      try {
        // Get all notes with pending status
        const pendingNotes = getPendingNotes();
        
        if (pendingNotes.length === 0) return;

        const now = Date.now();
        
        // Filter out transactions that are too new (not yet propagated)
        const readyToCheck = pendingNotes.filter(note => {
          const latestTx = note.transactions[0];
          if (!latestTx) return false;
          const txAge = now - latestTx.timestamp;
          if (txAge < MIN_TX_AGE_MS) {
            console.log(`⏳ Transaction too new (${Math.round(txAge/1000)}s old), waiting: ${note.txHash?.substring(0, 16)}...`);
            return false;
          }
          return true;
        });

        if (readyToCheck.length === 0) return;

        console.log(`Checking ${readyToCheck.length} pending transactions...`);

        // Check each pending transaction
        for (const note of readyToCheck) {
          if (!note.txHash) continue;

          try {
            const status = await checkTransactionStatus(note.txHash);
            
            if (status === 'confirmed') {
              console.log(`✅ Transaction confirmed: ${note.txHash}`);
              const cardanoscanUrl = `https://preview.cardanoscan.io/transaction/${note.txHash}`;
              console.log(`%c🔗 View on Cardanoscan: ${cardanoscanUrl}`, 'color: #22c55e; font-weight: bold;');
              console.log(`💡 Or run: window.open('${cardanoscanUrl}')`);
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

    // Don't run immediately - wait 10 seconds after mount to allow new txs to propagate
    const initialDelay = setTimeout(syncBlockchainState, 10000);

    // Set up interval to check every 20 seconds
    const interval = setInterval(syncBlockchainState, 20000);

    // Cleanup on unmount
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);
};
