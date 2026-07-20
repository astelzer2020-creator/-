/**
 * Simple in-memory sliding-window rate limiter for the lead endpoint.
 *
 * Suitable for a single-instance deployment. On serverless platforms
 * memory is per-instance, so this is a best-effort layer; the launch
 * runbook (docs/LAUNCH-CHECKLIST.md) calls for adding an edge/WAF rule
 * or a shared store (e.g. Upstash) before high-traffic campaigns.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Opportunistic cleanup to keep the map bounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => t <= windowStart)) hits.delete(k);
    }
  }
  return false;
}
