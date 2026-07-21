/**
 * Typed application error mapped to the single API error envelope
 * `{ error: { code, message, details? } }` by the error-envelope plugin
 * (docs/CODING_STANDARDS.md rule 4). Throw these, never strings.
 */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFound(resource: string): AppError {
  return new AppError(404, "NOT_FOUND", `${resource} not found`);
}

export function notImplemented(what: string): AppError {
  return new AppError(501, "NOT_IMPLEMENTED", what);
}
