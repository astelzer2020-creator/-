import { randomUUID } from "node:crypto";

import type { Scenario, ScenarioCreate, SimulationResult } from "@atlas/shared";

import type { ScenariosRepo } from "./repo.js";

interface ScenarioRecord {
  orgId: string;
  scenario: Scenario;
}

/** In-memory scenarios repository — the M1 adapter (also used by tests). */
export class InMemoryScenariosRepo implements ScenariosRepo {
  private readonly byId = new Map<string, ScenarioRecord>();

  create(orgId: string, projectId: string, input: ScenarioCreate): Promise<Scenario> {
    const now = new Date().toISOString();
    const scenario: Scenario = {
      ...input,
      id: randomUUID(),
      projectId,
      createdAt: now,
      updatedAt: now,
      result: null,
    };
    this.byId.set(scenario.id, { orgId, scenario });
    return Promise.resolve(scenario);
  }

  listByProject(orgId: string, projectId: string): Promise<Scenario[]> {
    const scenarios = [...this.byId.values()]
      .filter((record) => record.orgId === orgId && record.scenario.projectId === projectId)
      .map((record) => record.scenario);
    return Promise.resolve(scenarios);
  }

  getById(orgId: string, projectId: string, scenarioId: string): Promise<Scenario | null> {
    const record = this.byId.get(scenarioId);
    const found =
      record !== undefined && record.orgId === orgId && record.scenario.projectId === projectId;
    return Promise.resolve(found ? record.scenario : null);
  }

  async saveResult(
    orgId: string,
    projectId: string,
    scenarioId: string,
    result: SimulationResult,
  ): Promise<Scenario | null> {
    const existing = await this.getById(orgId, projectId, scenarioId);
    if (existing === null) {
      return null;
    }
    const updated: Scenario = { ...existing, result, updatedAt: new Date().toISOString() };
    this.byId.set(scenarioId, { orgId, scenario: updated });
    return updated;
  }
}
