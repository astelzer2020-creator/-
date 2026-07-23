import path from "node:path";
import { fileURLToPath } from "node:url";

import type { FastifyInstance } from "fastify";
import {
  ProjectCreateSchema,
  ScenarioCreateSchema,
  SimulationResultSchema,
} from "@atlas/shared";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { migrate } from "../src/db/migrate.js";
import { agorotFromDb, createPool, type Pool } from "../src/db/pool.js";
import {
  SEED_ORG_A_ID,
  SEED_ORG_B_ID,
  seedDevUsers,
} from "../src/modules/auth/user-store-pg.js";
import { PgProjectsRepo } from "../src/modules/projects/repo-pg.js";
import { PgScenariosRepo } from "../src/modules/scenarios/repo-pg.js";
import { buildApp } from "../src/app.js";
import {
  bearer,
  PROJECT_BODY,
  SCENARIO_BODY,
  SIMULATION_FIXTURE,
  TEST_CONFIG,
} from "./helpers.js";

/**
 * Integration tests against a REAL Postgres (no mocks, no testcontainers —
 * a plain server, e.g. the dev scratch cluster; see
 * infra/environments/dev/README.md). Gated on DATABASE_URL_TEST so CI
 * runners without Postgres skip gracefully instead of failing.
 *
 *   DATABASE_URL_TEST=postgresql://atlas@127.0.0.1:54329/atlas_test pnpm test
 *
 * The target database is DROPPED to a clean slate per test via TRUNCATE —
 * never point DATABASE_URL_TEST at a database that holds data you care about.
 */
const DATABASE_URL_TEST = process.env.DATABASE_URL_TEST;

const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

const SEED_PASSWORD = "pilot-uat-password";

const USER_A = { email: "analyst@atlas.local", password: SEED_PASSWORD };
const USER_B = { email: "analyst-b@atlas.local", password: SEED_PASSWORD };

