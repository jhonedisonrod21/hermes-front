/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HERMES_AUTH_BASE_URL?: string;
  readonly VITE_HERMES_BFF_BASE_URL?: string;
  readonly VITE_HERMES_API_BASE_URL?: string;
  readonly VITE_HERMES_BFF_CLIENT_REGISTRATION_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
