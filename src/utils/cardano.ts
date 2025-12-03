// Cardano utilities for Blocknotes
// Branch: feature/Lapure-frontend_wallet_connection
// Implements real CIP-30 wallet connection with proper address conversion

import { bech32 } from 'bech32';
import { Blaze, Core } from '@blaze-cardano/sdk';
import { WebWallet } from '@blaze-cardano/wallet';
import { Blockfrost } from '@blaze-cardano/query';

// Environment configuration (from .env file)
const BLOCKFROST_PROJECT_ID = import.meta.env.VITE_BLOCKFROST_PROJECT_ID || "previewV63zyo5P3KVq5Godjvhb1FB7pwSwfVOE";
const BLOCKFROST_API_URL = import.meta.env.VITE_BLOCKFROST_API_URL || "https://cardano-preview.blockfrost.io/api/v0";
const RECEIVER_ADDRESS = import.meta.env.VITE_RECEIVER_ADDRESS || "addr_test1qrazn8m6hg22tj46uxv8428pn08emqsp5x6r4hfrmwwj79dqx72yxnsx5u4a428mqkn54gr0aevsa4dpusslr22vppfqrjp6p4";
const CARDANO_NETWORK = import.meta.env.VITE_CARDANO_NETWORK || "preview";

// Your metadata label - unique identifier for your app
const METADATA_LABEL = BigInt(import.meta.env.VITE_METADATA_LABEL || 42819);

// Network IDs for Cardano
const NETWORK_IDS = {
  mainnet: 1,
  preview: 0,
  preprod: 0,
  testnet: 0,
} as const;

// Export receiver address for use in transactions
export const getReceiverAddress = (): string => RECEIVER_ADDRESS;

// Export network info
export const getNetworkConfig = () => ({
  network: CARDANO_NETWORK,
  blockfrostUrl: BLOCKFROST_API_URL,
  blockfrostProjectId: BLOCKFROST_PROJECT_ID,
});

// Initialize a Blockfrost provider for Blaze
export const createBlockfrostProvider = () => {
  if (!BLOCKFROST_PROJECT_ID) {
    throw new Error('VITE_BLOCKFROST_PROJECT_ID is not configured.');
  }

  // Blaze Blockfrost expects the logical network name; we map our env
  const network =
    CARDANO_NETWORK === 'mainnet'
      ? 'cardano-mainnet'
      : CARDANO_NETWORK === 'preview'
      ? 'cardano-preview'
      : CARDANO_NETWORK === 'preprod'
      ? 'cardano-preprod'
      : 'cardano-preview';

  console.log('🔧 Initializing Blockfrost provider with network:', network);

  return new Blockfrost({
    network,
    projectId: BLOCKFROST_PROJECT_ID,
  });
};

// Helper function to chunk long strings (Cardano has 64-byte limit per string)
export const chunkString = (content: string): string[] => {
  if (content.length <= 64) {
    return [content];
  }
  const chunks = content.match(/.{1,64}/g) || [];
  return chunks;
};

// Helper: format long strings into Metadatum (either Text or List)
const formatContent = (content: string): Core.Metadatum => {
  // CASE 1: SHORT STRING (FITS IN ONE CHUNK)
  if (content.length <= 64) {
    return Core.Metadatum.newText(content);
  }

  // CASE 2: LONG STRING (NEEDS SPLITTING)
  const chunks = chunkString(content);
  const list = new Core.MetadatumList();
  
  chunks.forEach(chunk => {
    list.add(Core.Metadatum.newText(chunk));
  });

  return Core.Metadatum.newList(list);
};

