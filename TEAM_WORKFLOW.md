# Team Workflow – Syncing With Master & Local Testing

## 1. Syncing With Master Branch

After a PR is merged to `master`, each team member should:

1. Checkout their own feature branch:
   ```sh
   git checkout feature/your-branch-name
   ```
2. Pull the latest changes from master:
   ```sh
   git pull origin master
   ```
3. Resolve any merge conflicts if prompted.
4. Continue development on their branch.

## 2. Environment Setup For Local Testing

- Each developer should use their own Blockfrost API credentials in `.env`.
- Copy `.env.example` to `.env` and fill in your own API key and settings.
- Never commit sensitive keys to the repository.
- Run:
  ```sh
  npm install
  npm run dev
  ```

## 3. No Backend – Local Storage Only

- All note data is stored in browser `localStorage` (see `src/utils/database.ts`).
- No backend server, no MySQL, no external database required.
- Data is client-side only and persists per browser.
- Clearing browser storage will remove notes.

## 4. Testing & Collaboration

- Each team member can test independently using their own credentials.
- For blockchain features, use Preview/Testnet settings in `.env`.
- Share feedback and resolve issues via PRs and code reviews.

---

**End of Team Workflow Guide**
