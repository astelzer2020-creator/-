import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ApiErrorSchema } from "@atlas/shared";

import { AppError } from "../src/lib/errors.js";
import { bearer, login, makeApp, USERS } from "./helpers.js";

describe("error envelope", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await makeApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("wraps unknown routes in the {error:{code,message}} envelope", async () => {
    const response = await app.inject({ method: "GET", url: "/no/such/route" });
    expect(response.statusCode).toBe(404);
    const body: unknown = response.json();
    expect(ApiErrorSchema.parse(body).error.code).toBe("NOT_FOUND");
  });

  it("wraps validation failures with code and details", async () => {
    const token = await login(app, USERS.analystA);
    const response = await app.inject({
      method: "POST",
      url: "/projects",
      headers: bearer(token),
      payload: { name: 42 },
    });
    expect(response.statusCode).toBe(400);
    const parsed = ApiErrorSchema.parse(response.json());
    expect(parsed.error.code).toBe("VALIDATION_ERROR");
    expect(parsed.error.details).toBeDefined();
  });

  it("maps a thrown AppError to its status, code and message", async () => {
    app.get("/boom", { config: { auth: { public: true } } }, async () => {
      throw new AppError(418, "TEAPOT", "short and stout", { handle: true });
    });
    const response = await app.inject({ method: "GET", url: "/boom" });
    expect(response.statusCode).toBe(418);
    expect(response.json()).toEqual({
      error: {
        code: "TEAPOT",
        message: "short and stout",
        details: { handle: true },
      },
    });
  });

  it("hides internals on unexpected errors (500 INTERNAL)", async () => {
    app.get("/crash", { config: { auth: { public: true } } }, async () => {
      throw new Error("secret db password leaked?");
    });
    const response = await app.inject({ method: "GET", url: "/crash" });
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: { code: "INTERNAL", message: "Internal server error" },
    });
  });

  it("keeps health endpoints public and healthy", async () => {
    for (const url of ["/healthz", "/readyz"]) {
      const response = await app.inject({ method: "GET", url });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: "ok" });
    }
  });
});
