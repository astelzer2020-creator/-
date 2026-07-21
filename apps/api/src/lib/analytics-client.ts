import { fetch, type Dispatcher } from "undici";
import { SimulationResultSchema, type SimulationRequest, type SimulationResult } from "@atlas/shared";

import { AppError } from "./errors.js";

const SIMULATE_TIMEOUT_MS = 10_000;

/**
 * HTTP client for the internal analytics service (docs/ARCHITECTURE.md: the
 * API is its only caller; it is never internet-facing).
 *
 * When analytics is unreachable this throws 503 ANALYTICS_UNAVAILABLE and
 * NOTHING ELSE HAPPENS — the legacy prototype's silent JS fallback
 * computation is banned (CODEBASE_AUDIT finding; wrong financial numbers are
 * an S1). The API never computes financial results itself.
 */
export class AnalyticsClient {
  constructor(
    private readonly baseUrl: string,
    private readonly dispatcher?: Dispatcher,
  ) {}

  async simulate(input: SimulationRequest): Promise<SimulationResult> {
    let response;
    try {
      response = await fetch(new URL("/v1/simulate", this.baseUrl), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(SIMULATE_TIMEOUT_MS),
        ...(this.dispatcher === undefined ? {} : { dispatcher: this.dispatcher }),
      });
    } catch {
      throw new AppError(503, "ANALYTICS_UNAVAILABLE", "Analytics service is unreachable");
    }
    if (!response.ok) {
      throw new AppError(
        502,
        "ANALYTICS_ERROR",
        `Analytics service responded with status ${String(response.status)}`,
      );
    }
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new AppError(502, "ANALYTICS_ERROR", "Analytics service returned invalid JSON");
    }
    const parsed = SimulationResultSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(
        502,
        "ANALYTICS_CONTRACT_VIOLATION",
        "Analytics response does not match the /v1/simulate contract",
        parsed.error.issues,
      );
    }
    return parsed.data;
  }
}
