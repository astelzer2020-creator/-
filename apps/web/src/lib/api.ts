import type {
  LoginInput,
  LoginResponse,
  NewProject,
  Project,
  ProjectDetail,
  Scenario,
  ScenarioInput,
  SimulationResult,
} from "./contracts";
import {
  fromProjectWire,
  fromScenarioWire,
  toScenarioCreate,
  type ProjectWire,
  type ScenarioWire,
} from "./api-mapping";
import { authStore } from "./auth-store";
import { t, type MessageKey } from "../i18n";

/** The typed client surface every page consumes (HTTP in production, in-memory in demo). */
export interface AtlasApi {
  login(input: LoginInput): Promise<LoginResponse>;
  listProjects(): Promise<Project[]>;
  createProject(input: NewProject): Promise<Project>;
  getProject(projectId: string): Promise<ProjectDetail>;
  createScenario(projectId: string, input: ScenarioInput): Promise<Scenario>;
  simulate(projectId: string, scenarioId: string): Promise<SimulationResult>;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/** Demo mode is ON unless explicitly disabled, so dev/preview run standalone. */
export function isDemoMode(): boolean {
  return (import.meta.env.VITE_DEMO ?? "1") !== "0";
}

/**
 * Known API error codes → Hebrew messages (i18n rule: user-facing strings come
 * from the catalog, never off the wire — the API's messages are English).
 * Unknown codes fall back to the generic Hebrew error; the code survives on
 * ApiError for programmatic handling.
 */
const MESSAGE_KEY_BY_CODE: Readonly<Partial<Record<string, MessageKey>>> = {
  DUPLICATE_CASE_NUMBER: "errors.duplicateCaseNumber",
  INVALID_CREDENTIALS: "auth.errors.loginFailed",
  NOT_FOUND: "common.notFound",
  ANALYTICS_UNAVAILABLE: "errors.analyticsUnavailable",
};

interface RequestOptions {
  method: "GET" | "POST";
  body?: unknown;
  auth: boolean;
}

async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    // Only when a body is actually sent — Fastify 400s a body-less POST that
    // declares application/json (FST_ERR_CTP_EMPTY_JSON_BODY), e.g. /simulate.
    headers["content-type"] = "application/json";
  }
  if (options.auth) {
    const token = authStore.getToken();
    if (token !== null) {
      headers.authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", t("errors.network"), 0);
  }

  if (!response.ok) {
    if (response.status === 401 && options.auth) {
      // Access token expired/invalid mid-session (15-min TTL, no refresh flow
      // yet — see auth-store.ts): drop the in-memory token; RequireAuth
      // re-renders via useSyncExternalStore and redirects to /login with the
      // current location preserved in `state.from`.
      authStore.clear();
      throw new ApiError("UNAUTHORIZED", t("errors.unauthorized"), 401);
    }
    // Boundary validation of the error envelope (never trust the wire shape).
    let code = "UNKNOWN";
    try {
      const payload: unknown = await response.json();
      if (
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof (payload as { error: unknown }).error === "object"
      ) {
        const errorField = (payload as { error: { code?: unknown } }).error;
        if (typeof errorField.code === "string") {
          code = errorField.code;
        }
      }
    } catch {
      // Non-JSON error body — keep the unknown code.
    }
    const messageKey = MESSAGE_KEY_BY_CODE[code] ?? "errors.generic";
    throw new ApiError(code, t(messageKey), response.status);
  }

  return (await response.json()) as T;
}

/**
 * HTTP client for the real Fastify API (apps/api). All request/response shapes
 * cross through lib/api-mapping.ts — pages never see the wire contract.
 */
export function createHttpApi(
  baseUrl: string = import.meta.env.VITE_API_URL ?? "/api",
): AtlasApi {
  return {
    // Response includes tokenType/expiresInSeconds/user beyond accessToken;
    // the web only consumes accessToken (structural subtype — no mapping needed).
    login: (input) =>
      request<LoginResponse>(baseUrl, "/auth/login", {
        method: "POST",
        body: input,
        auth: false,
      }),

    listProjects: async () => {
      const wires = await request<ProjectWire[]>(baseUrl, "/projects", {
        method: "GET",
        auth: true,
      });
      return wires.map(fromProjectWire);
    },

    // Web NewProject {name, city, caseNumber} is field-name-aligned with the
    // shared ProjectCreate (where city/caseNumber are optional but the form
    // requires them non-empty) — passthrough body, mapped response.
    createProject: async (input) => {
      const wire = await request<ProjectWire>(baseUrl, "/projects", {
        method: "POST",
        body: input,
        auth: true,
      });
      return fromProjectWire(wire);
    },

    // The API has no aggregate detail endpoint — compose it from the project
    // and its scenario list (both org-scoped server-side via the token).
    getProject: async (projectId) => {
      const encoded = encodeURIComponent(projectId);
      const [projectWire, scenarioWires] = await Promise.all([
        request<ProjectWire>(baseUrl, `/projects/${encoded}`, {
          method: "GET",
          auth: true,
        }),
        request<ScenarioWire[]>(baseUrl, `/projects/${encoded}/scenarios`, {
          method: "GET",
          auth: true,
        }),
      ]);
      return {
        project: fromProjectWire(projectWire),
        scenarios: scenarioWires.map(fromScenarioWire),
      };
    },

    createScenario: async (projectId, input) => {
      const wire = await request<ScenarioWire>(
        baseUrl,
        `/projects/${encodeURIComponent(projectId)}/scenarios`,
        {
          method: "POST",
          body: toScenarioCreate(input),
          auth: true,
        },
      );
      return fromScenarioWire(wire);
    },

    // POST .../simulate returns the UPDATED SCENARIO with `result` stored on
    // it (shared contract); the web consumes the result itself.
    simulate: async (projectId, scenarioId) => {
      const wire = await request<ScenarioWire>(
        baseUrl,
        `/projects/${encodeURIComponent(projectId)}/scenarios/${encodeURIComponent(scenarioId)}/simulate`,
        { method: "POST", auth: true },
      );
      if (wire.result === null) {
        // A successful simulate must carry a result; a null here is a broken
        // server contract — surface it, never render fabricated figures.
        throw new ApiError("SIMULATION_MISSING", t("errors.generic"), 502);
      }
      return wire.result;
    },
  };
}
