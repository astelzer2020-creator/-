import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router";

import { ApiProvider } from "../lib/api-context";
import type { AtlasApi } from "../lib/api";
import { ToastProvider } from "../components/ui/Toast";
import { AppShell } from "./AppShell";
import { RequireAuth } from "./RequireAuth";
import { LoginPage } from "../pages/LoginPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { ScenarioFormPage } from "../pages/ScenarioFormPage";
import { ResultsPage } from "../pages/ResultsPage";

/** Route table, shared by the real app (BrowserRouter) and tests (MemoryRouter). */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/projects/:projectId/scenarios/new" element={<ScenarioFormPage />} />
        <Route path="/projects/:projectId/scenarios/:scenarioId/results" element={<ResultsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export interface AppProvidersProps {
  api?: AtlasApi;
  children: ReactNode;
}

/** Query + API + toast providers; tests inject the demo API and their own QueryClient defaults. */
export function AppProviders({ api, children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <ToastProvider>{children}</ToastProvider>
      </ApiProvider>
    </QueryClientProvider>
  );
}
