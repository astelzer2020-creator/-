import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";

import { t } from "../i18n";
import { isDemoMode } from "../lib/api";
import { authStore } from "../lib/auth-store";
import { Button } from "../components/ui/Button";

function BrandMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="var(--color-primary)" />
      <path
        d="M8 24V13l5-3v14zM14 24V9l5-3v18zM20 24V14l4 2v8z"
        fill="var(--color-on-primary)"
      />
    </svg>
  );
}

/**
 * Authenticated app frame: topbar + sidebar (inline-start; off-canvas drawer on
 * mobile), skip link, and focus management — on route change focus moves to the
 * main region so keyboard/screen-reader users land on the new content.
 */
export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  useEffect(() => {
    setDrawerOpen(false);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [location.pathname]);

  function logout() {
    authStore.clear();
    void navigate("/login");
  }

  return (
    <>
      <a className="skip-link" href="#main">
        {t("app.skipToContent")}
      </a>
      {isDemoMode() ? (
        <p className="demo-banner" role="note">
          {t("app.demoBanner")}
        </p>
      ) : null}
      <div className="app-shell">
        <header className="topbar">
          <Button
            variant="secondary"
            size="sm"
            className="menu-button"
            aria-expanded={drawerOpen}
            aria-controls="sidebar"
            aria-label={drawerOpen ? t("app.closeMenu") : t("app.openMenu")}
            onClick={() => {
              setDrawerOpen((open) => !open);
            }}
          >
            ☰
          </Button>
          <div className="topbar-user">
            <Button variant="ghost" size="sm" onClick={logout}>
              {t("auth.logout")}
            </Button>
          </div>
        </header>

        {drawerOpen ? (
          <button
            type="button"
            className="drawer-backdrop"
            aria-label={t("app.closeMenu")}
            onClick={() => {
              setDrawerOpen(false);
            }}
          />
        ) : null}

        <div
          id="sidebar"
          className={["sidebar", drawerOpen ? "is-open" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="sidebar-brand">
            <BrandMark />
            <span>
              {t("app.name")}
              <span className="text-muted text-sm"> · {t("app.tagline")}</span>
            </span>
          </div>
          <nav className="sidebar-nav" aria-label={t("nav.main")}>
            <NavLink to="/projects" className="sidebar-link">
              {t("nav.projects")}
            </NavLink>
          </nav>
        </div>

        {/* tabIndex={-1} lets route-change focus land here without joining the tab order. */}
        <main id="main" className="main" ref={mainRef} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
