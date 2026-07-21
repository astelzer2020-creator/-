import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ScenarioCreateSchema } from "@atlas/shared";

const ProjectParamsSchema = z.object({ projectId: z.uuid() });
const ScenarioParamsSchema = ProjectParamsSchema.extend({ scenarioId: z.uuid() });

/**
 * Scenario routes under a project. Analysts create and simulate; viewers
 * read. Org scoping comes from the token via the services/repositories.
 */
export const scenariosRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/projects/:projectId/scenarios",
    { config: { auth: { role: "analyst" } } },
    async (request, reply) => {
      const { projectId } = ProjectParamsSchema.parse(request.params);
      const input = ScenarioCreateSchema.parse(request.body);
      const scenario = await app.scenarios.create(request.user.orgId, projectId, input);
      return reply.status(201).send(scenario);
    },
  );

  app.get(
    "/projects/:projectId/scenarios",
    { config: { auth: { role: "viewer" } } },
    async (request) => {
      const { projectId } = ProjectParamsSchema.parse(request.params);
      return app.scenarios.listByProject(request.user.orgId, projectId);
    },
  );

  app.get(
    "/projects/:projectId/scenarios/:scenarioId",
    { config: { auth: { role: "viewer" } } },
    async (request) => {
      const { projectId, scenarioId } = ScenarioParamsSchema.parse(request.params);
      return app.scenarios.get(request.user.orgId, projectId, scenarioId);
    },
  );

  app.post(
    "/projects/:projectId/scenarios/:scenarioId/simulate",
    { config: { auth: { role: "analyst" } } },
    async (request) => {
      const { projectId, scenarioId } = ScenarioParamsSchema.parse(request.params);
      return app.scenarios.simulate(request.user.orgId, projectId, scenarioId);
    },
  );
};
