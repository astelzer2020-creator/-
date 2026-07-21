import type { Project, ProjectCreate, ProjectUpdate } from "@atlas/shared";

import { notFound } from "../../lib/errors.js";
import type { ProjectsRepo } from "./repo.js";

export class ProjectsService {
  constructor(private readonly repo: ProjectsRepo) {}

  create(orgId: string, input: ProjectCreate): Promise<Project> {
    return this.repo.create(orgId, input);
  }

  list(orgId: string): Promise<Project[]> {
    return this.repo.list(orgId);
  }

  /** Returns the project or throws 404 — a foreign org's project is indistinguishable from a missing one. */
  async get(orgId: string, projectId: string): Promise<Project> {
    const project = await this.repo.getById(orgId, projectId);
    if (project === null) {
      throw notFound("Project");
    }
    return project;
  }

  async update(orgId: string, projectId: string, patch: ProjectUpdate): Promise<Project> {
    const updated = await this.repo.update(orgId, projectId, patch);
    if (updated === null) {
      throw notFound("Project");
    }
    return updated;
  }

  async remove(orgId: string, projectId: string): Promise<void> {
    const removed = await this.repo.remove(orgId, projectId);
    if (!removed) {
      throw notFound("Project");
    }
  }
}
