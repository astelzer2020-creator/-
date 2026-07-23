/**
 * API contract types for the Atlas pilot walking skeleton.
 *
 * TODO(shared): this file is a LOCAL mirror pending the swap to @atlas/shared
 * (type-only imports; blocked on the zod ^3/^4 split). SimulationResult and
 * SensitivityGrid are RECONCILED to the shared contract (integration pass,
 * 2026-07-21, roiOnCost nullability aligned 2026-07-23 / QA-M1-2 / ATL-023):
 * roiOnCost is number|null, paybackYears (years, not months), sensitivity axes
 * priceDeltas/costDeltas. The form-shape divergences (ApartmentMixRow
 * rooms/count/salePricePerUnitAgorot vs shared label/units/salePricePerSqmAgorot;
 * named cost fields vs shared costItems[]) are RESOLVED at the HTTP-client
 * boundary by lib/api-mapping.ts (ATL-023, fixes QA-M1-1); the mapping output is
 * contract-tested against the real @atlas/shared ScenarioCreateSchema in
 * lib/api-mapping.test.ts. constructionMonths remains a form/demo-only field —
 * the shared ScenarioCreate does not carry it and the mapping drops it.
 *
 * Unit conventions (docs/CODING_STANDARDS.md rule 3):
 * - monetary amounts are INTEGER AGOROT in storage and transport (suffix `Agorot`);
 * - rates are decimal fractions (0.07, never 7). IRR/ROI cross the wire as decimal
 *   strings to avoid float drift between the analytics engine and clients.
 */

export type ProjectStatus =
  "planning" | "approved" | "inProgress" | "completed";

export interface Project {
  id: string;
  /** מספר תיק — the taba case number, unique per account. */
  caseNumber: string;
  name: string;
  city: string;
  /** e.g. פינוי-בינוי, תמ"א 38/2 — free text from the taba import. */
  planType: string;
  status: ProjectStatus;
  existingUnits: number;
  proposedUnits: number;
  landValueAgorot: number;
}

export interface NewProject {
  name: string;
  city: string;
  caseNumber: string;
}

export interface ApartmentMixRow {
  /** Room count (3 = דירת 3 חדרים). */
  rooms: number;
  count: number;
  areaSqm: number;
  salePricePerUnitAgorot: number;
}

export interface ScenarioInput {
  name: string;
  apartmentMix: ApartmentMixRow[];
  buildCostPerSqmAgorot: number;
  otherCostsAgorot: number;
  /** Annual discount rate as a decimal fraction (0.07 = 7%). */
  discountRate: number;
  constructionMonths: number;
}

export interface Scenario extends ScenarioInput {
  id: string;
  projectId: string;
}

export interface SensitivityGrid {
  /** Sale-price deltas (decimal fractions, e.g. -0.1) — column axis, ascending. */
  priceDeltas: number[];
  /** Build-cost deltas (decimal fractions) — row axis, ascending. */
  costDeltas: number[];
  /** npvAgorot[rowIndex][columnIndex], integer agorot. */
  npvAgorot: number[][];
}

export interface SimulationResult {
  /** Annual IRR as a decimal-fraction string ("0.1423"), or null when undefined (no sign change). */
  irr: string | null;
  npvAgorot: number;
  profitAgorot: number;
  /**
   * ROI on total cost as a decimal fraction, or null when total cost is zero —
   * the ratio is undefined there and the engine never fabricates a number
   * (shared contract: `number | null`; QA-M1-2).
   */
  roiOnCost: number | null;
  /** Years until cumulative cashflow turns positive, or null if it never does. */
  paybackYears: number | null;
  sensitivity: SensitivityGrid;
}

export interface ProjectDetail {
  project: Project;
  scenarios: Scenario[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  /** JWT access token (shared contract field name; 15-min lifetime per SECURITY.md). */
  accessToken: string;
}

/** The single API error envelope (docs/CODING_STANDARDS.md rule 4). */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
