/**
 * HTTP-boundary mapping between the web form/view-model shapes (lib/contracts.ts)
 * and the @atlas/shared wire contract served by apps/api (ATL-023, fixes QA-M1-1).
 *
 * The web keeps its historical form shape (ApartmentMixRow with
 * rooms/count/salePricePerUnitAgorot, named cost fields) because that is how
 * Israeli developers reason about a scheme (per-unit sale prices, a per-sqm
 * build cost); the shared contract models the same scenario as
 * {label, units, areaSqm, salePricePerSqmAgorot} lines plus generic costItems[].
 * Everything here converts between the two — request direction AND response
 * direction — so no page ever sees a wire shape.
 *
 * FINANCIAL MATH DISCIPLINE (docs/CODING_STANDARDS.md rule 3):
 * - All money is integer agorot. Two conversions here perform arithmetic on
 *   money and are therefore rounding points; both use Math.round (round half
 *   toward +Infinity, which for the positive amounts validated by the form is
 *   round half away from zero) and both re-assert Number.isSafeInteger:
 *   1. per-unit → per-sqm sale price:
 *        salePricePerSqmAgorot = round(salePricePerUnitAgorot / areaSqm)
 *      Max representation error is 0.5 agorot per sqm, i.e. the engine-side
 *      revenue of a mix line (units × areaSqm × pricePerSqm) can differ from
 *      the form-side units × pricePerUnit by at most units × areaSqm × 0.5
 *      agorot. This is a disclosed contract conversion, not drift: the shared
 *      contract is per-sqm, and the rounded per-sqm price IS the number the
 *      engine uses. The hand-computed case in api-mapping.test.ts pins this
 *      to the agora.
 *   2. build cost total:
 *        buildCost.amountAgorot = round(buildCostPerSqmAgorot × Σ(count × areaSqm))
 *      areaSqm may be fractional, so the single float multiply is rounded once,
 *      immediately.
 * - otherCostsAgorot and discountRate pass through untouched (no arithmetic).
 * - constructionMonths is DROPPED: the shared ScenarioCreate does not carry it
 *   (the engine owns cashflow timing). It remains a form/demo-only field.
 */

import { t } from "../i18n";
import type {
  Project,
  ProjectStatus,
  Scenario,
  ScenarioInput,
  SimulationResult,
} from "./contracts";

/* ------------------------------------------------------------------ *
 * Wire shapes — a LOCAL structural mirror of @atlas/shared (the zod ^3/^4
 * split still blocks importing the schemas at runtime in app code; the
 * REAL shared ScenarioCreateSchema guards these shapes in
 * api-mapping.test.ts, so divergence fails the suite).
 * ------------------------------------------------------------------ */

export interface ApartmentMixEntryWire {
  label: string;
  units: number;
  areaSqm: number;
  salePricePerSqmAgorot: number;
}

export interface CostItemWire {
  label: string;
  amountAgorot: number;
}

export interface ScenarioCreateWire {
  name: string;
  apartmentMix: ApartmentMixEntryWire[];
  costItems: CostItemWire[];
  discountRate: number;
}

export interface ScenarioWire extends ScenarioCreateWire {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  /** Last stored simulation, or null when never simulated. */
  result: SimulationResult | null;
}

/** Shared Project: everything beyond `name` is optional (taba imports vary). */
export interface ProjectWire {
  id: string;
  orgId: string;
  name: string;
  caseNumber?: string;
  city?: string;
  planType?: string;
  status?: string;
  existingUnits?: number;
  proposedUnits?: number;
  landValueAgorot?: number;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ *
 * Money-safe rounding
 * ------------------------------------------------------------------ */

/** Rounds a boundary conversion to integer agorot; refuses unsafe integers loudly. */
function toSafeAgorot(value: number, field: string): number {
  const rounded = Math.round(value);
  if (!Number.isSafeInteger(rounded)) {
    // Never send a precision-lossy amount to the API — fail the mutation instead.
    throw new RangeError(
      `${field}: agorot amount is not a safe integer (${String(value)})`,
    );
  }
  return rounded;
}

/* ------------------------------------------------------------------ *
 * Request direction: form → shared ScenarioCreate
 * ------------------------------------------------------------------ */

/** Total built area of the mix in sqm (non-monetary; may be fractional). */
function totalAreaSqm(input: Pick<ScenarioInput, "apartmentMix">): number {
  return input.apartmentMix.reduce(
    (sum, row) => sum + row.count * row.areaSqm,
    0,
  );
}

/**
 * Maps the validated scenario form to the shared ScenarioCreate wire shape.
 * See the module header for the two rounding points.
 */
export function toScenarioCreate(input: ScenarioInput): ScenarioCreateWire {
  return {
    name: input.name,
    apartmentMix: input.apartmentMix.map((row) => ({
      label: t("scenario.mix.label", { rooms: row.rooms }),
      units: row.count,
      areaSqm: row.areaSqm,
      salePricePerSqmAgorot: toSafeAgorot(
        row.salePricePerUnitAgorot / row.areaSqm,
        "salePricePerSqmAgorot",
      ),
    })),
    costItems: [
      {
        label: t("scenario.cost.buildCost"),
        amountAgorot: toSafeAgorot(
          input.buildCostPerSqmAgorot * totalAreaSqm(input),
          "costItems.buildCost.amountAgorot",
        ),
      },
      {
        // Included even at 0 so the stored scenario mirrors what the user entered.
        label: t("scenario.cost.otherCosts"),
        amountAgorot: input.otherCostsAgorot,
      },
    ],
    discountRate: input.discountRate,
  };
}

/* ------------------------------------------------------------------ *
 * Response direction: shared wire → web view-model
 * ------------------------------------------------------------------ */

const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "planning",
  "approved",
  "inProgress",
  "completed",
];