// Real implementation using Blaze SDK
export const sendNoteTransaction = async (
  provider: Blockfrost,
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

  // Basic env verification to help debug
  console.log('🔧 Environment Variables Loaded:');
  console.log('BLOCKFROST_PROJECT_ID:', BLOCKFROST_PROJECT_ID ? '✅ Loaded' : '❌ Missing');
  console.log('RECEIVER_ADDRESS:', RECEIVER_ADDRESS ? '✅ Loaded' : '❌ Missing');
  console.log('CARDANO_NETWORK:', CARDANO_NETWORK);

  try {
    if (!walletApi) {
      throw new Error('Wallet API not available. Please connect your wallet first.');
    }

    console.log('👛 Initializing WebWallet...');
    const wallet = new WebWallet(walletApi as any);

    console.log('⚡ Creating Blaze instance...');
    const blaze = await Blaze.from(provider, wallet);

    let tx = blaze
      .newTransaction()
      .payLovelace(Core.Address.fromBech32(targetAddress), BigInt(lovelaceAmount));

    // --- METADATA CONSTRUCTION ---
    // STEP 1: Initialize the top-level container (standard JavaScript Map)
    const metadata = new Map<bigint, Core.Metadatum>();

    // STEP 2: Create the inner data structure (MetadatumMap)
    const metadatumMap = new Core.MetadatumMap();

    // STEP 3: Insert key-value pairs into the inner map
    metadatumMap.insert(
      Core.Metadatum.newText('action'),
      Core.Metadatum.newText(action)
    );
    metadatumMap.insert(
      Core.Metadatum.newText('note_id'),
      Core.Metadatum.newText(noteId)
    );
    metadatumMap.insert(
      Core.Metadatum.newText('title'),
      formatContent(noteTitle)
    );
    metadatumMap.insert(
      Core.Metadatum.newText('note'),
      formatContent(noteContent)
    );
    metadatumMap.insert(
      Core.Metadatum.newText('created_at'),
      Core.Metadatum.newText(new Date().toISOString())
    );

    // STEP 4: Wrap the inner MetadatumMap into a generic Metadatum object
    const metadatum = Core.Metadatum.newMap(metadatumMap);

    // STEP 5: Assign the data to your specific label in the top-level Map
    metadata.set(METADATA_LABEL, metadatum);

    // STEP 6: Convert the JavaScript Map to the final Metadata type required by Blaze
    const finalMetadata = new Core.Metadata(metadata);

    // STEP 7: Attach the metadata to the transaction
    tx = tx.setMetadata(finalMetadata);

    console.log('🏗️ Completing transaction...');
    const completedTx = await tx.complete();

    console.log('✍️ Requesting wallet signature...');
    const signedTx = await blaze.signTransaction(completedTx);

    console.log('📤 Submitting transaction to Blockfrost...');
    const txId = await blaze.provider.postTransactionToChain(signedTx);

    console.log('✅ Transaction submitted with ID:', txId);
    return txId;
  } catch (error: any) {
    console.error('❌ Transaction failed:', error);

    if (error?.message?.includes('Failed to fetch')) {
      throw new Error(
        '❌ Network error: Failed to fetch from Blockfrost. Your internet connection may be blocked or down.'
      );
    }

    // Surface Blaze / wallet errors
    throw new Error(error.message || 'Transaction failed. Please try again.');
  }
};

// Check if wallet is available (CIP-30)
export const isWalletAvailable = (walletName: string = 'lace'): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window.cardano && window.cardano[walletName]);
};

// Get list of available wallets
export const getAvailableWallets = (): string[] => {
  if (typeof window === 'undefined' || !window.cardano) return [];
  
  const walletNames: string[] = [];
  const supportedWallets = ['lace', 'nami', 'eternl', 'flint', 'yoroi', 'typhon', 'gerowallet'];
  
  for (const walletName of supportedWallets) {
    if (window.cardano[walletName]) {
      walletNames.push(walletName);
    }
  }
  
  return walletNames;
};

