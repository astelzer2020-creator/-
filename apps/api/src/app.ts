import Fastify, { type FastifyInstance } from "fastify";
import type { Dispatcher } from "undici";

import type { AppConfig } from "./config/env.js";
import { AnalyticsClient } from "./lib/analytics-client.js";
import { authRoutes } from "./modules/auth/routes.js";
import {
  InMemoryUserStore,
  type SeedUser,
  type UserStore,
} from "./modules/auth/user-store.js";
import { InMemoryProjectsRepo } from "./modules/projects/repo-memory.js";
import type { ProjectsRepo } from "./modules/projects/repo.js";
import { projectsRoutes } from "./modules/projects/routes.js";
import { ProjectsService } from "./modules/projects/service.js";
import { InMemoryScenariosRepo } from "./modules/scenarios/repo-memory.js";
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
  /** M1 stopgap user seeding (in-memory store); see modules/auth/user-store.ts. */
  seedUsers?: readonly SeedUser[];
  userStore?: UserStore;
  projectsRepo?: ProjectsRepo;
  scenariosRepo?: ScenariosRepo;
  /** Test hook: undici dispatcher (e.g. MockAgent) for the analytics client. */
  analyticsDispatcher?: Dispatcher;
}

/** Builds the Fastify app without listening — the testable unit. */
export async function buildApp(
  options: BuildAppOptions,
): Promise<FastifyInstance> {
  const { config } = options;
  const app = Fastify({
    logger: config.nodeEnv === "test" ? false : { level: "info" },
  });

  await app.register(errorEnvelopePlugin);

  const userStore =
    options.userStore ??
    (await InMemoryUserStore.fromSeeds(options.seedUsers ?? []));
  await app.register(authPlugin, { jwtSecret: config.jwtSecret, userStore });

  const projectsRepo = options.projectsRepo ?? new InMemoryProjectsRepo();
  const scenariosRepo = options.scenariosRepo ?? new InMemoryScenariosRepo();
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

  // Health endpoints (docs/ARCHITECTURE.md observability). Liveness only for
  // now: there is no DB yet and analytics is checked per call, not here.
  app.get("/healthz", { config: { auth: { public: true } } }, async () => ({
    status: "ok",
  }));
  app.get("/readyz", { config: { auth: { public: true } } }, async () => ({
    status: "ok",
  }));

  return app;
}
