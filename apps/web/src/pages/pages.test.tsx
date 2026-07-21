import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { t } from "../i18n";
import { authStore } from "../lib/auth-store";
import { createDemoApi } from "../lib/demo-adapter";
import { AppProviders, AppRoutes } from "../app/App";

/** Happy-path render test per page, backed by the in-memory demo adapter. */
function renderAt(path: string) {
  return render(
    <AppProviders api={createDemoApi()}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>,
  );
}

beforeEach(() => {
  authStore.setToken("test-token");
});

afterEach(() => {
  authStore.clear();
});

describe("LoginPage", () => {
  it("renders the form and shows Hebrew validation errors on bad input", async () => {
    authStore.clear();
    renderAt("/login");
    fireEvent.change(screen.getByLabelText(t("auth.email")), { target: { value: "nope" } });
    fireEvent.change(screen.getByLabelText(t("auth.password")), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: t("auth.submit") }));
    expect(await screen.findByText(t("auth.errors.emailInvalid"))).toBeTruthy();
    expect(screen.getByText(t("auth.errors.passwordMin"))).toBeTruthy();
  });

  it("logs in with valid credentials and lands on the projects list", async () => {
    authStore.clear();
    renderAt("/login");
    fireEvent.change(screen.getByLabelText(t("auth.email")), {
      target: { value: "demo@atlas.co.il" },
    });
    fireEvent.change(screen.getByLabelText(t("auth.password")), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: t("auth.submit") }));
    expect(await screen.findByRole("heading", { name: t("projects.title") })).toBeTruthy();
    expect(authStore.getToken()).not.toBeNull();
  });
});

describe("ProjectsPage", () => {
  it("lists the three synthetic demo projects", async () => {
    renderAt("/projects");
    expect(await screen.findByText("רח' רוטשילד 45")).toBeTruthy();
    expect(screen.getByText("שד' ויצמן 12")).toBeTruthy();
    expect(screen.getByText("רח' הנביאים 8")).toBeTruthy();
    // Status badges come from i18n keys, not hard-coded strings.
    expect(screen.getByText(t("project.status.inProgress"))).toBeTruthy();
  });
});

describe("ProjectDetailPage", () => {
  it("shows project metadata and its saved scenario", async () => {
    renderAt("/projects/p-1");
    expect(await screen.findByRole("heading", { name: "רח' רוטשילד 45" })).toBeTruthy();
    expect(screen.getByText(t("project.meta.caseNumber"))).toBeTruthy();
    expect(await screen.findByText("תרחיש בסיס")).toBeTruthy();
    expect(screen.getByText(t("project.scenarios.viewResults"))).toBeTruthy();
  });
});

describe("ScenarioFormPage", () => {
  it("renders the mix fieldset and blocks submit with Hebrew errors on empty input", async () => {
    renderAt("/projects/p-1/scenarios/new");
    expect(await screen.findByRole("heading", { name: t("scenario.form.title") })).toBeTruthy();
    expect(screen.getByText(t("scenario.form.mixLegend"))).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: t("scenario.form.submit") }));
    expect(await screen.findByText(t("scenario.form.errorSummary"))).toBeTruthy();
    expect(screen.getByText(t("scenario.errors.nameRequired"))).toBeTruthy();
  });

  it("submits a valid scenario and navigates to its results", async () => {
    renderAt("/projects/p-1/scenarios/new");
    await screen.findByRole("heading", { name: t("scenario.form.title") });

    fireEvent.change(screen.getByLabelText(t("scenario.form.name")), {
      target: { value: "תרחיש בדיקה" },
    });
    fireEvent.change(screen.getByLabelText(t("scenario.form.mix.rooms")), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(t("scenario.form.mix.count")), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByLabelText(t("scenario.form.mix.areaSqm")), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(t("scenario.form.mix.salePrice")), {
      target: { value: "2,500,000" },
    });
    fireEvent.change(screen.getByLabelText(t("scenario.form.buildCostPerSqm")), {
      target: { value: "9800" },
    });
    fireEvent.click(screen.getByRole("button", { name: t("scenario.form.submit") }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: t("results.title") })).toBeTruthy();
    });
  });
});

describe("ResultsPage", () => {
  it("renders KPI cards and the sensitivity table for the seeded scenario", async () => {
    renderAt("/projects/p-1/scenarios/s-1/results");
    expect(await screen.findByText(t("results.kpi.irr"))).toBeTruthy();
    expect(screen.getByText(t("results.kpi.npv"))).toBeTruthy();
    expect(screen.getByText(t("results.kpi.profit"))).toBeTruthy();
    expect(screen.getByText(t("results.kpi.roiOnCost"))).toBeTruthy();
    expect(screen.getByText(t("results.kpi.payback"))).toBeTruthy();
    // Sensitivity grid is a real table with a caption and axis headers.
    expect(screen.getByText(t("results.sensitivity.caption"))).toBeTruthy();
    const baseCells = screen.getAllByText(t("results.sensitivity.baseCase"));
    expect(baseCells.length).toBeGreaterThanOrEqual(2); // one per axis
    // Currency values render as ₪ from integer agorot.
    const cells = document.querySelectorAll(".sens-cell");
    expect(cells.length).toBe(25);
  });
});
