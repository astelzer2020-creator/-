import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { t } from "../../i18n";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

describe("EmptyState", () => {
  it("renders title, description, and the CTA action", () => {
    const onCta = vi.fn();
    render(
      <EmptyState
        title="ריק"
        description="אין נתונים"
        action={<Button onClick={onCta}>צור</Button>}
      />,
    );
    expect(screen.getByRole("heading", { name: "ריק" })).toBeTruthy();
    expect(screen.getByText("אין נתונים")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "צור" }));
    expect(onCta).toHaveBeenCalledOnce();
  });

  it("renders without optional parts", () => {
    render(<EmptyState title="ריק" />);
    expect(screen.getByRole("heading", { name: "ריק" })).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("ErrorState", () => {
  it("is announced as an alert and wires the retry button", () => {
    const onRetry = vi.fn();
    render(<ErrorState title="שגיאה" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(t("errors.generic"))).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: t("common.retry") }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("omits the retry button when no handler is given", () => {
    render(<ErrorState title="שגיאה" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
