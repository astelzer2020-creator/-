import { z } from "zod";

/**
 * 12-factor configuration: env vars only, zod-validated, fails fast at boot
 * (docs/ARCHITECTURE.md "Cross-cutting").
 */
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  /** Base URL of the internal analytics service (never internet-facing). */
  ANALYTICS_URL: z.url(),
  /** HS256 signing secret for access tokens. Never committed (docs/SECURITY.md). */
  JWT_SECRET: z.string().min(32),
  /**
   * Postgres connection string. When set, the API runs on the pg
   * repositories + pg user store and /readyz pings the database; when unset,
   * the in-memory adapters serve dev and tests (data does not survive
   * restart). Run `pnpm --filter @atlas/api migrate` before starting.
   */
  DATABASE_URL: z.string().min(1).optional(),
  /**
   * Dev/pilot-UAT seeding password. With DATABASE_URL: idempotently seeds
   * two orgs and four users (org A admin/analyst/viewer, org B analyst-b —
   * QA-M1-3) into Postgres at boot. Without DATABASE_URL: seeds the same
   * users into the in-memory stopgap store. When unset, no users are seeded
   * and login is impossible (safe default).
   */
  SEED_USER_PASSWORD: z.string().min(8).optional(),
});

export interface AppConfig {
  nodeEnv: "development" | "test" | "production";
  host: string;
  port: number;
  analyticsUrl: string;
  jwtSecret: string;
  databaseUrl?: string;
  seedUserPassword?: string;
}

export function loadConfig(
  env: Record<string, string | undefined> = process.env,
): AppConfig {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  const e = parsed.data;
  return {
    nodeEnv: e.NODE_ENV,
    host: e.HOST,
    port: e.PORT,
    analyticsUrl: e.ANALYTICS_URL,
    jwtSecret: e.JWT_SECRET,
    databaseUrl: e.DATABASE_URL,
    seedUserPassword: e.SEED_USER_PASSWORD,
  };
}
