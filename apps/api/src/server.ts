import { randomUUID } from "node:crypto";

import { buildApp } from "./app.js";
import { loadConfig } from "./config/env.js";
import { createPool, type Pool } from "./db/pool.js";
import {
  SEED_ORG_A_ID,
  SEED_USER_DEFS,
  seedDevUsers,
} from "./modules/auth/user-store-pg.js";
import type { SeedUser } from "./modules/auth/user-store.js";

const config = loadConfig();

// Persistence wiring (ATL-022): DATABASE_URL set -> Postgres repositories +
// pg user store. Run `pnpm --filter @atlas/api migrate` before starting.
// When SEED_USER_PASSWORD is set the two dev orgs and four dev users are
// (idempotently) seeded — org A: admin/analyst/viewer, org B: analyst-b —
// so cross-tenant isolation can be probed live (QA-M1-3). Without
// SEED_USER_PASSWORD nothing is seeded; without any users login always
// fails, which is the safe default.
let pool: Pool | undefined;
const seedUsers: SeedUser[] = [];
if (config.databaseUrl !== undefined) {
  pool = createPool(config.databaseUrl);
  if (config.seedUserPassword !== undefined) {
    await seedDevUsers(pool, config.seedUserPassword);
  }
} else if (config.seedUserPassword !== undefined) {
  // No database: in-memory stopgap store, same two-org shape as the pg seed.
  const orgIds = { A: randomUUID(), B: randomUUID() };
  for (const def of SEED_USER_DEFS) {
    seedUsers.push({
      email: def.email,
      password: config.seedUserPassword,
      role: def.role,
      orgId: def.orgId === SEED_ORG_A_ID ? orgIds.A : orgIds.B,
    });
  }
}

const app = await buildApp(
  pool !== undefined ? { config, pool } : { config, seedUsers },
);

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
