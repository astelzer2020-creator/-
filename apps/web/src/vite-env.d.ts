/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "0" disables demo mode; anything else (including unset) keeps it ON so dev/preview work standalone. */
  readonly VITE_DEMO?: string;
  /** Base URL of the Atlas API when demo mode is off. Defaults to "/api". */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
