import type { FastifyInstance } from "fastify";
import { MockAgent } from "undici";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Project, Scenario } from "@atlas/shared";

import {
  ANALYTICS_ORIGIN,
  bearer,
  login,
  makeApp,
  PROJECT_BODY,
  SCENARIO_BODY,
  SIMULATION_FIXTURE,
  TEST_CONFIG,
  USERS,
} from "./helpers.js";

async function setupProjectAndScenario(
  app: FastifyInstance,
  token: string,
): Promise<{ projectId: string; scenarioId: string }> {
  const project = await app.inject({
    method: "POST",
    url: "/projects",
    headers: bearer(token),
    payload: PROJECT_BODY,
  });
  expect(project.statusCode).toBe(201);
  const projectId = (project.json() as Project).id;

  const scenario = await app.inject({
    method: "POST",
    url: `/projects/${projectId}/scenarios`,
    headers: bearer(token),
    payload: SCENARIO_BODY,
  });
  expect(scenario.statusCode).toBe(201);
  return { projectId, scenarioId: (scenario.json() as Scenario).id };
}

describe("scenarios and simulation", () => {
  let app: FastifyInstance;
  let mockAgent: MockAgent;
  let analystA: string;

  beforeEach(async () => {
    mockAgent = new MockAgent();
    mockAgent.disableNetConnect();
    app = await makeApp({ analyticsDispatcher: mockAgent });
    analystA = await login(app, USERS.analystA);
  });

  afterEach(async () => {
    await app.close();
    await mockAgent.close();
  });

  it("creates a scenario under a project and rejects percent-point discount rates", async () => {
    const { scenarioId } = await setupProjectAndScenario(app, analystA);
    expect(scenarioId).toBeTruthy();

    const project = await app.inject({
      method: "POST",
      url: "/projects",
      headers: bearer(analystA),
      payload: PROJECT_BODY,
    });
    const projectId = (project.json() as Project).id;
    const invalid = await app.inject({
      method: "POST",
      url: `/projects/${projectId}/scenarios`,
      headers: bearer(analystA),
      payload: { ...SCENARIO_BODY, discountRate: 7 },
    });
    expect(invalid.statusCode).toBe(400);
    expect((invalid.json() as { error: { code: string } }).error.code).toBe(
      "VALIDATION_ERROR",
    );
  });

  it("simulates via the analytics service, stores and returns the result", async () => {
    const { projectId, scenarioId } = await setupProjectAndScenario(
      app,
      analystA,
    );

    mockAgent
      .get(ANALYTICS_ORIGIN)
      .intercept({ path: "/v1/simulate", method: "POST" })
      .reply(200, SIMULATION_FIXTURE, {
        headers: { "content-type": "application/json" },
      });

    const simulated = await app.inject({
      method: "POST",
      url: `/projects/${projectId}/scenarios/${scenarioId}/simulate`,
      headers: bearer(analystA),
    });
    expect(simulated.statusCode).toBe(200);
    const scenario = simulated.json() as Scenario;
    expect(scenario.result).toEqual(SIMULATION_FIXTURE);
    expect(scenario.result?.irr).toBe("0.1432");

    // The result is persisted on the scenario.
    const fetched = await app.inject({
      method: "GET",
      url: `/projects/${projectId}/scenarios/${scenarioId}`,
      headers: bearer(analystA),
    });
    expect(fetched.statusCode).toBe(200);
    expect((fetched.json() as Scenario).result).toEqual(SIMULATION_FIXTURE);
  });

  it("returns 503 ANALYTICS_UNAVAILABLE when analytics is unreachable — never a fallback number", async () => {
    // Real connection to a closed local port: no dispatcher mock, no fallback.
    const offlineApp = await makeApp({
      config: { ...TEST_CONFIG, analyticsUrl: "http://127.0.0.1:9" },
    });
    const token = await login(offlineApp, USERS.analystA);
    const { projectId, scenarioId } = await setupProjectAndScenario(
      offlineApp,
      token,
    );

    const response = await offlineApp.inject({
      method: "POST",
      url: `/projects/${projectId}/scenarios/${scenarioId}/simulate`,
      headers: bearer(token),
    });
    expect(response.statusCode).toBe(503);
    expect((response.json() as { error: { code: string } }).error.code).toBe(
      "ANALYTICS_UNAVAILABLE",
    );

    // No result was fabricated or stored.
    const fetched = await offlineApp.inject({
      method: "GET",
      url: `/projects/${projectId}/scenarios/${scenarioId}`,
      headers: bearer(token),
    });
    expect((fetched.json() as Scenario).result).toBeNull();
    await offlineApp.close();
  });

  it("rejects an analytics response that violates the contract (502, result not stored)", async () => {
    const { projectId, scenarioId } = await setupProjectAndScenario(
      app,
      analystA,
    );

    mockAgent
      .get(ANALYTICS_ORIGIN)
      .intercept({ path: "/v1/simulate", method: "POST" })
      .reply(
        200,
        { ...SIMULATION_FIXTURE, irr: 0.14 },
        {
          headers: { "content-type": "application/json" },
        },
      );

    const response = await app.inject({
      method: "POST",
      url: `/projects/${projectId}/scenarios/${scenarioId}/simulate`,
      headers: bearer(analystA),
    });
    expect(response.statusCode).toBe(502);
    expect((response.json() as { error: { code: string } }).error.code).toBe(
      "ANALYTICS_CONTRACT_VIOLATION",
    );
  });

  it("cross-tenant probe: org B cannot see or simulate org A's scenarios", async () => {
    const { projectId, scenarioId } = await setupProjectAndScenario(
      app,
      analystA,
    );
    const analystB = await login(app, USERS.analystB);

    const read = await app.inject({
      method: "GET",
      url: `/projects/${projectId}/scenarios/${scenarioId}`,
      headers: bearer(analystB),
    });
    expect(read.statusCode).toBe(404);

    const simulate = await app.inject({
      method: "POST",
      url: `/projects/${projectId}/scenarios/${scenarioId}/simulate`,
      headers: bearer(analystB),
    });
    expect(simulate.statusCode).toBe(404);
  });
});
