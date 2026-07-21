import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { t } from "../i18n";
import { authStore } from "../lib/auth-store";
import { createDemoApi } from "../lib/demo-adapter";
import { AppProviders, AppRoutes } from "./App";

function renderAt(path: string) {
  return render(
    <AppProviders api={createDemoApi()}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>,
  );
}

afterEach(() => {
  authStore.clear();
});

describe("RequireAuth route guard", () => {
  it("redirects unauthenticated visitors from a guarded route to the login page", () => {
    renderAt("/projects");
    expect(screen.getByRole("heading", { name: t("auth.title") })).toBeTruthy();
  });

  it("renders the guarded shell when a token is present", async () => {
    authStore.setToken("test-token");
    renderAt("/projects");
    expect(
      await screen.findByRole("heading", { name: t("projects.title") }),
    ).toBeTruthy();
  });
});
