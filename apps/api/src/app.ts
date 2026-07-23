import Fastify, { type FastifyInstance } from "fastify";
import type { Dispatcher } from "undici";

import type { AppConfig } from "./config/env.js";
import { createPool, type Pool } from "./db/pool.js";
import { AnalyticsClient } from "./lib/analytics-client.js";
import { authRoutes } from "./modules/auth/routes.js";
import { PgUserStore } from "./modules/auth/user-store-pg.js";
import {
  InMemoryUserStore,
  type SeedUser,
  type UserStore,
} from "./modules/auth/user-store.js";
import { InMemoryProjectsRepo } from "./modules/projects/repo-memory.js";
import { PgProjectsRepo } from "./modules/projects/repo-pg.js";
import type { ProjectsRepo } from "./modules/projects/repo.js";
import { projectsRoutes } from "./modules/projects/routes.js";
import { ProjectsService } from "./modules/projects/service.js";
import { InMemoryScenariosRepo } from "./modules/scenarios/repo-memory.js";
import { PgScenariosRepo } from "./modules/scenarios/repo-pg.js";
import type { ScenariosRepo } from "./modules/scenarios/repo.js";
import { scenariosRoutes } from "./modules/scenarios/routes.js";
import { ScenariosService } from "./modules/scenarios/service.js";
import { authPlugin } from "./plugins/auth.js";
import { errorEnvelopePlugin } from "./plugins/error-envelope.js";

declare module "fastify" {
  interface FastifyInstance {
    projects: ProjectsService;
    scenarios: ScenariosService;
  }
}

export interface BuildAppOptions {
  config: AppConfig;
  /** In-memory-store seeding only (dev without a database, and tests). */
  seedUsers?: readonly SeedUser[];
  userStore?: UserStore;
  projectsRepo?: ProjectsRepo;
  scenariosRepo?: ScenariosRepo;
  /**
   * Postgres pool to use when `config.databaseUrl` is set (e.g. one that
   * already ran migrations/seeding). The app takes ownership either way and
   * ends the pool on close.
   */
  pool?: Pool;
  /** Test hook: undici dispatcher (e.g. MockAgent) for the analytics client. */
  analyticsDispatcher?: Dispatcher;
}

/**
 * Builds the Fastify app without listening — the testable unit.
 *
 * Persistence wiring (ATL-022): when `config.databaseUrl` is set the app
 * runs on Postgres — pg repositories and the pg user store — and /readyz
 * pings the database. Without it the in-memory adapters serve dev and
 * tests, exactly as in M1. Explicit `userStore`/repo overrides always win.
 */
export async function buildApp(
  options: BuildAppOptions,
): Promise<FastifyInstance> {
  const { config } = options;
  const app = Fastify({
    logger: config.nodeEnv === "test" ? false : { level: "info" },
  });

  await app.register(errorEnvelopePlugin);

  const pool: Pool | undefined =
    config.databaseUrl !== undefined
      ? (options.pool ?? createPool(config.databaseUrl))
      : undefined;
  if (pool !== undefined) {
    app.addHook("onClose", async () => {
      await pool.end();
    });
  }

  const userStore =
    options.userStore ??
    (pool !== undefined
      ? new PgUserStore(pool)
      : await InMemoryUserStore.fromSeeds(options.seedUsers ?? []));
  await app.register(authPlugin, { jwtSecret: config.jwtSecret, userStore });

  const projectsRepo =
    options.projectsRepo ??
    (pool !== undefined
      ? new PgProjectsRepo(pool)
      : new InMemoryProjectsRepo());
  const scenariosRepo =
    options.scenariosRepo ??
    (pool !== undefined
      ? new PgScenariosRepo(pool)
      : new InMemoryScenariosRepo());
  const analytics = new AnalyticsClient(
    config.analyticsUrl,
    options.analyticsDispatcher,
  );
  const projects = new ProjectsService(projectsRepo);
  const scenarios = new ScenariosService(scenariosRepo, projects, analytics);
  app.decorate("projects", projects);
  app.decorate("scenarios", scenarios);

  await app.register(authRoutes);
  await app.register(projectsRoutes);
  await app.register(scenariosRoutes);

  // Health endpoints (docs/ARCHITECTURE.md observability). /healthz is
  // liveness only; /readyz proves the database is reachable when one is
  // configured (analytics stays checked per call, not here).
  app.get("/healthz", { config: { auth: { public: true } } }, async () => ({
    status: "ok",
  }));
  app.get(
    "/readyz",
    { config: { auth: { public: true } } },
    async (_request, reply) => {
      if (pool === undefined) {
        // No database configured (in-memory mode) — unchanged M1 shape.
        return { status: "ok" };
      }
      try {
        await pool.query("SELECT 1");
        return { status: "ok", database: "ok" };
      } catch {
        return reply
          .status(503)
          .send({ status: "unavailable", database: "unreachable" });
      }
    },
  );

  return app;
}
