import { randomUUID } from "node:crypto";

import type { Project, ProjectCreate, ProjectUpdate } from "@atlas/shared";

import type { ProjectsRepo } from "./repo.js";

/**
 * In-memory projects repository — the M1 adapter (also used by tests).
 * Replaced as the default by `PgProjectsRepo` once Postgres lands.
 */
export class InMemoryProjectsRepo implements ProjectsRepo {
  private readonly byId = new Map<string, Project>();

  create(orgId: string, input: ProjectCreate): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      ...input,
      id: randomUUID(),
      orgId,
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(project.id, project);
    return Promise.resolve(project);
  }

  list(orgId: string): Promise<Project[]> {
    return Promise.resolve(
      [...this.byId.values()].filter((p) => p.orgId === orgId),
    );
  }

  getById(orgId: string, projectId: string): Promise<Project | null> {
    const project = this.byId.get(projectId);
    return Promise.resolve(
      project !== undefined && project.orgId === orgId ? project : null,
    );
  }

  async update(
    orgId: string,
    projectId: string,
    patch: ProjectUpdate,
  ): Promise<Project | null> {
    const existing = await this.getById(orgId, projectId);
    if (existing === null) {
      return null;
    }
    const updated: Project = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.byId.set(projectId, updated);
    return updated;
  }

  async remove(orgId: string, projectId: string): Promise<boolean> {
    const existing = await this.getById(orgId, projectId);
    if (existing === null) {
      return false;
    }
    this.byId.delete(projectId);
    return true;
  }
}
