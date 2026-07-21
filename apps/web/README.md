# apps/web

Atlas web SPA — React 18 + TypeScript strict + Vite, RTL Hebrew-first. Built in M1 as the
walking-skeleton client for the pilot journey (login → projects → scenario → results).

## Stack

- React 18, react-router 7, @tanstack/react-query 5, zod (boundary validation)
- Hand-rolled design system: `src/styles/tokens.css` + `src/components/ui/` (no component
  library, no Tailwind). Light/dark via `prefers-color-scheme`, logical properties only.
- i18n: `src/i18n/` — every user-facing string is a typed key → Hebrew.
  TODO(shared): catalog + API contract types move to `@atlas/shared` when it ships
  (local mirror: `src/lib/contracts.ts`).

## Demo mode

Demo mode is ON by default (`VITE_DEMO` unset or anything but `"0"`): an in-memory adapter
with 3 synthetic projects (derived from `data/sample/sample-taba-projects.csv`) makes the
app fully clickable without a backend; a banner marks the mode. Set `VITE_DEMO=0` plus
`VITE_API_URL` to talk to the real API. Demo math is illustrative only — real IRR/NPV live
in `services/analytics`.

## Commands

```sh
pnpm --filter @atlas/web dev        # vite dev server (demo mode)
pnpm --filter @atlas/web build      # tsc -b && vite build
pnpm --filter @atlas/web preview    # serve the production build
pnpm --filter @atlas/web lint       # eslint, 0 warnings allowed
pnpm --filter @atlas/web typecheck
pnpm --filter @atlas/web test       # vitest (jsdom)
```

See docs/FOLDER_STRUCTURE.md, docs/ARCHITECTURE.md, docs/CODING_STANDARDS.md.
