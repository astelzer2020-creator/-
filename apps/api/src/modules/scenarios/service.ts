import type {
  Scenario,
  ScenarioCreate,
  SimulationRequest,
} from "@atlas/shared";

import type { AnalyticsClient } from "../../lib/analytics-client.js";
import { notFound } from "../../lib/errors.js";
import type { ProjectsService } from "../projects/service.js";
import type { ScenariosRepo } from "./repo.js";

export class ScenariosService {
  constructor(
    private readonly repo: ScenariosRepo,
    private readonly projects: ProjectsService,
    private readonly analytics: AnalyticsClient,
  ) {}

  async create(
    orgId: string,
    projectId: string,
    input: ScenarioCreate,
  ): Promise<Scenario> {
    await this.projects.get(orgId, projectId); // 404 when the project is not in this org
    return this.repo.create(orgId, projectId, input);
  }

  async listByProject(orgId: string, projectId: string): Promise<Scenario[]> {
    await this.projects.get(orgId, projectId);
    return this.repo.listByProject(orgId, projectId);
  }

  async get(
    orgId: string,
    projectId: string,
    scenarioId: string,
  ): Promise<Scenario> {
    const scenario = await this.repo.getById(orgId, projectId, scenarioId);
    if (scenario === null) {
      throw notFound("Scenario");
    }
    return scenario;
  }

  /**
   * Runs the scenario through the analytics service, stores the result on the
   * scenario and returns the updated scenario. If analytics is unreachable
   * this surfaces 503 ANALYTICS_UNAVAILABLE from the client — there is no
   * local fallback computation, ever (CODEBASE_AUDIT: the legacy silent
   * fallback is banned).
   */
  async simulate(
    orgId: string,
    projectId: string,
    scenarioId: string,
  ): Promise<Scenario> {
    const scenario = await this.get(orgId, projectId, scenarioId);
    const request: SimulationRequest = {
      apartmentMix: scenario.apartmentMix,
      costItems: scenario.costItems,
      discountRate: scenario.discountRate,
    };
    const result = await this.analytics.simulate(request);
    const updated = await this.repo.saveResult(
      orgId,
      projectId,
      scenarioId,
      result,
    );
    if (updated === null) {
      throw notFound("Scenario");
    }
    return updated;
  }
}
