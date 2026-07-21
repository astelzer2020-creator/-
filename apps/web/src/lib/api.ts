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
import { authStore } from "./auth-store";
import { t } from "../i18n";

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
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
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
    if (response.status === 401) {
      // Session expired/invalid: drop the in-memory token so the guard redirects.
      authStore.clear();
      throw new ApiError("UNAUTHORIZED", t("errors.unauthorized"), 401);
    }
    // Boundary validation of the error envelope (never trust the wire shape).
    let code = "UNKNOWN";
    let message = t("errors.generic");
    try {
      const payload: unknown = await response.json();
      if (
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof (payload as { error: unknown }).error === "object"
      ) {
        const errorField = (
          payload as { error: { code?: unknown; message?: unknown } }
        ).error;
        if (typeof errorField.code === "string") {
          code = errorField.code;
        }
        if (typeof errorField.message === "string") {
          message = errorField.message;
        }
      }
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new ApiError(code, message, response.status);
  }

  return (await response.json()) as T;
}

/** HTTP client for the real Fastify API (apps/api). */
export function createHttpApi(
  baseUrl: string = import.meta.env.VITE_API_URL ?? "/api",
): AtlasApi {
  return {
    login: (input) =>
      request(baseUrl, "/auth/login", {
        method: "POST",
        body: input,
        auth: false,
      }),
    listProjects: () =>
      request(baseUrl, "/projects", { method: "GET", auth: true }),
    createProject: (input) =>
      request(baseUrl, "/projects", {
        method: "POST",
        body: input,
        auth: true,
      }),
    getProject: (projectId) =>
      request(baseUrl, `/projects/${encodeURIComponent(projectId)}`, {
        method: "GET",
        auth: true,
      }),
    createScenario: (projectId, input) =>
      request(baseUrl, `/projects/${encodeURIComponent(projectId)}/scenarios`, {
        method: "POST",
        body: input,
        auth: true,
      }),
    simulate: (projectId, scenarioId) =>
      request(
        baseUrl,
        `/projects/${encodeURIComponent(projectId)}/scenarios/${encodeURIComponent(scenarioId)}/simulate`,
        { method: "POST", auth: true },
      ),
  };
}