// Connect to wallet (CIP-30) - Opens authentication window
export const connectWallet = async (walletName: string = 'lace'): Promise<any> => {
  if (!isWalletAvailable(walletName)) {
    const availableWallets = getAvailableWallets();
    if (availableWallets.length > 0) {
      throw new Error(
        `${walletName.toUpperCase()} wallet not found. Available wallets: ${availableWallets.join(', ')}. ` +
        `Please install LACE wallet extension from https://www.lace.io/`
      );
    }
    throw new Error(`No Cardano wallets found. Please install LACE wallet extension from https://www.lace.io/`);
  }

  try {
    // Additional safety check for window.cardano
    if (!window.cardano || !window.cardano[walletName]) {
      throw new Error(`${walletName.toUpperCase()} wallet not accessible. Please refresh the page or reinstall the wallet extension.`);
    }

    console.log(`🔗 Requesting connection to ${walletName.toUpperCase()} wallet...`);
    
    // This opens the wallet popup for user to approve dApp connection
    const walletApi = await window.cardano[walletName].enable();
    
    console.log(`✅ ${walletName.toUpperCase()} wallet connected successfully!`);
    
    // Verify network after connection
    const networkId = await walletApi.getNetworkId();
    const expectedNetworkId = NETWORK_IDS[CARDANO_NETWORK as keyof typeof NETWORK_IDS] ?? 0;
    
    console.log(`🌐 Connected to network ID: ${networkId} (expected: ${expectedNetworkId} for ${CARDANO_NETWORK})`);
    
    if (networkId !== expectedNetworkId) {
      throw new Error(
        `Wrong network! Please switch your wallet to the ${CARDANO_NETWORK.toUpperCase()} network. ` +
        `Current network ID: ${networkId}, Expected: ${expectedNetworkId}`
      );
    }
    
    return walletApi;
  } catch (error: any) {
    console.error("Failed to connect wallet:", error);
    
    // Handle user rejection specifically
    if (error.code === -2 || error.message?.includes('reject') || error.message?.includes('denied')) {
      throw new Error("Wallet connection was rejected. Please approve the connection in your wallet.");
    }
    
    throw new Error(error.message || "Failed to connect wallet. Please try again.");
  }
};

// Convert hex bytes to bech32 address (real implementation)
const hexToBech32Address = (hexAddress: string): string => {
  try {
    // Remove '0x' prefix if present
    const cleanHex = hexAddress.startsWith('0x') ? hexAddress.slice(2) : hexAddress;
    
    // Convert hex string to bytes
    const bytes: number[] = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substring(i, i + 2), 16));
    }
    
    // Determine prefix based on network byte (first byte)
    // Network ID is encoded in the first nibble of the first byte
    const networkByte = bytes[0] & 0x0f;
    const prefix = networkByte === 1 ? 'addr' : 'addr_test';
    
    // Convert bytes to 5-bit words for bech32 encoding
    const words = bech32.toWords(new Uint8Array(bytes));
    
    // Encode to bech32
    const bech32Address = bech32.encode(prefix, words, 200); // 200 is max length for Cardano addresses
    
    return bech32Address;
  } catch (error) {
    console.error("Failed to convert hex to bech32:", error);
    throw new Error("Invalid address format from wallet");
  }
};

// Get wallet address (real implementation)
export const getWalletAddress = async (walletApi: any): Promise<string> => {
  try {
    console.log("📍 Fetching wallet addresses...");
    
    // Try to get used addresses first (addresses that have received transactions)
    const usedAddressesHex = await walletApi.getUsedAddresses();
    console.log(`Found ${usedAddressesHex?.length || 0} used addresses`);

    if (usedAddressesHex && usedAddressesHex.length > 0) {
      const address = hexToBech32Address(usedAddressesHex[0]);
      console.log("✅ Using used address:", address);
      return address;
    }

    // Fallback to unused addresses (fresh addresses)
    const unusedAddressesHex = await walletApi.getUnusedAddresses();
    console.log(`Found ${unusedAddressesHex?.length || 0} unused addresses`);
    
    if (unusedAddressesHex && unusedAddressesHex.length > 0) {
      const address = hexToBech32Address(unusedAddressesHex[0]);
      console.log("✅ Using unused address:", address);
      return address;
    }

    // Last resort: get change address
    const changeAddressHex = await walletApi.getChangeAddress();
    if (changeAddressHex) {
      const address = hexToBech32Address(changeAddressHex);
      console.log("✅ Using change address:", address);
      return address;
    }

    throw new Error("No addresses found in wallet. Please ensure your wallet has been initialized.");
  } catch (error: any) {
    console.error("Failed to get wallet address:", error);
    throw new Error(error.message || "Failed to retrieve wallet address");
  }
};

