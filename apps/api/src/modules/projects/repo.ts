import type { Project, ProjectCreate, ProjectUpdate } from "@atlas/shared";

/**
 * Projects repository contract. Every method takes `orgId` first — org
 * scoping is enforced at the repository layer (docs/SECURITY.md), so a
 * cross-tenant read is impossible by construction, not by caller discipline.
 */
export interface ProjectsRepo {
  create(orgId: string, input: ProjectCreate): Promise<Project>;
  list(orgId: string): Promise<Project[]>;
  getById(orgId: string, projectId: string): Promise<Project | null>;
  update(
    orgId: string,
    projectId: string,
    patch: ProjectUpdate,
  ): Promise<Project | null>;
  remove(orgId: string, projectId: string): Promise<boolean>;
}
