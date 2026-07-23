import {
  ProjectSchema,
  type Project,
  type ProjectCreate,
  type ProjectUpdate,
} from "@atlas/shared";

import { agorotFromDb, numericFromDb, type Pool } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { ProjectsRepo } from "./repo.js";

/** Raw `projects` row as returned by node-postgres (int8/numeric = string). */
interface ProjectRow {
  id: string;
  org_id: string;
  name: string;
  case_number: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  block: string | null;
  parcel: string | null;
  building_type: string | null;
  plan_type: string | null;
  status: string | null;
  build_year: number | null;
  existing_floors: number | null;
  proposed_floors: number | null;
  existing_units: number | null;
  proposed_units: number | null;
  lot_area_sqm: string | null;
  land_value_agorot: string | null;
  build_cost_per_sqm_agorot: string | null;
  sale_price_per_sqm_agorot: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Maps a row to the shared `Project` contract and re-validates it with the
 * shared schema — the database is a boundary like any other
 * (docs/CODING_STANDARDS.md validate-at-boundary).
 */
function toProject(row: ProjectRow): Project {
  return ProjectSchema.parse({
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    caseNumber: row.case_number ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    neighborhood: row.neighborhood ?? undefined,
    block: row.block ?? undefined,
    parcel: row.parcel ?? undefined,
    buildingType: row.building_type ?? undefined,
    planType: row.plan_type ?? undefined,
    status: row.status ?? undefined,
    buildYear: row.build_year ?? undefined,
    existingFloors: row.existing_floors ?? undefined,
    proposedFloors: row.proposed_floors ?? undefined,
    existingUnits: row.existing_units ?? undefined,
    proposedUnits: row.proposed_units ?? undefined,
    lotArea: numericFromDb(row.lot_area_sqm) ?? undefined,
    landValueAgorot: agorotFromDb(row.land_value_agorot) ?? undefined,
    buildCostPerSqmAgorot:
      agorotFromDb(row.build_cost_per_sqm_agorot) ?? undefined,
    salePricePerSqmAgorot:
      agorotFromDb(row.sale_price_per_sqm_agorot) ?? undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  });
}

/** `ProjectCreate`/`ProjectUpdate` key → column, in one fixed order. */
const PROJECT_COLUMNS = [
  ["name", "name"],
  ["caseNumber", "case_number"],
  ["address", "address"],
  ["city", "city"],
  ["neighborhood", "neighborhood"],
  ["block", "block"],
  ["parcel", "parcel"],
  ["buildingType", "building_type"],
  ["planType", "plan_type"],
  ["status", "status"],
  ["buildYear", "build_year"],
  ["existingFloors", "existing_floors"],
  ["proposedFloors", "proposed_floors"],
  ["existingUnits", "existing_units"],
  ["proposedUnits", "proposed_units"],
  ["lotArea", "lot_area_sqm"],
  ["landValueAgorot", "land_value_agorot"],
  ["buildCostPerSqmAgorot", "build_cost_per_sqm_agorot"],
  ["salePricePerSqmAgorot", "sale_price_per_sqm_agorot"],
] as const satisfies readonly (readonly [keyof ProjectCreate, string])[];

/** Postgres unique_violation; the only constraint users can trip is the
 *  per-org case-number dedup (PILOT_SCOPE AC-IMP-4). */
const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}

function duplicateCaseNumber(): AppError {
  return new AppError(
    409,
    "DUPLICATE_CASE_NUMBER",
    "A project with this case number already exists in this organization",
  );
}

/**
 * Postgres projects repository (migrations/0001_init.sql). Parameterized
 * queries ONLY; every statement filters by `org_id` taken from the token via
 * the service layer — cross-tenant access is impossible by construction
 * (docs/SECURITY.md).
 */
export class PgProjectsRepo implements ProjectsRepo {
  constructor(private readonly pool: Pool) {}

  async create(orgId: string, input: ProjectCreate): Promise<Project> {
    const columns = PROJECT_COLUMNS.map(([, column]) => column);
    const values = PROJECT_COLUMNS.map(([key]) => input[key] ?? null);
    const placeholders = columns.map((_, i) => `$${String(i + 2)}`);
    try {
      const { rows } = await this.pool.query<ProjectRow>(
        `INSERT INTO projects (org_id, ${columns.join(", ")})
         VALUES ($1, ${placeholders.join(", ")})
         RETURNING *`,
        [orgId, ...values],
      );
      const row = rows[0];
      if (row === undefined) {
        throw new Error("INSERT ... RETURNING produced no row");
      }
      return toProject(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw duplicateCaseNumber();
      }
      throw error;
    }
  }

  async list(orgId: string): Promise<Project[]> {
    const { rows } = await this.pool.query<ProjectRow>(
      "SELECT * FROM projects WHERE org_id = $1 ORDER BY created_at, id",
      [orgId],
    );
    return rows.map(toProject);
  }

  async getById(orgId: string, projectId: string): Promise<Project | null> {
    const { rows } = await this.pool.query<ProjectRow>(
      "SELECT * FROM projects WHERE org_id = $1 AND id = $2",
      [orgId, projectId],
    );
    const row = rows[0];
    return row === undefined ? null : toProject(row);
  }

  async update(
    orgId: string,
    projectId: string,
    patch: ProjectUpdate,
  ): Promise<Project | null> {
    const changed = PROJECT_COLUMNS.filter(
      ([key]) => patch[key] !== undefined,
    );
    const sets = changed.map(
      ([, column], i) => `${column} = $${String(i + 3)}`,
    );
    const values = changed.map(([key]) => patch[key] ?? null);
    try {
      const { rows } = await this.pool.query<ProjectRow>(
        `UPDATE projects
         SET ${[...sets, "updated_at = now()"].join(", ")}
         WHERE org_id = $1 AND id = $2
         RETURNING *`,
        [orgId, projectId, ...values],
      );
      const row = rows[0];
      return row === undefined ? null : toProject(row);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw duplicateCaseNumber();
      }
      throw error;
    }
  }

  async remove(orgId: string, projectId: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM projects WHERE org_id = $1 AND id = $2",
      [orgId, projectId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
