# Blocknotes 2.0 📝⛓️

## A Web3-Powered Note-Taking dApp on Cardano

Blocknotes is a decentralized note-taking application that combines the familiar experience of traditional note apps with the permanence and transparency of blockchain technology. Every note you create is stored both locally for instant access and on the Cardano blockchain for immutable, verifiable record-keeping.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Cardano](https://img.shields.io/badge/Cardano-Preview%20Network-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

---

## 🌟 Features

### Core Functionality
- ✅ **Wallet-Only Authentication** - Connect via LACE wallet (CIP-30 standard), no passwords required
- ✅ **Instant Note Creation** - Notes appear immediately in your local database
- ✅ **Blockchain Integration** - Every CRUD operation submits a transaction to Cardano
- ✅ **Status Tracking** - Visual indicators show note status (Pending → Confirmed → On-Chain)
- ✅ **Background Sync** - Automatic synchronization with blockchain every 20 seconds

### Note Management
- 📝 Rich text editing with markdown support
- 🎨 Color coding and categorization
- 📎 File attachments support
- 🗂️ Archive and trash functionality
- 🔍 Search and filter capabilities
- ⭐ Pin important notes

### Web3 Features
- 🔐 **Wallet-Based Auth** - Your private keys never leave your wallet
- ⛓️ **On-Chain Metadata** - Note content stored as transaction metadata
- 🔄 **Two-Way Sync** - Local cache + blockchain as source of truth
- 📊 **Transaction History** - View all note operations on Cardanoscan
- 🌐 **Decentralized** - No backend server required

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   User Interface (React)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Homepage   │  │  NotesApp    │  │  NoteEditor    │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────▼─────────┐
    │  Wallet Connect  │ (CIP-30 Standard)
    │   LACE / Nami    │
    └────────┬─────────┘
             │
    ┌────────▼──────────────────────────────────────┐
    │          Application Layer                     │
    │  ┌──────────────┐      ┌──────────────────┐  │
    │  │ localStorage │◄────►│ Background Sync  │  │
    │  │   (Cache)    │      │    Worker        │  │
    │  └──────────────┘      └─────────┬────────┘  │
    └─────────────────────────────────┬─────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │   Blaze SDK            │
                          │ (Transaction Builder)  │
                          └───────────┬────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │  Blockfrost API        │
                          │  (Blockchain Query))    │
                          └───────────┬────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │   Cardano Blockchain   │
                          │   (Preview Network)    │
                          │  Permanent Storage ⛓️  │
                          └────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Motion (Framer Motion)** - Animations
- **TailwindCSS** - Styling
- **shadcn/ui** - UI component library

### Blockchain & Web3
- **@blaze-cardano/sdk** - Transaction building
- **@blaze-cardano/wallet** - Wallet integration
- **@blockfrost/blockfrost-js** - Blockchain queries
- **CIP-30** - Cardano wallet standard

