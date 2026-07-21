# packages/shared

Domain contracts shared by `apps/api`, `apps/web`, `apps/mobile`. The single source of domain
vocabulary (docs/CODING_STANDARDS.md, docs/ARCHITECTURE.md).

- `src/taba.ts` — THE taba column mapping (Hebrew header → English field), superseding the three
  inconsistent legacy copies. Header normalization preserves gershayim (see the mobile-bug note in
  the file).
- `src/money.ts` — `Agorot` branded integer type, shekel⇄agorot conversion, `he-IL` ILS formatting,
  decimal-fraction rate guards.
- `src/schemas/` — Zod schemas + inferred types: Project, Scenario, SimulationRequest/Result
  (the analytics `/v1/simulate` contract), auth (login, roles), and the API error envelope.
- `src/i18n/` — `he.ts` (canonical) and `en.ts` (placeholders), keys mirrored and type-checked
  (`I18nKey`).

Consumed from source for typecheck/tests (`exports.types` → `src/index.ts`); `pnpm build` emits
`dist/` (TS project references) for runtime consumers.
