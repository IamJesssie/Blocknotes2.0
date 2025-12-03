Implementation Plan - Blocknotes 2.0 Blockchain Integration
===========================================================

Project Overview
----------------

This plan divides the remaining work for the Blocknotes 2.0 blockchain integration across 5 team members. The application already has the core scaffolding in place:

*   ✅ Wallet connection (CIP-30 with LACE)
    
*   ✅ localStorage database with status tracking
    
*   ✅ Transaction utilities with metadata chunking
    
*   ✅ Background sync worker (checks every 20s)
    
*   ✅ UI with status badges (pending/confirmed/failed)
    
*   ✅ Login/signup removed (wallet-only auth)
    

Current State Analysis
----------------------

### What's Already Implemented

*   src/utils/database.ts: Complete localStorage CRUD with status tracking
    
*   src/utils/cardano.ts: Transaction utilities (currently in DEMO mode)
    
*   src/hooks/useBlockchainSync.ts: Background worker for checking tx status
    
*   src/components/NotesApp.tsx: Main app with wallet integration
    
*   src/components/Homepage.tsx: Landing page with wallet connection
    
*   src/components/NoteEditor.tsx: Note creation/editing UI
    
*   src/components/NoteCard.tsx: Note display with status badges
    

### What Needs to be Completed

According to 

Finaltask.md requirements:

1.  ✅ **Remove login/signup** - Already done
    
2.  ⚠️ **Real blockchain transactions** - Currently in DEMO mode (need to enable)
    
3.  ⚠️ **Metadata attachment** - Code exists but needs real Blaze SDK integration
    
4.  ✅ **Metadata chunking** - Helper function exists in cardano.ts
    
5.  ⚠️ **Local database + blockchain** - Database exists, needs real tx integration
    
6.  ⚠️ **Blockfrost integration** - Placeholder exists, needs real API key
    
7.  ✅ **Background worker** - Implemented in useBlockchainSync.ts
    

Team Branches & Task Division
-----------------------------

### Branch 1: feature/Lapure-frontend\_wallet\_connection

**Owner**: Lapure**Focus**: Wallet connection enhancements and UX improvements

**Tasks**:

*   Enhance wallet connection flow with better error handling
    
*   Add support for multiple wallets (Nami, Eternl, in addition to LACE)
    
*   Implement wallet balance display in the sidebar
    
*   Add wallet network detection (ensure Preview network)
    
*   Create wallet disconnection confirmation dialog
    
*   Add wallet status indicators throughout the app
    
*   Test wallet connection edge cases (rejection, timeout, wrong network)
    

### Branch 2: feature/PepitoJL-blockchain\_transaction\_integration

**Owner**: PepitoJL**Focus**: Enable real blockchain transactions using Blaze SDK

**Tasks**:

*   Install and configure Blaze SDK packages (@blaze-cardano/sdk, @blaze-cardano/query, @blaze-cardano/wallet)
    
*   Set up Blockfrost provider initialization in NotesApp.tsx
    
*   Uncomment and implement real transaction code in cardano.ts
    
*   Implement formatContent helper with actual Core.MetadatumList
    
*   Replace DEMO mode with real transaction submission
    
*   Handle transaction signing prompts and errors
    
*   Add transaction confirmation UI feedback
    
*   Test CREATE, UPDATE, DELETE transactions on Preview network
    

### Branch 3: feature/PepitoJP-metadata\_and\_blockfrost

**Owner**: PepitoJP**Focus**: Metadata structure and Blockfrost API integration

**Tasks**:

*   Configure Blockfrost API key (obtain from blockfrost.io)
    
*   Update Blockfrost configuration in cardano.ts
    
*   Implement proper metadata structure following Task requirements
    
*   Add note\_id, title, action, note, created\_at to metadata
    
*   Test metadata chunking with notes >64 characters
    
*   Implement Blockfrost transaction status checking (replace DEMO mode)
    
*   Add error handling for 404 (pending) and 200 (confirmed) responses
    
*   Verify metadata appears correctly on Cardanoscan Preview
    

### Branch 4: feature/Labuca-database\_sync\_worker

**Owner**: Labuca**Focus**: Background worker optimization and database recovery

**Tasks**:

*   Enhance useBlockchainSync.ts with better error handling
    
*   Add retry logic for failed Blockfrost requests
    
*   Implement exponential backoff for repeated failures
    
*   Create database recovery feature (fetch notes from blockchain if localStorage cleared)
    
*   Add UI notification when status changes (pending → confirmed)
    
*   Implement manual sync trigger button
    
*   Add sync status indicator in the UI
    
*   Test worker behavior with multiple pending transactions
    

