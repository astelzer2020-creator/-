import fp from "fastify-plugin";
import { ZodError } from "zod";

import { AppError } from "../lib/errors.js";

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

function envelope(code: string, message: string, details?: unknown): ErrorBody {
  return { error: { code, message, ...(details === undefined ? {} : { details }) } };
}

/**
 * Installs the single API error envelope (docs/CODING_STANDARDS.md rule 4):
 * every non-2xx response is `{ error: { code, message, details? } }`.
 */
export const errorEnvelopePlugin = fp(
  // eslint-disable-next-line @typescript-eslint/require-await
  async (app) => {
    app.setNotFoundHandler(async (request, reply) => {
      return reply
        .status(404)
        .send(envelope("NOT_FOUND", `Route ${request.method} ${request.url} not found`));
    });

    app.setErrorHandler(async (error, request, reply) => {
      if (error instanceof AppError) {
        return reply
          .status(error.statusCode)
          .send(envelope(error.code, error.message, error.details));
      }
      if (error instanceof ZodError) {
        return reply
          .status(400)
          .send(envelope("VALIDATION_ERROR", "Request failed validation", error.issues));
      }
      const statusCode =
        typeof error.statusCode === "number" && error.statusCode >= 400 ? error.statusCode : 500;
      if (statusCode >= 500) {
        // Never leak internals; the log carries the details.
        request.log.error(error);
        return reply.status(statusCode).send(envelope("INTERNAL", "Internal server error"));
      }
      return reply.status(statusCode).send(envelope(error.code ?? "REQUEST_ERROR", error.message));
    });
  },
  { name: "error-envelope" },
);
