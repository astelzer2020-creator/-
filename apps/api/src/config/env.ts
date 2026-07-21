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
  /** Optional until Postgres lands — the pg repositories are stubs (M1). */
  DATABASE_URL: z.string().min(1).optional(),
  /**
   * M1 stopgap: password for the seeded in-memory users. When unset, no users
   * are seeded and login is impossible (safe default). Removed with the
   * Postgres user store.
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
