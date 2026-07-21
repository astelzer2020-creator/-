import { createContext, useContext, type ReactNode } from "react";

import type { AtlasApi } from "./api";
import { createHttpApi, isDemoMode } from "./api";
import { createDemoApi } from "./demo-adapter";

const defaultApi: AtlasApi = isDemoMode() ? createDemoApi() : createHttpApi();

const ApiContext = createContext<AtlasApi>(defaultApi);

/** Injects the API client; tests and demo mode swap the implementation here. */
export function ApiProvider({
  api,
  children,
}: {
  api?: AtlasApi;
  children: ReactNode;
}) {
  return (
    <ApiContext.Provider value={api ?? defaultApi}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi(): AtlasApi {
  return useContext(ApiContext);
}
