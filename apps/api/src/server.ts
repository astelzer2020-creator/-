import { randomUUID } from "node:crypto";

import { buildApp } from "./app.js";
import { loadConfig } from "./config/env.js";
import type { SeedUser } from "./modules/auth/user-store.js";

const config = loadConfig();

// M1 STOPGAP: in-memory users, seeded only when SEED_USER_PASSWORD is set
// (no Postgres yet — see migrations/0001_init.sql and modules/auth/user-store.ts).
// Without it no user exists and login always fails, which is the safe default.
const seedUsers: SeedUser[] = [];
if (config.seedUserPassword !== undefined) {
  const orgId = randomUUID();
  for (const role of ["admin", "analyst", "viewer"] as const) {
    seedUsers.push({
      email: `${role}@atlas.local`,
      password: config.seedUserPassword,
      role,
      orgId,
    });
  }
}

const app = await buildApp({ config, seedUsers });

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
