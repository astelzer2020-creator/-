import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";
import { RoleSchema, type Role } from "@atlas/shared";

import { AppError } from "../lib/errors.js";
import type { UserStore } from "../modules/auth/user-store.js";

/** JWT claims carried by every access token. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  orgId: string;
}

/**
 * Per-route authorization policy, declared in the route's `config.auth`.
 * docs/SECURITY.md: EVERY route declares its required role explicitly; a
 * route with no declaration fails closed (403), enforced by the onRequest
 * hook below.
 */
export interface RouteAuthPolicy {
  /** Explicitly public route (login, health probes). */
  public?: boolean;
  /** Minimum role required; admin ≥ analyst ≥ viewer. */
  role?: Role;
}

declare module "fastify" {
  interface FastifyContextConfig {
    auth?: RouteAuthPolicy;
  }
  interface FastifyInstance {
    userStore: UserStore;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AccessTokenPayload;
    user: AccessTokenPayload;
  }
}

const ROLE_RANK: Record<Role, number> = { viewer: 0, analyst: 1, admin: 2 };

/** Access-token lifetime: 15 minutes (docs/SECURITY.md). */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export interface AuthPluginOptions {
  jwtSecret: string;
  userStore: UserStore;
}

export const authPlugin = fp<AuthPluginOptions>(
  async (app, opts) => {
    await app.register(fastifyJwt, {
      secret: opts.jwtSecret,
      sign: { algorithm: "HS256", expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    });
    app.decorate("userStore", opts.userStore);

    app.addHook("onRequest", async (request) => {
      // No matched route: fall through to the 404 handler (nothing to protect).
      if (request.routeOptions.url === undefined) {
        return;
      }
      const policy = request.routeOptions.config.auth;
      if (policy?.public === true) {
        return;
      }
      const requiredRole = policy?.role;
      if (requiredRole === undefined) {
        // Fail closed: undeclared routes are unreachable, by design.
        throw new AppError(
          403,
          "ROUTE_POLICY_MISSING",
          "Route declares no auth policy; access denied",
        );
      }
      await request.jwtVerify();
      const role = RoleSchema.safeParse(request.user.role);
      if (!role.success) {
        throw new AppError(401, "INVALID_TOKEN", "Token carries an unknown role");
      }
      if (ROLE_RANK[role.data] < ROLE_RANK[requiredRole]) {
        throw new AppError(403, "FORBIDDEN", "Insufficient role for this route");
      }
    });
  },
  { name: "auth" },
);
