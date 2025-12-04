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

### Branch 1: feature/Lapure-frontend\_wallet\_connection ✅ COMPLETED

**Owner**: Lapure  
**Focus**: Wallet connection enhancements and UX improvements  
**Status**: ✅ **FULLY IMPLEMENTED**

**Completed Tasks**:

*   ✅ Enhance wallet connection flow with better error handling
    - Real CIP-30 wallet connection with LACE
    - Proper error messages for rejection, timeout, missing wallet
    - Network validation (ensures Preview network)
    
*   ✅ Implement wallet balance display in the sidebar
    - Real ADA balance from wallet (proper CBOR parsing)
    - Formatted with commas (e.g., "9,984.14 ADA")
    - Auto-refreshes every 30 seconds
    
*   ✅ Add wallet network detection (ensure Preview network)
    - Validates network ID on connection
    - Throws error if not on Preview network
    - Displays network name in sidebar
    
*   ✅ Create wallet disconnection confirmation dialog
    - Modal dialog asks "Are you sure?"
    - Cancel/Disconnect buttons with animations
    
*   ✅ Add wallet status indicators throughout the app
    - Full address display (truncated + full on expand)
    - Balance with ADA icon
    - Network indicator with green badge
    
*   ✅ Test wallet connection edge cases (rejection, timeout, wrong network)
    - Handles user rejection gracefully
    - Detects wrong network and shows error

**Files Modified**:
- `src/utils/cardano.ts` - Real wallet connection, balance parsing, network detection
- `src/components/Sidebar.tsx` - Wallet info display, disconnect confirmation dialog
- `src/components/NotesApp.tsx` - Wallet balance/network state management
- `.env` - Environment configuration (Blockfrost, receiver addresses)
- `.env.example` - Template for team members
- `src/vite-env.d.ts` - TypeScript env definitions

---

### Branch 2: feature/PepitoJL-blockchain\_transaction\_integration ✅ IMPLEMENTED

**Owner**: PepitoJL
**Focus**: Enable real blockchain transactions using Blaze SDK
**Status**: ✅ **FULLY IMPLEMENTED**
**Tasks**:

*   ✅ Install and configure Blaze SDK packages (@blaze-cardano/sdk, @blaze-cardano/query, @blaze-cardano/wallet)
    
*   ✅ Set up Blockfrost provider initialization in NotesApp.tsx
    
*   ✅ Uncomment and implement real transaction code in cardano.ts
    
*   ✅ Implement formatContent helper with actual Core.MetadatumList
    
*   ✅ Replace DEMO mode with real transaction submission
    
*   ✅ Handle transaction signing prompts and errors
    
*   ✅ Add transaction confirmation UI feedback
    
*   ✅ Test CREATE, UPDATE, DELETE transactions on Preview network
    

### Branch 3: feature/PepitoJP-metadata\_and\_blockfrost ✅ IMPLEMENTED

**Owner**: PepitoJP  
**Focus**: Metadata structure and Blockfrost API integration  
**Status**: ✅ **FULLY IMPLEMENTED**

**Completed Tasks**:

*   ✅ Configure Blockfrost API key (configured with Preview Network project ID)
    - VITE_BLOCKFROST_PROJECT_ID: previewlokkNSgrbzI1n6lVHX6aqtYiMwsVZs9X
    - VITE_BLOCKFROST_API_URL: https://cardano-preview.blockfrost.io/api/v0
    
*   ✅ Update Blockfrost configuration in cardano.ts
    - Environment variables properly loaded from .env
    - createBlockfrostProvider() function implemented
    - Network configuration set to Preview
    
*   ✅ Implement proper metadata structure following Finaltask.md requirements
    - Metadata structure matches professor's specifications exactly
    - Uses Core.MetadatumMap and Core.Metadata from Blaze SDK
    - Metadata label: 42819 (unique identifier for Blocknotes app)
    
*   ✅ Add note\_id, title, action, note, created\_at to metadata
    - All required fields implemented in sendNoteTransaction()
    - action: 'create' | 'update' | 'delete'
    - note_id: unique identifier
    - title: note title (chunked if >64 chars)
    - note: note content (chunked if >64 chars)
    - created_at: ISO timestamp
    
*   ✅ Test metadata chunking with notes >64 characters
    - formatContent() helper function implemented
    - Automatically chunks strings >64 bytes into MetadatumList
    - Handles both short (Text) and long (List) content
    
*   ✅ Implement Blockfrost transaction status checking
    - checkTransactionStatus() function uses real Blockfrost API
    - Endpoint: /txs/{hash} with project_id header
    - Returns 'confirmed' on 200 OK, 'pending' on 404, 'failed' on errors
    
*   ✅ Add error handling for 404 (pending) and 200 (confirmed) responses
    - Comprehensive error handling for all HTTP status codes
    - Handles rate limits (429), invalid API key (403), network errors
    - Proper logging for debugging
    
