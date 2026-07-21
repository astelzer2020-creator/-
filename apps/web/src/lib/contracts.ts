/**
 * API contract types for the Atlas pilot walking skeleton.
 *
 * TODO(shared): this file is a LOCAL mirror pending the swap to @atlas/shared.
 * The shared package landed mid-flight with shapes that DIVERGE from this work
 * package's approved API contract — known deltas to reconcile before swapping
 * (flagged for CEO/integration, see handoff): roiOnCost string (here, per spec)
 * vs number (shared); paybackPeriods months (spec) vs paybackYears (shared);
 * ApartmentMixRow rooms/count/salePricePerUnitAgorot (spec form fields) vs
 * label/units/salePricePerSqmAgorot (shared); named cost fields (spec) vs
 * costItems[] (shared); web pins zod ^3, shared uses ^4. Sensitivity axis names
 * are already aligned to shared (priceDeltas/costDeltas).
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
  /** ROI on total cost as a decimal-fraction string. */
  roiOnCost: string;
  /** Months until cumulative cashflow turns positive, or null if it never does. */
  paybackPeriods: number | null;
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
  token: string;
}

/** The single API error envelope (docs/CODING_STANDARDS.md rule 4). */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
