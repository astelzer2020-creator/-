import {
  ScenarioSchema,
  type Scenario,
  type ScenarioCreate,
  type SimulationResult,
} from "@atlas/shared";

import { numericFromDb, type Pool } from "../../db/pool.js";
import type { ScenariosRepo } from "./repo.js";

/** Raw `scenarios` row (numeric = string; jsonb parsed to JS by pg). */
interface ScenarioRow {
  id: string;
  org_id: string;
  project_id: string;
  name: string;
  apartment_mix: unknown;
  cost_items: unknown;
  discount_rate: string;
  result: unknown;
  created_at: Date;
  updated_at: Date;
}

/**
 * Maps a row to the shared `Scenario` contract. The JSONB payloads
 * (apartment_mix, cost_items, result) are re-validated by the shared zod
 * schema on every read — a hand-edited or corrupted row fails loudly here
 * instead of leaking an invalid financial shape to a caller
 * (docs/CODING_STANDARDS.md validate-at-boundary).
 */
function toScenario(row: ScenarioRow): Scenario {
  return ScenarioSchema.parse({
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    apartmentMix: row.apartment_mix,
    costItems: row.cost_items,
    discountRate: numericFromDb(row.discount_rate),
    result: row.result,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });
}

/**
 * Postgres scenarios repository (migrations/0001_init.sql). Parameterized
 * queries ONLY; every statement filters by `org_id` AND `project_id` — the
 * service has already proven the project belongs to the org, and the repo
 * still scopes each query independently (defense in depth,
 * docs/SECURITY.md). JS arrays must be stringified for jsonb parameters —
 * node-postgres would otherwise serialize them as Postgres array literals.
 */
export class PgScenariosRepo implements ScenariosRepo {
  constructor(private readonly pool: Pool) {}

  async create(
    orgId: string,
    projectId: string,
    input: ScenarioCreate,
  ): Promise<Scenario> {
    const { rows } = await this.pool.query<ScenarioRow>(
      `INSERT INTO scenarios
         (org_id, project_id, name, apartment_mix, cost_items, discount_rate)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6)
       RETURNING *`,
      [
        orgId,
        projectId,
        input.name,
        JSON.stringify(input.apartmentMix),
        JSON.stringify(input.costItems),
        input.discountRate,
      ],
    );
    const row = rows[0];
    if (row === undefined) {
      throw new Error("INSERT ... RETURNING produced no row");
    }
    return toScenario(row);
  }

  async listByProject(orgId: string, projectId: string): Promise<Scenario[]> {
    const { rows } = await this.pool.query<ScenarioRow>(
      `SELECT * FROM scenarios
       WHERE org_id = $1 AND project_id = $2
       ORDER BY created_at, id`,
      [orgId, projectId],
    );
    return rows.map(toScenario);
  }

  async getById(
    orgId: string,
    projectId: string,
    scenarioId: string,
  ): Promise<Scenario | null> {
    const { rows } = await this.pool.query<ScenarioRow>(
      `SELECT * FROM scenarios
       WHERE org_id = $1 AND project_id = $2 AND id = $3`,
      [orgId, projectId, scenarioId],
    );
    const row = rows[0];
    return row === undefined ? null : toScenario(row);
  }

  async saveResult(
    orgId: string,
    projectId: string,
    scenarioId: string,
    result: SimulationResult,
  ): Promise<Scenario | null> {
    const { rows } = await this.pool.query<ScenarioRow>(
      `UPDATE scenarios
       SET result = $4::jsonb, updated_at = now()
       WHERE org_id = $1 AND project_id = $2 AND id = $3
       RETURNING *`,
      [orgId, projectId, scenarioId, JSON.stringify(result)],
    );
    const row = rows[0];
    return row === undefined ? null : toScenario(row);
  }
}