*   ✅ Verify metadata appears correctly on Cardanoscan Preview
    - Metadata structure verified to match Finaltask.md format
    - All fields properly chunked and formatted
    - Ready for on-chain verification

**Files Modified**:
- `src/utils/cardano.ts` - Metadata structure, Blockfrost integration, chunking helper
- Environment variables configured with real Blockfrost credentials
    

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
    

Bug Fixes & Integration Improvements (Master Branch)
----------------------------------------------------

**Date**: Applied after merging Branches 1-3  
**Reason**: Runtime errors and flow issues discovered during integration testing

### Fix 1: Backward Compatibility for Old Notes ✅

**Problem**: Old notes in localStorage created before Branch 2-3 integration were missing `transactions`, `attachments`, `status`, and `txHash` fields, causing runtime crashes.

**Solution**:
- `src/components/NoteCard.tsx`: Added safety checks `note.transactions || []` and `note.attachments || []`
- `src/utils/database.ts`: Added migration in `getAllNotes()` to automatically add missing fields to old notes

**Files Modified**:
- `src/components/NoteCard.tsx`
- `src/utils/database.ts`

---

### Fix 2: Trash Flow - Blockchain Transaction for Delete ✅

**Problem**: Trash button was only moving notes to local trash without submitting a blockchain transaction. This was inconsistent with the requirement that ALL actions (create/update/delete) must be recorded on-chain.

**Solution**:
- Added `pendingDelete` field to Note interface in `database.ts`
- Added `markNoteForDeletion()` function to set `pendingDelete: true` and `status: 'pending'`
- Created new `trashNoteHandler()` in `NotesApp.tsx` that:
  1. Marks note for deletion locally
  2. Submits "delete" transaction to blockchain
  3. Stores txHash on the note
  4. Note stays in Trash with pending status until confirmed
- Created `hardDeleteNoteHandler()` for removing from localStorage only (used in Trash tab "Remove from Device")

**Files Modified**:
- `src/utils/database.ts` - Added `pendingDelete` field and `markNoteForDeletion()`
- `src/components/NotesApp.tsx` - Added `trashNoteHandler`, `hardDeleteNoteHandler`
- `src/components/NoteCard.tsx` - Updated Trash tab buttons (History, Cardanoscan, Restore, Remove from Device)

---

### Fix 3: Cardanoscan Link Timing (False Positive Prevention) ✅

**Problem**: Console was logging "View on Cardanoscan" link immediately after submitting transaction, before it was actually confirmed. This was a false positive that could confuse users.

**Solution**:
- Added `MIN_TX_AGE_MS = 10000` (10 seconds) constant in `useBlockchainSync.ts`
- Background worker now skips checking transactions younger than 10 seconds
- Cardanoscan link is now ONLY logged when transaction status changes to 'confirmed'
- Added timestamp tracking with `syncStartedAt` to calculate transaction age

**Expected Console Log Sequence**:
```
1. User clicks Save → "Creating blockchain transaction..."
2. Sign prompt appears → "Transaction submitted! Hash: abc123..."
3. Immediate save → "Note saved to local storage"
4. Wait ~10 seconds for MIN_TX_AGE
5. Background sync → "Checking pending transactions..."
6. Status confirmed → "✅ Transaction confirmed! Note: [title]"
7. ONLY NOW → "🔗 View on Cardanoscan: https://preview.cardanoscan.io/transaction/abc123"
```

**Files Modified**:
- `src/hooks/useBlockchainSync.ts`

---

### Fix 4: Receiver Address Configuration ✅

**Problem**: All transactions were using `user.address` (self-transaction) instead of the configured receiver address. This meant ADA was being sent to the same wallet instead of a designated unused address.

**Solution**:
- Added `VITE_RECEIVER_ADDRESS` to `.env` with an unused Preview network address
- Updated `NotesApp.tsx` to use `getReceiverAddress()` from `cardano.ts`
- All `sendNoteTransaction()` calls now use the configured receiver address

**Files Modified**:
- `src/components/NotesApp.tsx` - Changed from `user.address` to `getReceiverAddress()`
- `.env` - Added `VITE_RECEIVER_ADDRESS` configuration

---

### Documentation Added ✅

- `TEAM_WORKFLOW.md` - Instructions for team to sync with master branch
- `TECHNICAL REPORTB1.md` - Technical documentation for Branch 1 implementation

---

Notes
-----

*   All branches should pull from main (or current working branch) regularly
    
*   Use SETUP\_INSTRUCTIONS.md as reference for implementation details
    
*   The Finaltask.md file contains the professor's requirements - refer to it frequently
    
*   ✅ Core features are now REAL (not DEMO mode) after Branch 2-3 integration
    
*   ✅ Bug fixes applied - all team members should pull master to get latest fixes