// Cardano utilities for Blocknotes
// NOTE: This is a mock implementation for the browser environment.
// For production, install Blaze SDK locally with proper bundling:
// npm install @blaze-cardano/sdk@0.3.0 @blaze-cardano/query@0.3.0 @blaze-cardano/wallet@0.3.0

// Blockfrost configuration
const BLOCKFROST_PROJECT_ID = "YOUR_BLOCKFROST_PROJECT_ID_HERE"; // Replace with your actual project ID
const BLOCKFROST_API_URL = "https://cardano-preview.blockfrost.io/api/v0";

// Your metadata label - unique identifier for your app
const METADATA_LABEL = 42819n;

// Helper function to chunk long strings (Cardano has 64-byte limit per string)
export const chunkString = (content: string): string[] => {
  if (content.length <= 64) {
    return [content];
  }
  const chunks = content.match(/.{1,64}/g) || [];
  return chunks;
};

// Mock implementation - Replace with real Blaze SDK in production
export const sendNoteTransaction = async (
  walletApi: any,
  targetAddress: string,
  lovelaceAmount: string,
  noteContent: string,
  noteTitle: string,
  action: 'create' | 'update' | 'delete',
  noteId: string
): Promise<string> => {

  console.log('📝 Transaction Details:');
  console.log('Action:', action);
  console.log('Note ID:', noteId);
  console.log('Title:', noteTitle);
  console.log('Content:', noteContent);
  console.log('Target Address:', targetAddress);
  console.log('Amount:', lovelaceAmount, 'lovelace');

  // Build metadata structure (this is what will go on-chain)
  const metadata = {
    [METADATA_LABEL.toString()]: {
      action: action,
      note_id: noteId,
      title: chunkString(noteTitle),
      note: chunkString(noteContent),
      created_at: new Date().toISOString()
    }
  };

  console.log('📦 Metadata:', JSON.stringify(metadata, null, 2));

  // PRODUCTION CODE (uncomment when you have proper build setup):
  /*
  import { Blaze, Core } from "@blaze-cardano/sdk";
  import { Blockfrost } from "@blaze-cardano/query";
  
  const provider = new Blockfrost({
    network: 'preview',
    projectId: BLOCKFROST_PROJECT_ID
  });
  
  const wallet = await WebWallet.connect(walletApi);
  const blaze = await Blaze.from(provider, wallet);
  
  let tx = blaze
    .newTransaction()
    .payLovelace(Core.Address.fromBech32(targetAddress), BigInt(lovelaceAmount));
  
  const metadatumMap = new Core.MetadatumMap();
  metadatumMap.insert(Core.Metadatum.newText("action"), Core.Metadatum.newText(action));
  metadatumMap.insert(Core.Metadatum.newText("note_id"), Core.Metadatum.newText(noteId));
  metadatumMap.insert(Core.Metadatum.newText("title"), formatContent(noteTitle));
  metadatumMap.insert(Core.Metadatum.newText("note"), formatContent(noteContent));
  metadatumMap.insert(Core.Metadatum.newText("created_at"), Core.Metadatum.newText(new Date().toISOString()));
  
  const metadatum = Core.Metadatum.newMap(metadatumMap);
  const metadataMap = new Map();
  metadataMap.set(METADATA_LABEL, metadatum);
  const finalMetadata = new Core.Metadata(metadataMap);
  
  tx = tx.setMetadata(finalMetadata);
  
  const completedTx = await tx.complete();
  const signedTx = await blaze.signTransaction(completedTx);
  const txId = await blaze.provider.postTransactionToChain(signedTx);
  
  return txId;
  */

  // DEMO MODE: Simulate transaction
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockTxId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      resolve(mockTxId);
    }, 1500); // Simulate network delay
  });
};

// Check if wallet is available (CIP-30)
export const isWalletAvailable = (walletName: string = 'lace'): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window.cardano && window.cardano[walletName]);
};