function toProjectStatus(status: string | undefined): ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(status ?? "")
    ? (status as ProjectStatus)
    : "planning";
}

/**
 * Shared Project → web Project. The shared contract makes everything beyond
 * `name` optional (taba imports vary in columns); the web view-model predates
 * that and requires the fields, so absent values render as empty strings /
 * zero counts. Display defaulting only — no financial arithmetic happens here.
 * (Known gap for Product: a first-class "not provided" rendering.)
 */
export function fromProjectWire(wire: ProjectWire): Project {
  return {
    id: wire.id,
    name: wire.name,
    caseNumber: wire.caseNumber ?? "",
    city: wire.city ?? "",
    planType: wire.planType ?? "",
    status: toProjectStatus(wire.status),
    existingUnits: wire.existingUnits ?? 0,
    proposedUnits: wire.proposedUnits ?? 0,
    landValueAgorot: wire.landValueAgorot ?? 0,
  };
}

/** Extracts the leading integer of a mix-line label ("3 חדרים" → 3); 0 when absent. */
function roomsFromLabel(label: string): number {
  const match = /^(\d+)/.exec(label.trim());
  return match === null ? 0 : Number(match[1]);
}

/**
 * Shared Scenario → web Scenario (the inverse mapping, for stored scenarios).
 * Lossy by nature and used for DISPLAY ONLY (scenario list: name, unit count,
 * discount rate) — never as input to further financial arithmetic:
 * - rooms is parsed back from the Hebrew label (0 when the label is foreign);
 * - salePricePerUnitAgorot = round(salePricePerSqmAgorot × areaSqm);
 * - buildCostPerSqmAgorot is re-derived from the build-cost item over the total
 *   area; cost items not matching the build-cost label sum into otherCostsAgorot;
 * - constructionMonths is not part of the shared contract → 0 (no page renders
 *   it for stored scenarios).
 */
export function fromScenarioWire(wire: ScenarioWire): Scenario {
  const area = totalAreaSqm({
    apartmentMix: wire.apartmentMix.map((entry) => ({
      rooms: 0,
      count: entry.units,
      areaSqm: entry.areaSqm,
      salePricePerUnitAgorot: 0,
    })),
  });
  const buildCostLabel = t("scenario.cost.buildCost");
  const buildCostTotalAgorot = wire.costItems
    .filter((item) => item.label === buildCostLabel)
    .reduce((sum, item) => sum + item.amountAgorot, 0);
  const otherCostsAgorot = wire.costItems
    .filter((item) => item.label !== buildCostLabel)
    .reduce((sum, item) => sum + item.amountAgorot, 0);

  return {
    id: wire.id,
    projectId: wire.projectId,
    name: wire.name,
    apartmentMix: wire.apartmentMix.map((entry) => ({
      rooms: roomsFromLabel(entry.label),
      count: entry.units,
      areaSqm: entry.areaSqm,
      salePricePerUnitAgorot: toSafeAgorot(
        entry.salePricePerSqmAgorot * entry.areaSqm,
        "salePricePerUnitAgorot",
      ),
    })),
    buildCostPerSqmAgorot:
      area > 0 ? toSafeAgorot(buildCostTotalAgorot / area, "buildCostPerSqmAgorot") : 0,
    otherCostsAgorot,
    discountRate: wire.discountRate,
    constructionMonths: 0,
  };
}