// Decode CBOR integer from hex string
// CBOR encoding: https://www.rfc-editor.org/rfc/rfc8949.html
const decodeCborInt = (hex: string, offset: number = 0): { value: bigint; bytesRead: number } => {
  const firstByte = parseInt(hex.substring(offset, offset + 2), 16);
  const majorType = firstByte >> 5;
  const additionalInfo = firstByte & 0x1f;
  
  // Major type 0 = unsigned integer
  if (majorType !== 0) {
    throw new Error(`Expected unsigned integer (major type 0), got ${majorType}`);
  }
  
  if (additionalInfo < 24) {
    // Value is in the additional info itself
    return { value: BigInt(additionalInfo), bytesRead: 2 };
  } else if (additionalInfo === 24) {
    // Next 1 byte is the value
    const value = parseInt(hex.substring(offset + 2, offset + 4), 16);
    return { value: BigInt(value), bytesRead: 4 };
  } else if (additionalInfo === 25) {
    // Next 2 bytes are the value
    const value = parseInt(hex.substring(offset + 2, offset + 6), 16);
    return { value: BigInt(value), bytesRead: 6 };
  } else if (additionalInfo === 26) {
    // Next 4 bytes are the value
    const value = parseInt(hex.substring(offset + 2, offset + 10), 16);
    return { value: BigInt(value), bytesRead: 10 };
  } else if (additionalInfo === 27) {
    // Next 8 bytes are the value
    const highHex = hex.substring(offset + 2, offset + 10);
    const lowHex = hex.substring(offset + 10, offset + 18);
    const value = (BigInt('0x' + highHex) << 32n) | BigInt('0x' + lowHex);
    return { value, bytesRead: 18 };
  }
  
  throw new Error(`Unsupported CBOR additional info: ${additionalInfo}`);
};

// Get wallet balance (real implementation - returns ADA as string)
export const getWalletBalance = async (walletApi: any): Promise<string> => {
  try {
    const balanceCbor = await walletApi.getBalance();
    console.log('📊 Raw balance CBOR:', balanceCbor);
    
    let lovelace: bigint;
    
    // Check the first byte to determine structure
    const firstByte = parseInt(balanceCbor.substring(0, 2), 16);
    const majorType = firstByte >> 5;
    
    if (majorType === 0) {
      // Simple unsigned integer (just lovelace, no tokens)
      const result = decodeCborInt(balanceCbor, 0);
      lovelace = result.value;
    } else if (majorType === 4 || majorType === 5) {
      // Array or Map - balance with tokens
      // Format: [lovelace, {policy_id: {asset_name: amount}}]
      // Skip the array/map marker and read the first integer (lovelace)
      // Array marker: 82 (2-element array), 83 (3-element), etc.
      const result = decodeCborInt(balanceCbor, 2); // Skip first byte (array marker)
      lovelace = result.value;
    } else {
      console.warn('Unknown CBOR format, attempting direct parse');
      // Fallback: try to parse as simple hex
      lovelace = BigInt('0x' + balanceCbor);
    }
    
    // Convert lovelace to ADA (1 ADA = 1,000,000 lovelace)
    const ada = Number(lovelace) / 1_000_000;
    
    console.log(`💰 Wallet balance: ${ada.toFixed(2)} ADA (${lovelace} lovelace)`);
    
    // Format with commas for display
    return ada.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch (error) {
    console.error("Failed to get wallet balance:", error);
    return "0.00";
  }
};

// Get network ID from wallet
export const getWalletNetworkId = async (walletApi: any): Promise<number> => {
  try {
    const networkId = await walletApi.getNetworkId();
    return networkId;
  } catch (error) {
    console.error("Failed to get network ID:", error);
    return -1;
  }
};

// Get network name from ID
export const getNetworkName = (networkId: number): string => {
  switch (networkId) {
    case 1:
      return 'Mainnet';
    case 0:
      return 'Preview (Testnet)';
    default:
      return 'Unknown';
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
