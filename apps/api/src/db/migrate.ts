import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Pool } from "pg";

/**
 * Minimal forward-only migration runner (docs/ARCHITECTURE.md, ADR-0004):
 * applies `migrations/*.sql` in filename order, recording each applied file
 * in `schema_migrations`. No down migrations by design — recovery is a new
 * forward migration.
 *
 * Concurrency: a session-level advisory lock makes concurrent runners (two
 * API instances booting at once) serialize instead of racing; each pending
 * file is applied inside its own transaction, so a failing migration rolls
 * back completely and leaves `schema_migrations` untouched for that file.
 */

/** Arbitrary but fixed app-wide advisory lock key for migration runs. */
const MIGRATION_LOCK_KEY = 7_2100_0001;

export interface MigrateResult {
  applied: string[];
  alreadyApplied: string[];
}

export async function migrate(
  pool: Pool,
  migrationsDir: string,
): Promise<MigrateResult> {
  const entries = await readdir(migrationsDir);
  const files = entries.filter((name) => name.endsWith(".sql")).sort();

  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         filename    TEXT PRIMARY KEY,
         applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
       )`,
    );
    const { rows } = await client.query<{ filename: string }>(
      "SELECT filename FROM schema_migrations",
    );
    const done = new Set(rows.map((row) => row.filename));

    const applied: string[] = [];
    const alreadyApplied: string[] = [];
    for (const file of files) {
      if (done.has(file)) {
        alreadyApplied.push(file);
        continue;
      }
      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(
          `migration ${file} failed and was rolled back: ${String(error)}`,
          { cause: error },
        );
      }
      applied.push(file);
    }
    return { applied, alreadyApplied };
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]);
    client.release();
  }
}
