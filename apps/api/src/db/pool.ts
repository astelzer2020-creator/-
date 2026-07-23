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
export function createPool(databaseUrl: string): pg.Pool {
  return new pg.Pool({
    connectionString: databaseUrl,
    max: 10,
    // Fail loudly and quickly in dev/pilot rather than hanging forever.
    connectionTimeoutMillis: 10_000,
  });
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
