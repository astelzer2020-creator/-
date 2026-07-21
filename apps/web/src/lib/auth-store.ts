/**
 * In-memory auth token store.
 *
 * SECURITY (audit finding): the legacy prototype persisted credentials/tokens in
 * localStorage, exposing them to any XSS payload. The token here lives in module
 * memory ONLY — never localStorage/sessionStorage/cookies-from-JS. A page reload
 * drops the session by design until the httpOnly-cookie refresh flow ships
 * (see scheduleTokenRefresh below).
 */

let token: string | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export const authStore = {
  getToken(): string | null {
    return token;
  },
  setToken(next: string): void {
    token = next;
    emit();
  },
  clear(): void {
    token = null;
    emit();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/**
 * TODO(auth): refresh stub. Once the API issues short-lived JWTs with an
 * httpOnly-cookie refresh endpoint (M1 API work package), this schedules a
 * silent renewal ahead of expiry. Intentionally a no-op today.
 */
export function scheduleTokenRefresh(): void {
  // no-op stub — see doc comment.
}
