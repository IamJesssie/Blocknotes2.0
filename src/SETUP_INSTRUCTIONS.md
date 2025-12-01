# Blocknotes - Web3 Note-Taking App Setup

## 🚀 Project Overview

Blocknotes is a Web3-powered note-taking application that integrates with:
- **LACE Wallet** (CIP-30 authentication)
- **Blaze SDK** (Cardano transaction building)
- **Blockfrost API** (Blockchain querying & IPFS)
- **Motion/Framer Motion** (Smooth animations)

---

## 📦 Installation

### 1. Install Required Packages

```bash
# Core Cardano/Web3 dependencies
npm install @blaze-cardano/sdk@0.3.0
npm install @blaze-cardano/query@0.3.0
npm install @blaze-cardano/wallet@0.3.0
npm install @blaze-cardano/core@0.3.0

# Blockfrost for blockchain queries
npm install @blockfrost/blockfrost-js@5.4.0

# Already included in Figma Make:
# - react@18+
# - motion (Framer Motion)
# - tailwind CSS
```

### 2. Get Blockfrost API Key

1. Go to [blockfrost.io](https://blockfrost.io)
2. Sign up for a free account
3. Create a new project (select **Preview Network** for testing)
4. Copy your **Project ID**

### 3. Configure Blockfrost

Open `/utils/cardano.ts` and replace the placeholder:

```typescript
const BLOCKFROST_PROJECT_ID = "YOUR_BLOCKFROST_PROJECT_ID_HERE";
```

With your actual project ID:

```typescript
const BLOCKFROST_PROJECT_ID = "previewABCD1234...";
```

### 4. Install LACE Wallet

1. Download LACE wallet extension:
   - Chrome: https://chrome.google.com/webstore (search "LACE")
   - Firefox: https://addons.mozilla.org (search "LACE")
2. Create a new wallet or restore existing
3. Switch to **Preview Network** (for testing)
4. Get some test ADA from faucet: https://docs.cardano.org/cardano-testnet/tools/faucet/

---

## 🔧 Implementation Steps

### Current State: DEMO Mode

Right now, the app is in **DEMO mode**. When you create/update/delete notes:
- ✅ Notes save to local database immediately (good UX)
- ✅ Mock transaction hash is generated
- ✅ Status shows "Pending" → simulated "Confirmed"
- ❌ NOT actually submitting to blockchain yet

### To Enable REAL Blockchain Transactions:

#### Step 1: Set up Blockfrost Provider

In `/components/NotesApp.tsx`, around line 83, replace the commented code:

```typescript
// TODO: Replace with actual Blockfrost provider
// Uncomment when you have Blockfrost provider set up:

// 1. Import Blockfrost
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Blockfrost } from '@blaze-cardano/query';

// 2. Initialize provider (add this at the top of NotesApp component)
const blockfrost = new BlockFrostAPI({
  projectId: 'YOUR_BLOCKFROST_PROJECT_ID',
  network: 'preview' // Use 'preview' for testing
});

const provider = new Blockfrost({
  network: 'preview',
  projectId: 'YOUR_BLOCKFROST_PROJECT_ID'
});

// 3. Replace the demo code in submitToBlockchain function:
const txId = await sendNoteTransaction(
  provider, // Now using real provider!
  user.walletApi,
  user.address,
  '1000000', // 1 ADA minimum (1,000,000 lovelace)
  note.content,
  note.title,
  action,
  note.id
);

updateNoteTxHash(noteId, txId);
loadNotes();

console.log(`✅ Transaction submitted: ${txId}`);
alert(`🎉 Transaction submitted!\n\nTx Hash: ${txId}\n\nCheck Cardanoscan Preview: https://preview.cardanoscan.io/transaction/${txId}`);
```

---

## 🏗️ Architecture Flow

```
1. User clicks "New Block" → NoteEditor opens
                             ↓
2. User saves note → IMMEDIATELY saves to localStorage (instant feedback)
                             ↓
3. Background: Build Cardano transaction with metadata
                             ↓
4. LACE wallet prompts user to sign transaction
                             ↓
5. Transaction submitted to Cardano Preview network
                             ↓
6. Note status: "Pending" (yellow clock icon)
                             ↓
7. Background worker checks Blockfrost every 20 seconds
                             ↓
8. After ~20 seconds: Transaction confirmed on-chain
                             ↓
9. Note status: "Confirmed" (green checkmark icon)
```

---

## 📊 Database Schema (localStorage)

```typescript
interface Note {
  id: string;
  address: string;        // Wallet address
  txHash: string | null;  // Cardano transaction hash
  status: 'pending' | 'confirmed' | 'failed';
  title: string;
  content: string;
  color: string;
  attachments: string[];
  archived: boolean;
  trashed: boolean;
  createdAt: number;
  updatedAt: number;
}
```

---

## 🔐 Security Features

### Wallet-Based Authentication
- **No passwords**: Wallet signature proves ownership
- **CIP-30 standard**: Industry standard for Cardano dApps
- **User controls keys**: Private keys never leave the wallet

### Attack Prevention
From your whiteboard diagram concern:
- ✅ Users must connect wallet to submit transactions
- ✅ Transaction signing requires user approval (can't be automated)
- ✅ Each transaction costs ~0.17 ADA (makes spam expensive)
- ✅ Wallet address stored with each note (provenance tracking)

---

## 📝 Metadata Structure

When a note is submitted to the blockchain:

```json
{
  "42819": {  // Your app's unique label
    "action": "create",
    "note_id": "1732123456789",
    "title": "My First Note",
    "note": [
      "This is a long note that gets automatically chunked",
      "into 64-byte segments because Cardano has a limit",
      "per string in metadata. The helper function handles",
      "this automatically!"
    ],
    "created_at": "2025-12-01T07:35:07.339Z"
  }
}
```

---

## 🧪 Testing Flow

### Local Testing (DEMO mode - current state)
1. ✅ Open app → Click "Connect Wallet"
2. ✅ Create notes → See them save immediately
3. ✅ Check status badges (Pending → Confirmed simulation)
4. ✅ All CRUD operations work locally

### Production Testing (after Blockfrost setup)
1. Connect LACE wallet (Preview network)
2. Ensure you have test ADA (~5 ADA minimum)
3. Create a note → LACE prompts for signature
4. Sign transaction → Note shows "Pending"
5. Wait ~20 seconds → Status changes to "Confirmed"
6. Verify on Cardanoscan Preview: https://preview.cardanoscan.io

---

## 🎯 Features Implemented

### ✅ Completed
- [x] Wallet authentication (CIP-30)
- [x] Local database (localStorage)
- [x] Status tracking (pending/confirmed/failed)
- [x] Background worker (checks every 20 seconds)
- [x] Metadata construction with chunking
- [x] Transaction building code (Blaze SDK)
- [x] Interactive isometric grid background
- [x] Falling note animations with screen shake
- [x] Full CRUD operations

### 🚧 To Complete
- [ ] Add real Blockfrost provider initialization
- [ ] Uncomment real transaction submission code
- [ ] Test with Preview network
- [ ] Add error handling for failed transactions
- [ ] (Optional) Add IPFS storage via Blockfrost

---

## 🔍 Debugging

### Check if wallet is connected:
```javascript
console.log(window.cardano); // Should show lace, nami, etc.
console.log(window.cardano.lace); // Should be defined
```

### Check transaction status manually:
```bash
curl https://cardano-preview.blockfrost.io/api/v0/txs/YOUR_TX_HASH \
  -H "project_id: YOUR_BLOCKFROST_PROJECT_ID"
```

### Common Issues:
1. **"Wallet not found"**: Install LACE extension
2. **"Network mismatch"**: Set LACE to Preview network
3. **"Insufficient funds"**: Get test ADA from faucet
4. **"Transaction failed"**: Check wallet has enough ADA for fees (~0.17 ADA)

---

## 📚 Resources

- **Blaze SDK Docs**: https://blaze.butane.dev/
- **Blockfrost API**: https://docs.blockfrost.io/
- **CIP-30 Standard**: https://cips.cardano.org/cip/CIP-30
- **Cardano Preview Faucet**: https://docs.cardano.org/cardano-testnet/tools/faucet/
- **Cardanoscan Preview**: https://preview.cardanoscan.io

---

## 🎓 For Your Presentation

### Key Points to Mention:
1. **Why wallet-only auth?**: Web3 native, no backend passwords, user sovereignty
2. **Why local database?**: 20-second blockchain confirmation is bad UX - instant feedback is essential
3. **Status tracking**: Shows users when their notes are confirmed on-chain
4. **Metadata chunking**: Handles Cardano's 64-byte limit automatically
5. **Background worker**: Continuously syncs blockchain state without user intervention

### Demo Flow:
1. Show landing page with Web3 aesthetic
2. Click "Connect Wallet" → LACE prompts
3. Create note → Instant display (good UX)
4. Show "Pending" status badge
5. Wait ~20 seconds → Status changes to "Confirmed"
6. Show transaction on Cardanoscan Preview
7. Explain metadata structure

---

## 🚀 Next Steps (Future Enhancements)

1. **IPFS Integration**: Store note content on IPFS, only hash on-chain
2. **Multi-wallet support**: Add Nami, Eternl, Yoroi
3. **Mainnet deployment**: Switch from Preview to Mainnet
4. **NFT minting**: Turn notes into NFTs
5. **Shared notes**: Multi-signature notes for collaboration
6. **Export functionality**: Download notes as JSON with blockchain proof

---

Good luck with your final presentation! 🎉
