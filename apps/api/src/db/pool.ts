import pg from "pg";

/**
 * node-postgres pool factory — the single place the API opens Postgres
 * connections. `pg` was chosen deliberately (see apps/api/README.md): it is
 * the canonical minimal Postgres driver — parameterized queries, pooling,
 * zero ORM/query-builder abstraction — which matches the repository-layer
 * hand-written SQL rule (org scoping visible in every statement,
 * docs/SECURITY.md) and adds no schema magic that could fight the
 * forward-only migration files.
 *
 * BIGINT (agorot) handling: node-postgres returns int8 as a STRING by
 * default because int8 exceeds the double range. We keep that default and
 * convert in the row mappers via `agorotFromDb` below — a global int8 parser
 * would silently affect unrelated queries (COUNT(*), etc.).
 */
export function createPool(
  databaseUrl: string,
  onIdleError?: (error: Error) => void,
): pg.Pool {
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 10,
    // Fail loudly and quickly in dev/pilot rather than hanging forever.
    connectionTimeoutMillis: 10_000,
  });
  // QA-M1-4: a pg Pool emits 'error' for IDLE clients whose backend dies
  // (Postgres restart/failover, pg_terminate_backend — SQLSTATE 57P01).
  // Without a listener that is an unhandled 'error' event and Node kills
  // the whole API process. Log and carry on: the pool discards the dead
  // client and opens fresh connections on demand, so the API degrades to
  // per-request errors (/readyz 503) and self-recovers when the database
  // returns. In-flight queries are unaffected by this handler — they
  // reject normally and surface as enveloped 5xx responses.
  const handler =
    onIdleError ??
    ((error: Error): void => {
      console.error(
        `pg pool idle-client error (non-fatal, pool recovers): ${error.message}`,
      );
    });
  pool.on("error", handler);
  return pool;
}

export type { Pool, PoolClient } from "pg";

/**
 * Converts an int8 column value (string per pg default, or null) to an
 * integer-agorot JS number. Amounts must stay within Number.MAX_SAFE_INTEGER
 * (±2^53−1 agorot ≈ ₪90 trillion) — beyond that we throw instead of
 * silently corrupting money (a wrong financial number is an S1).
 */
export function agorotFromDb(value: string | number | null): number | null {
  if (value === null) {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new RangeError(
      `agorot amount from database is not a safe integer: ${String(value)}`,
    );
  }
  return parsed;
}

/** NUMERIC columns also arrive as strings; convert with finiteness check. */
export function numericFromDb(value: string | number | null): number | null {
  if (value === null) {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new RangeError(
      `numeric value from database is not finite: ${String(value)}`,
    );
  }
  return parsed;
}
