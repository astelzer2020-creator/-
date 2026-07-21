import type { Scenario, ScenarioCreate, SimulationResult } from "@atlas/shared";

/**
 * Scenarios repository contract — org-scoped at the repository layer
 * (docs/SECURITY.md), same rule as projects.
 */
export interface ScenariosRepo {
  create(
    orgId: string,
    projectId: string,
    input: ScenarioCreate,
  ): Promise<Scenario>;
  listByProject(orgId: string, projectId: string): Promise<Scenario[]>;
  getById(
    orgId: string,
    projectId: string,
    scenarioId: string,
  ): Promise<Scenario | null>;
  saveResult(
    orgId: string,
    projectId: string,
    scenarioId: string,
    result: SimulationResult,
  ): Promise<Scenario | null>;
}