// Connect to wallet (CIP-30)
export const connectWallet = async (walletName: string = 'lace'): Promise<any> => {
  if (!isWalletAvailable(walletName)) {
    throw new Error(`${walletName.toUpperCase()} wallet not found. Please install LACE wallet extension from https://www.lace.io/`);
  }

  try {
    // Additional safety check for window.cardano
    if (!window.cardano || !window.cardano[walletName]) {
      throw new Error(`${walletName.toUpperCase()} wallet not accessible. Please refresh the page or reinstall the wallet extension.`);
    }

    const walletApi = await window.cardano[walletName].enable();
    return walletApi;
  } catch (error: any) {
    console.error("Failed to connect wallet:", error);
    throw new Error(error.message || "User rejected wallet connection");
  }
};

// Get wallet address
export const getWalletAddress = async (walletApi: any): Promise<string> => {
  try {
    // Try to get used addresses first
    const usedAddressesHex = await walletApi.getUsedAddresses();

    if (usedAddressesHex && usedAddressesHex.length > 0) {
      // Convert from hex to bech32
      const address = hexToBech32(usedAddressesHex[0]);
      return address;
    }

    // Fallback to unused addresses
    const unusedAddressesHex = await walletApi.getUnusedAddresses();
    if (unusedAddressesHex && unusedAddressesHex.length > 0) {
      const address = hexToBech32(unusedAddressesHex[0]);
      return address;
    }

    throw new Error("No addresses found in wallet");
  } catch (error: any) {
    console.error("Failed to get wallet address:", error);

    // Return a mock address for demo purposes
    return "addr_test1qz..." + Math.random().toString(36).substring(7);
  }
};

// Helper to convert hex address to bech32 (simplified for demo)
const hexToBech32 = (hex: string): string => {
  // In production, use @emurgo/cardano-serialization-lib-browser
  // For demo, return a formatted preview address
  return `addr_test1qp${hex.substring(0, 50)}...`;
};

// Get wallet balance
export const getWalletBalance = async (walletApi: any): Promise<string> => {
  try {
    const balanceHex = await walletApi.getBalance();
    // In production, parse this properly
    // For demo, return a formatted amount
    return "5.000000"; // 5 ADA
  } catch (error) {
    console.error("Failed to get wallet balance:", error);
    return "0.000000";
  }
};

// Check transaction status using Blockfrost
export const checkTransactionStatus = async (txHash: string): Promise<'confirmed' | 'pending' | 'failed'> => {
  // Skip checking demo transactions
  if (txHash.startsWith('demo_')) {
    // Simulate confirmation after 20 seconds
    const txTimestamp = parseInt(txHash.split('_')[1]);
    const now = Date.now();
    const elapsed = now - txTimestamp;

    if (elapsed > 20000) {
      return 'confirmed';
    } else {
      return 'pending';
    }
  }

  // Real transaction check
  try {
    if (BLOCKFROST_PROJECT_ID === "YOUR_BLOCKFROST_PROJECT_ID_HERE") {
      console.warn("⚠️ Blockfrost Project ID not configured. Using demo mode.");
      return 'pending';
    }

    const response = await fetch(`${BLOCKFROST_API_URL}/txs/${txHash}`, {
      headers: {
        'project_id': BLOCKFROST_PROJECT_ID
      }
    });

    if (response.ok) {
      return 'confirmed';
    } else if (response.status === 404) {
      return 'pending';
    } else {
      console.error("Blockfrost error:", response.status);
      return 'failed';
    }
  } catch (error) {
    console.error("Failed to check transaction:", error);
    return 'pending';
  }
};

// Declare CIP-30 types for TypeScript
declare global {
  interface Window {
    cardano?: {
      [key: string]: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
        apiVersion: string;
        name: string;
        icon: string;
      };
    };
  }
}

// Export types for use in other files
export interface CardanoWalletApi {
  getNetworkId: () => Promise<number>;
  getUtxos: () => Promise<string[]>;
  getBalance: () => Promise<string>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  getRewardAddresses: () => Promise<string[]>;
  signTx: (tx: string, partialSign: boolean) => Promise<string>;
  signData: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
  submitTx: (tx: string) => Promise<string>;
}
