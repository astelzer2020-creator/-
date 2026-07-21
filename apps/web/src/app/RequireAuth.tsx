import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuthToken } from "./use-auth";

/** Route guard: unauthenticated visitors are redirected to /login, keeping the intended target. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthToken();
  const location = useLocation();

  if (token === null) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
