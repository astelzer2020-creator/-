import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { NewProject, ScenarioInput } from "./contracts";
import { useApi } from "./api-context";

/** React-query hooks — one per API resource, shared by all pages. */

export function useProjects() {
  const api = useApi();
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api.listProjects(),
  });
}

export function useProject(projectId: string) {
  const api = useApi();
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => api.getProject(projectId),
  });
}

export function useCreateProject() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewProject) => api.createProject(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useCreateScenario(projectId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ScenarioInput) => api.createScenario(projectId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", projectId],
      });
    },
  });
}

/**
 * Simulation as a query: results are deterministic per saved scenario, so the
 * POST is safe to re-issue on mount/refetch and the page stays deep-linkable.
 */
export function useSimulation(projectId: string, scenarioId: string) {
  const api = useApi();
  return useQuery({
    queryKey: ["simulation", projectId, scenarioId],
    queryFn: () => api.simulate(projectId, scenarioId),
  });
}
