import type { Scenario, ScenarioCreate, SimulationResult } from "@atlas/shared";

import { notImplemented } from "../../lib/errors.js";
import type { ScenariosRepo } from "./repo.js";

const MESSAGE =
  "PgScenariosRepo is not implemented yet — schema written in migrations/0001_init.sql, " +
  "wired when the Postgres task lands (M1)";

/**
 * Postgres scenarios repository — STUB.
 *
 * TODO(M1/Postgres): implement against `migrations/0001_init.sql` (scenarios
 * table; apartment_mix/cost_items/result as JSONB validated by the shared
 * schemas at the boundary). Every method throws 501 NOT_IMPLEMENTED until
 * then.
 */
export class PgScenariosRepo implements ScenariosRepo {
  constructor(private readonly databaseUrl: string) {
    if (databaseUrl.length === 0) {
      throw new Error("PgScenariosRepo requires DATABASE_URL");
    }
  }

  create(_orgId: string, _projectId: string, _input: ScenarioCreate): Promise<Scenario> {
    return Promise.reject(notImplemented(MESSAGE));
  }

  listByProject(_orgId: string, _projectId: string): Promise<Scenario[]> {
    return Promise.reject(notImplemented(MESSAGE));
  }

  getById(_orgId: string, _projectId: string, _scenarioId: string): Promise<Scenario | null> {
    return Promise.reject(notImplemented(MESSAGE));
  }

  saveResult(
    _orgId: string,
    _projectId: string,
    _scenarioId: string,
    _result: SimulationResult,
  ): Promise<Scenario | null> {
    return Promise.reject(notImplemented(MESSAGE));
  }
}
