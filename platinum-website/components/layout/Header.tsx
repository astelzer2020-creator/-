"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { site } from "@/content/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Close the drawer on navigation and lock body scroll while open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-ivory/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8 lg:h-20">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-[0.18em] text-ink"
          aria-label={`${site.name} — home`}
        >
          {site.name}
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`text-sm tracking-wide transition-colors hover:text-bronze-dark ${
                isActive(item.href)
                  ? "text-bronze-dark underline decoration-bronze underline-offset-8"
                  : "text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={site.cta.primary.href}
            className="inline-flex min-h-10 items-center bg-ink px-5 py-2 text-sm font-medium text-ivory transition-colors hover:bg-obsidian"
          >
            Request a Consultation
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center text-ink lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {open ? (
              <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="1.6" />
            ) : (
              <path d="M2 6h18M2 11h18M2 16h18" stroke="currentColor" strokeWidth="1.6" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id={menuId}
        hidden={!open}
        className="border-t border-ink/10 bg-ivory lg:hidden"
      >
        <nav aria-label="Main mobile" className="flex flex-col px-5 py-4">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`border-b border-ink/5 py-4 text-lg ${
                isActive(item.href) ? "text-bronze-dark" : "text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={site.cta.primary.href}
            className="mt-5 inline-flex min-h-12 items-center justify-center bg-ink px-6 py-3 text-sm font-medium text-ivory"
          >
            Request a Consultation
          </Link>
        </nav>
      </div>
    </header>
  );
}
