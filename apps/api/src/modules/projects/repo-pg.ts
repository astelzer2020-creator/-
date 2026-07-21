import type { Project } from "@atlas/shared";

import { notImplemented } from "../../lib/errors.js";
import type { ProjectsRepo } from "./repo.js";

const MESSAGE =
  "PgProjectsRepo is not implemented yet — schema written in migrations/0001_init.sql, " +
  "wired when the Postgres task lands (M1)";

/**
 * Postgres projects repository — STUB.
 *
 * TODO(M1/Postgres): implement against `migrations/0001_init.sql` (projects
 * table, org-scoped queries with parameterized SQL only) once a database is
 * provisioned. Until then every method throws 501 NOT_IMPLEMENTED so wiring
 * it by mistake is loud, never silent. Parameters are intentionally omitted
 * (TS allows fewer params in implementations) until the real queries exist.
 */
export class PgProjectsRepo implements ProjectsRepo {
  constructor(private readonly databaseUrl: string) {
    if (databaseUrl.length === 0) {
      throw new Error("PgProjectsRepo requires DATABASE_URL");
    }
  }

  create(): Promise<Project> {
    return Promise.reject(notImplemented(MESSAGE));
  }

  list(): Promise<Project[]> {
    return Promise.reject(notImplemented(MESSAGE));
  }

  getById(): Promise<Project | null> {
    return Promise.reject(notImplemented(MESSAGE));
  }

  update(): Promise<Project | null> {
    return Promise.reject(notImplemented(MESSAGE));
  }

  remove(): Promise<boolean> {
    return Promise.reject(notImplemented(MESSAGE));
  }
}