### Branch 5: feature/Barrientos-ui\_polish\_and\_testing

**Owner**: Barrientos**Focus**: UI/UX polish, animations, and comprehensive testing

**Tasks**:

*   Add loading states for transaction submission
    
*   Implement success/error toast notifications
    
*   Enhance status badges with animations (pulse for pending)
    
*   Add transaction history modal (show all txs for a note)
    
*   Create help/tutorial overlay for first-time users
    
*   Add "View on Cardanoscan" link for confirmed transactions
    
*   Implement responsive design fixes
    
*   Test full CRUD flow end-to-end
    
*   Create demo presentation video/screenshots
    

Integration Dependencies
------------------------

  Lapure: Wallet PepitoJL: Transactions PepitoJP: MetadataLabuca: Sync Worker Barrientos: UI Polish   `

**Integration Order**:

1.  **Lapure** completes wallet enhancements first
    
2.  **PepitoJL** integrates Blaze SDK (depends on wallet API)
    
3.  **PepitoJP** configures Blockfrost and metadata (parallel with PepitoJL)
    
4.  **Labuca** tests sync worker with real transactions (depends on PepitoJP)
    
5.  **Barrientos** polishes UI after core features work (depends on all)
    

Shared Configuration Requirements
---------------------------------

### Environment Setup (All Team Members)

1.  npm install @blaze-cardano/sdk npm install @blaze-cardano/querynpm install @blaze-cardano/walletnpm install @blaze-cardano/corenpm install @blockfrost/blockfrost-js
    
2.  **Get Blockfrost API Key**:
    
    *   Go to [blockfrost.io](https://blockfrost.io/)
        
    *   Create free account
        
    *   Create Preview Network project
        
    *   Share the Project ID with team
        
3.  **Install LACE Wallet**:
    
    *   Install browser extension
        
    *   Create test wallet
        
    *   Switch to Preview network
        
    *   Get test ADA from [Cardano Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
        

Verification Plan
-----------------

### Unit Testing (Per Branch)

*   Each developer tests their feature independently
    
*   Use console.log for debugging
    
*   Verify changes don't break existing functionality
    

### Integration Testing (All Branches Merged)

1.  **Wallet Connection**:
    
    *   Connect LACE wallet successfully
        
    *   Verify address displays correctly
        
    *   Test disconnect/reconnect
        
2.  **Create Note**:
    
    *   Create note with content >64 chars
        
    *   Verify immediate display (pending status)
        
    *   Sign transaction in LACE
        
    *   Verify transaction submitted
        
    *   Check txHash stored in localStorage
        
3.  **Background Sync**:
    
    *   Wait ~20 seconds
        
    *   Verify status changes to "confirmed"
        
    *   Verify on [Cardanoscan Preview](https://preview.cardanoscan.io/)
        
4.  **Update Note**:
    
    *   Edit existing note
        
    *   Verify status resets to "pending"
        
    *   Sign new transaction
        
    *   Verify new txHash
        
5.  **Delete Note**:
    
    *   Mark note as trashed
        
    *   Verify DELETE transaction submission
        
    *   Restore note
        
    *   Verify RESTORE transaction
        

### Final Demo Checklist

*    Landing page loads with Web3 aesthetic
    
*    Wallet connects without errors
    
*    Notes create instantly (good UX)
    
*    Pending status shows
    
*    Transaction confirms within 30 seconds
    
*    Metadata visible on Cardanoscan
    
*    Background worker updates status automatically
    
*    All CRUD operations work
    

Timeline Suggestion
-------------------

*   **Week 1**: Setup + Individual feature development
    
*   **Week 2**: Integration testing + bug fixes
    
*   **Week 3**: Final polish + presentation prep
    

Resources
---------

*   **Blaze SDK Docs**: [https://blaze.butane.dev/](https://blaze.butane.dev/)
    
*   **Blockfrost API**: [https://docs.blockfrost.io/](https://docs.blockfrost.io/)
    
*   **CIP-30 Standard**: [https://cips.cardano.org/cip/CIP-30](https://cips.cardano.org/cip/CIP-30)
    
*   **Cardano Faucet**: [https://docs.cardano.org/cardano-testnet/tools/faucet/](https://docs.cardano.org/cardano-testnet/tools/faucet/)
    
*   **Cardanoscan Preview**: [https://preview.cardanoscan.io](https://preview.cardanoscan.io/)
    

Notes
-----

*   All branches should pull from main (or current working branch) regularly
    
*   Use SETUP\_INSTRUCTIONS.md as reference for implementation details
    
*   The Finaltask.md file contains the professor's requirements - refer to it frequently
    
*   Current code is in DEMO mode - your job is to make it REAL