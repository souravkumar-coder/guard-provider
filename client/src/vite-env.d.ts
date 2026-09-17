/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional override for the API base URL. Defaults to `/api` (proxied). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