### Storage
- **localStorage** - Fast local cache
- **Cardano Metadata** - On-chain permanent storage

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** installed
2. **LACE Wallet** browser extension ([Get LACE](https://www.lace.io/))
3. **Cardano Preview Network** configured in wallet
4. **Test ADA** from preview faucet ([Get Test ADA](https://docs.cardano.org/cardano-testnet/tools/faucet/))

### Installation

```bash
# Clone the repository
git clone https://github.com/IamJesssie/Blocknotes2.0.git
cd Blocknotes2.0

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Configuration

1. **Get Blockfrost API Key**:
   - Sign up at [blockfrost.io](https://blockfrost.io)
   - Create a Preview Network project
   - Copy your Project ID

2. **Update Configuration**:
   ```typescript
   // src/utils/cardano.ts
   const BLOCKFROST_PROJECT_ID = "your_preview_project_id_here";
   ```

---

## 📖 Usage

### 1. Connect Wallet
- Click "Connect Wallet" on the homepage
- Approve connection in LACE wallet extension
- Ensure you're on Cardano Preview network

### 2. Create a Note
- Click "New Block" button
- Enter title and content
- Choose a color (optional)
- Click "Save Block"
- Note appears immediately with "Pending" status

### 3. Sign Transaction
- LACE wallet prompts for transaction signature
- Approve to submit note to blockchain
- Transaction fee: ~0.17 ADA

### 4. Track Status
- **Pending** (⏳ Yellow) - Transaction submitted, awaiting confirmation
- **Confirmed** (✅ Green) - Note is on-chain! (~20 seconds)
- **Failed** (❌ Red) - Transaction failed (check wallet balance)

### 5. Verify on Blockchain
- Click on a confirmed note to see transaction hash
- Visit [Cardanoscan Preview](https://preview.cardanoscan.io)
- Search your transaction hash to see metadata

---

## 👥 Team & Contributions

This project is developed by a team of 5 contributors, each working on specific features:

| Branch | Owner | Focus Area | Status |
|--------|-------|------------|--------|
| `feature/Lapure-frontend_wallet_connection` | **Lapure** | Wallet integration & UX | 🚧 In Progress |
| `feature/PepitoJL-blockchain_transaction_integration` | **PepitoJL** | Transaction building | 🚧 In Progress |
| `feature/PepitoJP-metadata_and_blockfrost` | **PepitoJP** | Metadata & Blockfrost API | 🚧 In Progress |
| `feature/Labuca-database_sync_worker` | **Labuca** | Background sync worker | 🚧 In Progress |
| `feature/Barrientos-ui_polish_and_testing` | **Barrientos** | UI polish & testing | 🚧 In Progress |

---

## 🔐 Security & Privacy

- ✅ **No Backend** - Fully client-side, no server to hack
- ✅ **Wallet Control** - Private keys never leave your wallet
- ✅ **User Sovereignty** - You own your data
- ✅ **On-Chain Proof** - Every note cryptographically verified
- ✅ **Transparent** - All transactions visible on blockchain

⚠️ **Note**: This is a Preview Network deployment. Do NOT use real ADA.

---

## 📚 Documentation

- [`SETUP_INSTRUCTIONS.md`](src/SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [`Finaltask.md`](Finaltask.md) - Project requirements
- [`GIT_SETUP_COMPLETE.md`](GIT_SETUP_COMPLETE.md) - Git workflow guide

---

## 🐛 Known Issues & Limitations

- **Demo Mode Active**: Real blockchain transactions require Blaze SDK setup
- **Preview Network Only**: Not deployed to Cardano mainnet
- **Metadata Size**: Notes limited by Cardano's 64-byte metadata chunks
- **Transaction Fees**: Each CRUD operation costs ~0.17 ADA
- **Wallet Required**: No fallback auth method

---

## 🛣️ Roadmap

### Phase 1 (Current)
- [x] Wallet connection (LACE)
- [x] Local database (localStorage)
- [x] Transaction utilities
- [x] Background sync worker
- [ ] Real blockchain transactions (in progress)
- [ ] Blockfrost integration (in progress)

### Phase 2 (Future)
- [ ] IPFS integration for large files
- [ ] Multi-wallet support (Nami, Eternl, Yoroi)
- [ ] Shared/collaborative notes
- [ ] NFT minting for special notes
- [ ] Export to JSON with blockchain proof

### Phase 3 (Mainnet)
- [ ] Mainnet deployment
- [ ] Fee optimization
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)

---

## 📄 License

This project is licensed under the MIT License.

### Third-Party Licenses
- UI components from [shadcn/ui](https://ui.shadcn.com/) (MIT License)
- Photos from [Unsplash](https://unsplash.com) ([Unsplash License](https://unsplash.com/license))

---

## 🙏 Acknowledgments

- **Cardano Community** for blockchain infrastructure
- **LACE Team** for excellent wallet UX
- **Blockfrost** for reliable API service
- **Blaze SDK** for transaction building tools
- **shadcn** for beautiful UI components

---

## 📞 Contact & Support

- **Repository**: [github.com/IamJesssie/Blocknotes2.0](https://github.com/IamJesssie/Blocknotes2.0)
- **Issues**: [Report a Bug](https://github.com/IamJesssie/Blocknotes2.0/issues)

---

<div align="center">

**Built with ❤️ on Cardano**

⚡ Powered by LACE • CIP-30 • Blockfrost • Blaze SDK ⚡

</div>
