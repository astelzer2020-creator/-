import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Project } from "@atlas/shared";

import { bearer, login, makeApp, PROJECT_BODY, USERS } from "./helpers.js";

describe("projects CRUD with org scoping", () => {
  let app: FastifyInstance;
  let analystA: string;
  let analystB: string;

  beforeEach(async () => {
    app = await makeApp();
    analystA = await login(app, USERS.analystA);
    analystB = await login(app, USERS.analystB);
  });

  afterEach(async () => {
    await app.close();
  });

  async function createProject(token: string): Promise<Project> {
    const response = await app.inject({
      method: "POST",
      url: "/projects",
      headers: bearer(token),
      payload: PROJECT_BODY,
    });
    expect(response.statusCode).toBe(201);
    return response.json() as Project;
  }

  it("creates, reads, updates and deletes a project within the caller's org", async () => {
    const created = await createProject(analystA);
    expect(created.name).toBe(PROJECT_BODY.name);
    expect(created.orgId).toBe(USERS.analystA.orgId);

    const list = await app.inject({
      method: "GET",
      url: "/projects",
      headers: bearer(analystA),
    });
    expect(list.statusCode).toBe(200);
    expect((list.json() as Project[]).map((p) => p.id)).toContain(created.id);

    const updated = await app.inject({
      method: "PATCH",
      url: `/projects/${created.id}`,
      headers: bearer(analystA),
      payload: { city: "רחובות" },
    });
    expect(updated.statusCode).toBe(200);
    expect((updated.json() as Project).city).toBe("רחובות");

    const deleted = await app.inject({
      method: "DELETE",
      url: `/projects/${created.id}`,
      headers: bearer(analystA),
    });
    expect(deleted.statusCode).toBe(204);

    const gone = await app.inject({
      method: "GET",
      url: `/projects/${created.id}`,
      headers: bearer(analystA),
    });
    expect(gone.statusCode).toBe(404);
  });

  it("cross-tenant probe: org B cannot read, update, delete or list org A's project", async () => {
    const projectA = await createProject(analystA);

    const read = await app.inject({
      method: "GET",
      url: `/projects/${projectA.id}`,
      headers: bearer(analystB),
    });
    expect(read.statusCode).toBe(404);

    const update = await app.inject({
      method: "PATCH",
      url: `/projects/${projectA.id}`,
      headers: bearer(analystB),
      payload: { city: "חדרה" },
    });
    expect(update.statusCode).toBe(404);

    const del = await app.inject({
      method: "DELETE",
      url: `/projects/${projectA.id}`,
      headers: bearer(analystB),
    });
    expect(del.statusCode).toBe(404);

    const listB = await app.inject({
      method: "GET",
      url: "/projects",
      headers: bearer(analystB),
    });
    expect(listB.statusCode).toBe(200);
    expect(listB.json()).toEqual([]);

    // And the project is untouched for org A.
    const stillThere = await app.inject({
      method: "GET",
      url: `/projects/${projectA.id}`,
      headers: bearer(analystA),
    });
    expect(stillThere.statusCode).toBe(200);
    expect((stillThere.json() as Project).city).toBe(PROJECT_BODY.city);
  });

  it("rejects invalid create payloads with the VALIDATION_ERROR envelope", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/projects",
      headers: bearer(analystA),
      payload: { name: "", existingUnits: -3 },
    });
    expect(response.statusCode).toBe(400);
    const body = response.json() as {
      error: { code: string; details?: unknown };
    };
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(Array.isArray(body.error.details)).toBe(true);
  });
});
