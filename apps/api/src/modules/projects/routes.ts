import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ProjectCreateSchema, ProjectUpdateSchema } from "@atlas/shared";

const ParamsSchema = z.object({ projectId: z.uuid() });

/**
 * Project CRUD. Roles per docs/SECURITY.md: viewers read, analysts
 * create/edit. All access is scoped to the caller's org (from the token),
 * never from client input.
 */
export const projectsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/projects",
    { config: { auth: { role: "viewer" } } },
    async (request) => {
      return app.projects.list(request.user.orgId);
    },
  );

  app.post(
    "/projects",
    { config: { auth: { role: "analyst" } } },
    async (request, reply) => {
      const input = ProjectCreateSchema.parse(request.body);
      const project = await app.projects.create(request.user.orgId, input);
      return reply.status(201).send(project);
    },
  );

  app.get(
    "/projects/:projectId",
    { config: { auth: { role: "viewer" } } },
    async (request) => {
      const { projectId } = ParamsSchema.parse(request.params);
      return app.projects.get(request.user.orgId, projectId);
    },
  );

  app.patch(
    "/projects/:projectId",
    { config: { auth: { role: "analyst" } } },
    async (request) => {
      const { projectId } = ParamsSchema.parse(request.params);
      const patch = ProjectUpdateSchema.parse(request.body);
      return app.projects.update(request.user.orgId, projectId, patch);
    },
  );

  app.delete(
    "/projects/:projectId",
    { config: { auth: { role: "analyst" } } },
    async (request, reply) => {
      const { projectId } = ParamsSchema.parse(request.params);
      await app.projects.remove(request.user.orgId, projectId);
      return reply.status(204).send();
    },
  );
};
