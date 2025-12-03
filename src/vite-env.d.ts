/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BLOCKFROST_PROJECT_ID: string;
  readonly VITE_BLOCKFROST_API_URL: string;
  readonly VITE_RECEIVER_ADDRESS: string;
  readonly VITE_RECEIVER_ADDRESS_UNUSED: string;
  readonly VITE_CARDANO_NETWORK: string;
  readonly VITE_METADATA_LABEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
