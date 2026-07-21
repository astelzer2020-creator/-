import { useSyncExternalStore } from "react";

import { authStore } from "../lib/auth-store";

/** Reactive view over the in-memory auth token (see lib/auth-store.ts security note). */
export function useAuthToken(): string | null {
  return useSyncExternalStore(authStore.subscribe, authStore.getToken);
}
