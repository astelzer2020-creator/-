import { hash, verify } from "@node-rs/argon2";
import { RoleSchema } from "@atlas/shared";

import type { Pool } from "../../db/pool.js";
import type { StoredUser, UserStore } from "./user-store.js";

interface UserRow {
  id: string;
  org_id: string;
  email: string;
  role: string;
  password_hash: string;
}

/**
 * Postgres user store (users/orgs tables, migrations/0001_init.sql).
 * Replaces the M1 in-memory stopgap when DATABASE_URL is set: users and
 * their argon2id hashes live in the database and survive restarts.
 */
export class PgUserStore implements UserStore {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<StoredUser | null> {
    const { rows } = await this.pool.query<UserRow>(
      `SELECT id, org_id, email, role, password_hash
       FROM users WHERE lower(email) = lower($1)`,
      [email],
    );
    const row = rows[0];
    if (row === undefined) {
      return null;
    }
    return {
      id: row.id,
      email: row.email,
      // A corrupt role in the DB fails loudly here, never as a broader grant.
      role: RoleSchema.parse(row.role),
      orgId: row.org_id,
      passwordHash: row.password_hash,
    };
  }

  verifyPassword(user: StoredUser, password: string): Promise<boolean> {
    return verify(user.passwordHash, password);
  }
}

/**
 * Fixed dev-seed org IDs so re-seeding is idempotent. Dev/pilot-UAT only —
 * seeding runs only when SEED_USER_PASSWORD is set; production provisioning
 * is a separate task (ATL-012).
 */
export const SEED_ORG_A_ID = "00000000-0000-4000-8000-00000000000a";
export const SEED_ORG_B_ID = "00000000-0000-4000-8000-00000000000b";

/**
 * TWO orgs are seeded deliberately (QA-M1-3): org A carries the three role
 * users, org B carries a single analyst, so cross-tenant isolation can be
 * probed live against a running deploy, not only in unit tests.
 */
export const SEED_USER_DEFS = [
  { email: "admin@atlas.local", role: "admin", orgId: SEED_ORG_A_ID },
  { email: "analyst@atlas.local", role: "analyst", orgId: SEED_ORG_A_ID },
  { email: "viewer@atlas.local", role: "viewer", orgId: SEED_ORG_A_ID },
  { email: "analyst-b@atlas.local", role: "analyst", orgId: SEED_ORG_B_ID },
] as const;

/**
 * Idempotently seeds the two dev orgs and their users with `password`
 * hashed as argon2id (docs/SECURITY.md). Safe to run on every boot:
 * ON CONFLICT updates the hash/role/org, so rotating SEED_USER_PASSWORD
 * takes effect on restart.
 */
export async function seedDevUsers(
  pool: Pool,
  password: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO orgs (id, name) VALUES
       ($1, 'Atlas Dev Org A'), ($2, 'Atlas Dev Org B')
     ON CONFLICT (id) DO NOTHING`,
    [SEED_ORG_A_ID, SEED_ORG_B_ID],
  );
  for (const user of SEED_USER_DEFS) {
    // @node-rs/argon2 defaults to argon2id; assert so a silent default
    // change fails loudly (docs/SECURITY.md).
    const passwordHash = await hash(password);
    if (!passwordHash.startsWith("$argon2id$")) {
      throw new Error("password hashing must use argon2id (docs/SECURITY.md)");
    }
    await pool.query(
      `INSERT INTO users (org_id, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (lower(email)) DO UPDATE SET
         org_id = EXCLUDED.org_id,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         updated_at = now()`,
      [user.orgId, user.email, passwordHash, user.role],
    );
  }
}
