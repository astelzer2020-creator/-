import path from "node:path";
import { fileURLToPath } from "node:url";

import { migrate } from "./migrate.js";
import { createPool } from "./pool.js";

/**
 * CLI entry for the migration runner: `pnpm --filter @atlas/api migrate`
 * (builds first, then runs this file from dist/). Reads DATABASE_URL from the
 * environment — never from a file in the repo (docs/SECURITY.md).
 */
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl === undefined || databaseUrl.length === 0) {
  console.error("DATABASE_URL is required to run migrations");
  process.exit(1);
}

// dist/db/migrate-cli.js -> ../../migrations = apps/api/migrations.
const migrationsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../migrations",
);

const pool = createPool(databaseUrl);
try {
  const result = await migrate(pool, migrationsDir);
  for (const file of result.alreadyApplied) {
    console.log(`already applied: ${file}`);
  }
  for (const file of result.applied) {
    console.log(`applied: ${file}`);
  }
  console.log(
    `migrations complete — ${String(result.applied.length)} applied, ` +
      `${String(result.alreadyApplied.length)} already applied`,
  );
} finally {
  await pool.end();
}
