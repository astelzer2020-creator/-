import type { AtlasApi } from "./api";
import { ApiError } from "./api";
import type {
  Project,
  ProjectDetail,
  Scenario,
  ScenarioInput,
  SensitivityGrid,
  SimulationResult,
} from "./contracts";
import { t } from "../i18n";

/**
 * Demo-mode adapter (VITE_DEMO): a fully clickable in-memory dataset so the app
 * works standalone without a backend. Data is SYNTHETIC ONLY, derived from the
 * committed sample fixture data/sample/sample-taba-projects.csv — never customer
 * data (docs/TESTING_STRATEGY.md rule 4). The demo banner in the shell makes the
 * mode visible at all times.
 *
 * The demo math below is a deliberately simple two-point cashflow ILLUSTRATION,
 * NOT the analytics engine (services/analytics owns real IRR/NPV/payback with
 * golden-file tests). Demo numbers are for navigation flow only.
 */

const LATENCY_MS = import.meta.env.MODE === "test" ? 0 : 300;

function delay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, LATENCY_MS);
  });
}

/* Synthetic seed — values follow data/sample/sample-taba-projects.csv rows 1–3 (₪ × 100 = agorot). */
const seedProjects: Project[] = [
  {
    id: "p-1",
    caseNumber: "2024-001",
    name: "רח' רוטשילד 45",
    city: "תל אביב",
    planType: "פינוי-בינוי",
    status: "inProgress",
    existingUnits: 16,
    proposedUnits: 88,
    landValueAgorot: 45_000_000 * 100,
  },
  {
    id: "p-2",
    caseNumber: "2024-002",
    name: "שד' ויצמן 12",
    city: "רחובות",
    planType: 'תמ"א 38/2',
    status: "approved",
    existingUnits: 12,
    proposedUnits: 72,
    landValueAgorot: 18_000_000 * 100,
  },
  {
    id: "p-3",
    caseNumber: "2024-003",
    name: "רח' הנביאים 8",
    city: "חיפה",
    planType: "פינוי-בינוי",
    status: "planning",
    existingUnits: 20,
    proposedUnits: 100,
    landValueAgorot: 22_000_000 * 100,
  },
];

const seedScenario: Scenario = {
  id: "s-1",
  projectId: "p-1",
  name: "תרחיש בסיס",
  apartmentMix: [
    { rooms: 3, count: 40, areaSqm: 78, salePricePerUnitAgorot: 2_400_000 * 100 },
    { rooms: 4, count: 36, areaSqm: 102, salePricePerUnitAgorot: 3_100_000 * 100 },
    { rooms: 5, count: 12, areaSqm: 126, salePricePerUnitAgorot: 4_050_000 * 100 },
  ],
  buildCostPerSqmAgorot: 9_800 * 100,
  otherCostsAgorot: 12_000_000 * 100,
  discountRate: 0.07,
  constructionMonths: 36,
};

interface DemoStore {
  projects: Project[];
  scenarios: Scenario[];
  nextId: number;
}

function totals(input: ScenarioInput): { revenueAgorot: number; costAgorot: number } {
  const revenueAgorot = input.apartmentMix.reduce(
    (sum, row) => sum + row.count * row.salePricePerUnitAgorot,
    0,
  );
  const areaSqm = input.apartmentMix.reduce((sum, row) => sum + row.count * row.areaSqm, 0);
  const costAgorot = Math.round(areaSqm * input.buildCostPerSqmAgorot) + input.otherCostsAgorot;
  return { revenueAgorot, costAgorot };
}

function npvOf(revenueAgorot: number, costAgorot: number, rate: number, months: number): number {
  // Two-point model: costs at t0, revenue at completion, discounted annually.
  const years = months / 12;
  return Math.round(revenueAgorot / Math.pow(1 + rate, years)) - costAgorot;
}

function simulateScenario(input: ScenarioInput): SimulationResult {
  const { revenueAgorot, costAgorot } = totals(input);
  const profitAgorot = revenueAgorot - costAgorot;
  const years = input.constructionMonths / 12;

  const irr =
    revenueAgorot > 0 && costAgorot > 0 && profitAgorot > 0
      ? (Math.pow(revenueAgorot / costAgorot, 1 / years) - 1).toFixed(6)
      : null;
  const roiOnCost = costAgorot > 0 ? (profitAgorot / costAgorot).toFixed(6) : "0";
  const paybackPeriods = profitAgorot > 0 ? input.constructionMonths : null;

  const deltas = [-0.1, -0.05, 0, 0.05, 0.1];
  const sensitivity: SensitivityGrid = {
    salePriceDeltas: deltas,
    buildCostDeltas: deltas,
    npvAgorot: deltas.map((costDelta) =>
      deltas.map((priceDelta) =>
        npvOf(
          Math.round(revenueAgorot * (1 + priceDelta)),
          Math.round(costAgorot * (1 + costDelta)),
          input.discountRate,
          input.constructionMonths,
        ),
      ),
    ),
  };

  return {
    irr,
    npvAgorot: npvOf(revenueAgorot, costAgorot, input.discountRate, input.constructionMonths),
    profitAgorot,
    roiOnCost,
    paybackPeriods,
    sensitivity,
  };
}

export function createDemoApi(): AtlasApi {
  const store: DemoStore = {
    projects: [...seedProjects],
    scenarios: [seedScenario],
    nextId: 100,
  };

  return {
    async login(input) {
      await delay();
      // Demo accepts any syntactically valid credentials — the zod form gate still applies.
      if (!input.email.includes("@") || input.password.length < 8) {
        throw new ApiError("INVALID_CREDENTIALS", t("auth.errors.loginFailed"), 401);
      }
      return { token: `demo-token-${String(Date.now())}` };
    },

    async listProjects() {
      await delay();
      return [...store.projects];
    },

    async createProject(input) {
      await delay();
      const project: Project = {
        id: `p-${String(store.nextId++)}`,
        caseNumber: input.caseNumber,
        name: input.name,
        city: input.city,
        planType: "פינוי-בינוי",
        status: "planning",
        existingUnits: 0,
        proposedUnits: 0,
        landValueAgorot: 0,
      };
      store.projects.push(project);
      return project;
    },

    async getProject(projectId) {
      await delay();
      const project = store.projects.find((candidate) => candidate.id === projectId);
      if (!project) {
        throw new ApiError("NOT_FOUND", t("common.notFound"), 404);
      }
      const detail: ProjectDetail = {
        project,
        scenarios: store.scenarios.filter((scenario) => scenario.projectId === projectId),
      };
      return detail;
    },

    async createScenario(projectId, input) {
      await delay();
      const project = store.projects.find((candidate) => candidate.id === projectId);
      if (!project) {
        throw new ApiError("NOT_FOUND", t("common.notFound"), 404);
      }
      const scenario: Scenario = { ...input, id: `s-${String(store.nextId++)}`, projectId };
      store.scenarios.push(scenario);
      return scenario;
    },

    async simulate(projectId, scenarioId) {
      await delay();
      const scenario = store.scenarios.find(
        (candidate) => candidate.id === scenarioId && candidate.projectId === projectId,
      );
      if (!scenario) {
        throw new ApiError("NOT_FOUND", t("common.notFound"), 404);
      }
      return simulateScenario(scenario);
    },
  };
}
