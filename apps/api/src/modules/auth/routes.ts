import type { FastifyPluginAsync } from "fastify";
import { LoginRequestSchema, type LoginResponse } from "@atlas/shared";

import { AppError } from "../../lib/errors.js";
import { ACCESS_TOKEN_TTL_SECONDS } from "../../plugins/auth.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/auth/login",
    { config: { auth: { public: true } } },
    async (request) => {
      const body = LoginRequestSchema.parse(request.body);
      const user = await app.userStore.findByEmail(body.email);
      // Same error for unknown email and wrong password — no account probing.
      const verified =
        user !== null &&
        (await app.userStore.verifyPassword(user, body.password));
      if (!verified || user === null) {
        throw new AppError(
          401,
          "INVALID_CREDENTIALS",
          "Email or password is incorrect",
        );
      }
      const accessToken = app.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      });
      const response: LoginResponse = {
        accessToken,
        tokenType: "Bearer",
        expiresInSeconds: ACCESS_TOKEN_TTL_SECONDS,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
        },
      };
      return response;
    },
  );
};
