import fp from "fastify-plugin";
import { ZodError } from "zod";

import { AppError } from "../lib/errors.js";

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

function envelope(code: string, message: string, details?: unknown): ErrorBody {
  return {
    error: { code, message, ...(details === undefined ? {} : { details }) },
  };
}

/**
 * Installs the single API error envelope (docs/CODING_STANDARDS.md rule 4):
 * every non-2xx response is `{ error: { code, message, details? } }`.
 */
export const errorEnvelopePlugin = fp(
  async (app) => {
    app.setNotFoundHandler(async (request, reply) => {
      return reply
        .status(404)
        .send(
          envelope(
            "NOT_FOUND",
            `Route ${request.method} ${request.url} not found`,
          ),
        );
    });

    app.setErrorHandler(async (error: unknown, request, reply) => {
      if (error instanceof AppError) {
        return reply
          .status(error.statusCode)
          .send(envelope(error.code, error.message, error.details));
      }
      if (error instanceof ZodError) {
        return reply
          .status(400)
          .send(
            envelope(
              "VALIDATION_ERROR",
              "Request failed validation",
              error.issues,
            ),
          );
      }
      // Framework errors (e.g. @fastify/jwt) carry statusCode/code on an Error.
      const httpError =
        error instanceof Error
          ? (error as Error & { statusCode?: unknown; code?: unknown })
          : null;
      const statusCode =
        httpError !== null &&
        typeof httpError.statusCode === "number" &&
        httpError.statusCode >= 400
          ? httpError.statusCode
          : 500;
      if (httpError === null || statusCode >= 500) {
        // Never leak internals; the log carries the details.
        request.log.error(error);
        return reply
          .status(statusCode)
          .send(envelope("INTERNAL", "Internal server error"));
      }
      return reply
        .status(statusCode)
        .send(
          envelope(
            typeof httpError.code === "string"
              ? httpError.code
              : "REQUEST_ERROR",
            httpError.message,
          ),
        );
    });
  },
  { name: "error-envelope" },
);
