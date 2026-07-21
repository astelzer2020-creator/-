import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { bearer, login, makeApp, USERS } from "./helpers.js";

describe("auth", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await makeApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("logs in with valid credentials and returns a 15-minute bearer token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: USERS.analystA.email,
        password: USERS.analystA.password,
      },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      accessToken: string;
      tokenType: string;
      expiresInSeconds: number;
      user: { email: string; role: string };
    };
    expect(body.tokenType).toBe("Bearer");
    expect(body.expiresInSeconds).toBe(15 * 60);
    expect(body.accessToken.split(".")).toHaveLength(3);
    expect(body.user.email).toBe(USERS.analystA.email);
    expect(body.user.role).toBe("analyst");
  });

  it("rejects a wrong password and an unknown email with the same 401 envelope", async () => {
    const wrongPassword = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: USERS.analystA.email, password: "wrong-password-123" },
    });
    const unknownEmail = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "nobody@example.com", password: "wrong-password-123" },
    });
    for (const response of [wrongPassword, unknownEmail]) {
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect",
        },
      });
    }
  });

  it("rejects requests without a token (401)", async () => {
    const response = await app.inject({ method: "GET", url: "/projects" });
    expect(response.statusCode).toBe(401);
    const body = response.json() as { error: { code: string } };
    expect(body.error.code).toBeTruthy();
  });

  it("enforces roles: viewer cannot create projects, analyst can", async () => {
    const viewerToken = await login(app, USERS.viewerA);
    const forbidden = await app.inject({
      method: "POST",
      url: "/projects",
      headers: bearer(viewerToken),
      payload: { name: "x" },
    });
    expect(forbidden.statusCode).toBe(403);
    expect((forbidden.json() as { error: { code: string } }).error.code).toBe(
      "FORBIDDEN",
    );

    const analystToken = await login(app, USERS.analystA);
    const created = await app.inject({
      method: "POST",
      url: "/projects",
      headers: bearer(analystToken),
      payload: { name: "רוטשילד 45" },
    });
    expect(created.statusCode).toBe(201);
  });

  it("admin satisfies analyst-level routes (role hierarchy)", async () => {
    const adminToken = await login(app, USERS.adminA);
    const created = await app.inject({
      method: "POST",
      url: "/projects",
      headers: bearer(adminToken),
      payload: { name: "פרויקט של אדמין" },
    });
    expect(created.statusCode).toBe(201);
  });

  it("fails closed on a route that declares no auth policy", async () => {
    // Deliberately register a route WITHOUT config.auth — it must be
    // unreachable even with a valid admin token (docs/SECURITY.md).
    app.get("/undeclared-route", async () => ({ leaked: true }));
    const adminToken = await login(app, USERS.adminA);
    const response = await app.inject({
      method: "GET",
      url: "/undeclared-route",
      headers: bearer(adminToken),
    });
    expect(response.statusCode).toBe(403);
    expect((response.json() as { error: { code: string } }).error.code).toBe(
      "ROUTE_POLICY_MISSING",
    );
  });
});