describe.skipIf(DATABASE_URL_TEST === undefined)("postgres integration", () => {
  // Non-empty by the skipIf gate.
  const url = DATABASE_URL_TEST ?? "";
  let admin: Pool;

  function makePgApp(): Promise<FastifyInstance> {
    // Each app gets its own pool (the app ends it on close) — that is
    // exactly the restart-survival topology: same database, new process.
    return buildApp({
      config: { ...TEST_CONFIG, databaseUrl: url },
      pool: createPool(url),
    });
  }

  async function loginPg(
    app: FastifyInstance,
    user: { email: string; password: string },
  ): Promise<string> {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: user,
    });
    expect(response.statusCode).toBe(200);
    return (response.json() as { accessToken: string }).accessToken;
  }

  beforeAll(async () => {
    admin = createPool(url);
    await migrate(admin, MIGRATIONS_DIR);
  });

  afterAll(async () => {
    await admin.end();
  });

  beforeEach(async () => {
    await admin.query("TRUNCATE orgs, users, projects, scenarios CASCADE");
    await seedDevUsers(admin, SEED_PASSWORD);
  });

  it("migrations are idempotent — second run applies nothing", async () => {
    const rerun = await migrate(admin, MIGRATIONS_DIR);
    expect(rerun.applied).toEqual([]);
    expect(rerun.alreadyApplied).toContain("0001_init.sql");
    const { rows } = await admin.query<{ filename: string }>(
      "SELECT filename FROM schema_migrations ORDER BY filename",
    );
    expect(rows.map((r) => r.filename)).toContain("0001_init.sql");
  });

  it("seeding is idempotent and stores argon2id hashes", async () => {
    await seedDevUsers(admin, SEED_PASSWORD); // second run must not throw
    const { rows } = await admin.query<{
      email: string;
      org_id: string;
      password_hash: string;
    }>("SELECT email, org_id, password_hash FROM users ORDER BY email");
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      expect(row.password_hash.startsWith("$argon2id$")).toBe(true);
    }
    const orgB = rows.find((r) => r.email === "analyst-b@atlas.local");
    expect(orgB?.org_id).toBe(SEED_ORG_B_ID);
  });

  it("project CRUD round-trips through real SQL, including BIGINT agorot", async () => {
    const repo = new PgProjectsRepo(admin);
    // Large-but-safe agorot amount: must survive int8 -> string -> number.
    const landValueAgorot = 9_007_199_254_740_991 - 1;
    const created = await repo.create(
      SEED_ORG_A_ID,
      ProjectCreateSchema.parse({
        ...PROJECT_BODY,
        landValueAgorot,
        lotArea: 1234.56,
      }),
    );
    expect(created.orgId).toBe(SEED_ORG_A_ID);
    expect(created.landValueAgorot).toBe(landValueAgorot);
    expect(created.lotArea).toBe(1234.56);

    const fetched = await repo.getById(SEED_ORG_A_ID, created.id);
    expect(fetched).toEqual(created);

    const updated = await repo.update(SEED_ORG_A_ID, created.id, {
      city: "חיפה",
    });
    expect(updated?.city).toBe("חיפה");
    expect(updated?.name).toBe(PROJECT_BODY.name);

    expect(await repo.remove(SEED_ORG_A_ID, created.id)).toBe(true);
    expect(await repo.getById(SEED_ORG_A_ID, created.id)).toBeNull();
  });

  it("agorotFromDb refuses unsafe integers instead of corrupting money", () => {
    expect(() => agorotFromDb("9007199254740993")).toThrow(RangeError);
  });

  it("scenario JSONB round-trips and is re-validated by the shared schema on read", async () => {
    const projects = new PgProjectsRepo(admin);
    const scenarios = new PgScenariosRepo(admin);
    const project = await projects.create(
      SEED_ORG_A_ID,
      ProjectCreateSchema.parse(PROJECT_BODY),
    );
    const created = await scenarios.create(
      SEED_ORG_A_ID,
      project.id,
      ScenarioCreateSchema.parse(SCENARIO_BODY),
    );
    expect(created.apartmentMix).toEqual(SCENARIO_BODY.apartmentMix);
    expect(created.costItems).toEqual(SCENARIO_BODY.costItems);
    expect(created.discountRate).toBe(SCENARIO_BODY.discountRate);
    expect(created.result).toBeNull();

    const saved = await scenarios.saveResult(
      SEED_ORG_A_ID,
      project.id,
      created.id,
      SimulationResultSchema.parse(SIMULATION_FIXTURE),
    );
    expect(saved?.result).toEqual(SIMULATION_FIXTURE);

    // A corrupted JSONB result must fail loudly on read, never leak.
    await admin.query(
      `UPDATE scenarios SET result = '{"npvAgorot": "not-a-number"}'::jsonb WHERE id = $1`,
      [created.id],
    );
    await expect(
      scenarios.getById(SEED_ORG_A_ID, project.id, created.id),
    ).rejects.toThrow();
  });

  it("cross-tenant probe on live SQL: org B cannot see, list, update or delete org A data (QA-M1-3)", async () => {
    const app = await makePgApp();
    try {
      const tokenA = await loginPg(app, USER_A);
      const tokenB = await loginPg(app, USER_B);

      const createdRes = await app.inject({
        method: "POST",
        url: "/projects",
        headers: bearer(tokenA),
        payload: PROJECT_BODY,
      });
      expect(createdRes.statusCode).toBe(201);
      const project = createdRes.json() as { id: string };

      // Org B: list is empty; direct read/update/delete are 404 —
      // indistinguishable from a project that does not exist.
      const listB = await app.inject({
        method: "GET",
        url: "/projects",
        headers: bearer(tokenB),
      });
      expect(listB.statusCode).toBe(200);
      expect(listB.json()).toEqual([]);

      for (const attempt of [
        { method: "GET" as const, url: `/projects/${project.id}` },
        {
          method: "PATCH" as const,
          url: `/projects/${project.id}`,
          payload: { name: "hijack" },
        },
        { method: "DELETE" as const, url: `/projects/${project.id}` },
        { method: "GET" as const, url: `/projects/${project.id}/scenarios` },
      ]) {
        const res = await app.inject({ ...attempt, headers: bearer(tokenB) });
        expect(res.statusCode).toBe(404);
      }

      // Org A's project is untouched in the database itself.
      const { rows } = await admin.query<{ name: string; org_id: string }>(
        "SELECT name, org_id FROM projects WHERE id = $1",
        [project.id],
      );
      expect(rows[0]).toEqual({
        name: PROJECT_BODY.name,
        org_id: SEED_ORG_A_ID,
      });
    } finally {
      await app.close();
    }
  });

  it("data survives an app restart — new process, same database (ATL-003 AC-1)", async () => {
    const app1 = await makePgApp();
    let projectId: string;
    try {
      const token = await loginPg(app1, USER_A);
      const created = await app1.inject({
        method: "POST",
        url: "/projects",
        headers: bearer(token),
        payload: PROJECT_BODY,
      });
      expect(created.statusCode).toBe(201);
      projectId = (created.json() as { id: string }).id;
    } finally {
      await app1.close(); // ends app1's pool — the "process" is gone
    }

    const app2 = await makePgApp();
    try {
      const token = await loginPg(app2, USER_A); // users survived too
      const fetched = await app2.inject({
        method: "GET",
        url: `/projects/${projectId}`,
        headers: bearer(token),
      });
      expect(fetched.statusCode).toBe(200);
      expect((fetched.json() as { name: string }).name).toBe(PROJECT_BODY.name);
    } finally {
      await app2.close();
    }
  });

  it("/readyz pings the real database when configured", async () => {
    const app = await makePgApp();
    try {
      const res = await app.inject({ method: "GET", url: "/readyz" });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ status: "ok", database: "ok" });
    } finally {
      await app.close();
    }
  });

  it("duplicate case number within an org is a 409, across orgs is fine", async () => {
    const repo = new PgProjectsRepo(admin);
    const body = ProjectCreateSchema.parse(PROJECT_BODY);
    await repo.create(SEED_ORG_A_ID, body);
    await expect(repo.create(SEED_ORG_A_ID, body)).rejects.toMatchObject({
      statusCode: 409,
      code: "DUPLICATE_CASE_NUMBER",
    });
    // Same case number in another org is allowed (dedup is per-org).
    await expect(repo.create(SEED_ORG_B_ID, body)).resolves.toMatchObject({
      orgId: SEED_ORG_B_ID,
    });
  });
});
