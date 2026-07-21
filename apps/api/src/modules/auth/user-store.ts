import { randomUUID } from "node:crypto";

import { Algorithm, hash, verify } from "@node-rs/argon2";
import type { Role } from "@atlas/shared";

export interface StoredUser {
  id: string;
  email: string;
  role: Role;
  orgId: string;
  passwordHash: string;
}

export interface SeedUser {
  id?: string;
  email: string;
  password: string;
  role: Role;
  orgId: string;
}

export interface UserStore {
  findByEmail(email: string): Promise<StoredUser | null>;
  verifyPassword(user: StoredUser, password: string): Promise<boolean>;
}

/**
 * M1 STOPGAP — in-memory user store seeded at boot with argon2id hashes
 * (docs/SECURITY.md: Argon2id). Users live only for the process lifetime.
 * Replaced by the Postgres `users` table (see `migrations/0001_init.sql`)
 * when the database lands; nothing outside this module may depend on the
 * in-memory nature.
 */
export class InMemoryUserStore implements UserStore {
  private constructor(private readonly byEmail: Map<string, StoredUser>) {}

  static async fromSeeds(seeds: readonly SeedUser[]): Promise<InMemoryUserStore> {
    const byEmail = new Map<string, StoredUser>();
    for (const seed of seeds) {
      const email = seed.email.toLowerCase();
      byEmail.set(email, {
        id: seed.id ?? randomUUID(),
        email,
        role: seed.role,
        orgId: seed.orgId,
        passwordHash: await hash(seed.password, { algorithm: Algorithm.Argon2id }),
      });
    }
    return new InMemoryUserStore(byEmail);
  }

  findByEmail(email: string): Promise<StoredUser | null> {
    return Promise.resolve(this.byEmail.get(email.toLowerCase()) ?? null);
  }

  verifyPassword(user: StoredUser, password: string): Promise<boolean> {
    return verify(user.passwordHash, password, { algorithm: Algorithm.Argon2id });
  }
}
