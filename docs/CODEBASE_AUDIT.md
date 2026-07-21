# Atlas — Codebase Verification Audit (ATL-020)

**Status:** Informational. Nothing here blocks Sprint-1 planning (per task directive).
**Prepared by:** atlas-cto, 2026-07-21, Founder directive, MISSION-1 Step 5.
**Method:** Strictly read-only inspection of the entire repository — legacy prototype
(`frontend/`, `backend/node`, `backend/python`, `mobile/`) and new platform scaffold
(`apps/`, `services/`, `packages/`, `infra/`). Every command used is listed in Appendix A;
Appendix B is the `git status` proof that only this file was created.

Scope note: the legacy prototype is frozen (ADR-0007). Findings against it are **port intelligence**,
not fix requests — nothing below implies editing legacy code. Target locations follow
`docs/ARCHITECTURE.md` (financial engine → `services/analytics`; taba mappings, schemas, domain
types → `packages/shared`).

---

## 1. DUPLICATE WORK

### D-1 · Taba Hebrew→English column mapping (`FIELD_MAP`) — 3 copies, diverging (HIGH)

| Location | Entries | Notes |
|---|---|---|
| `frontend/src/pages/DataImport.jsx:9-28` | 17 | canonical-looking copy |
| `backend/node/routes/import.js:8-16` | 17 | identical key set to frontend |
| `mobile/src/screens/ImportScreen.jsx:11-18` | 14 | **missing** `'סוג בניין'→buildingType`, `'שנת בנייה'→buildYear`, `'שווי קרקע'→landValue` |

Same table, three hand-maintained copies, one already drifted. The `/import/template` endpoint
(`backend/node/routes/import.js:49-59`) generates the customer-facing Excel template from the
backend copy — template and mobile importer already disagree on 3 columns.
**Post-port home:** `packages/shared` (ARCHITECTURE.md line 39: "taba column mappings (Hebrew → English)").

### D-2 · Row normalization (`normalizeRow`) — 4 implementations (MEDIUM)

- `frontend/src/pages/DataImport.jsx:30-37` (trims keys)
- `backend/node/routes/import.js:18-24` (trims keys)
- `mobile/src/screens/ImportScreen.jsx:20-30` (`parseCSV` — strips ALL `"` chars, see C-7)
- `mobile/src/screens/ImportScreen.jsx:32-40` (`parseJSON` — does **not** trim keys)

**Post-port home:** `packages/shared` (one mapper, one test suite).

### D-3 · Financial/ROI engine — 4 independent implementations (CRITICAL)

| Location | Size | Model |
|---|---|---|
| `frontend/src/utils/calculations.js` (259 lines) | full model | unit-mix revenue + commercial capitalization, parking, demolition, permits, betterment levy, marketing, finance, overhead; real IRR/NPV/payback/sensitivity |
| `backend/python/api/roi.py:24-71` (`compute_roi`) | reduced model | flat revenue, no levy/marketing/overhead; own IRR; pseudo-NPV |
| `backend/node/routes/roi.js:12-25` | fallback | third re-implementation, executed silently when Python is down |
| `mobile/src/screens/ROIScreen.jsx:57-71` | inline | fourth re-implementation with fake IRR (see C-4) |

No two of the four produce the same profit/ROI for identical inputs (details in section 3).
**Post-port home:** `services/analytics` engine, golden-file tested (ADR-0006); every UI consumes it
via `apps/api`.

### D-4 · IRR solver — 2 real + 1 fake (HIGH)

- `frontend/src/utils/calculations.js:162-177` — Newton-Raphson, 100 iters, tol 1e-7.
- `backend/python/api/roi.py:8-21` — Newton-Raphson, 1000 iters, tol 1e-6, result clamped to 0 outside `(-1, 10)`.
- `mobile/src/screens/ROIScreen.jsx:69` — `irr = (Math.pow(1 + roi/100, 1/years) - 1) * 100` — annualized ROI, **not IRR**.

### D-5 · City price tables — 2 copies + a 3rd coordinates copy (MEDIUM)

- `frontend/src/data/cityPrices.js:1-12` — 8 cities, land/sale/build + lat/lng.
- `mobile/src/screens/ROIScreen.jsx:16-22` — 5 cities, build/sale only (subset, values match where overlapping).
- `backend/python/api/geocode.py:33-44` — 10 cities' coordinates (third copy of the lat/lng data).

**Post-port home:** reference data in `packages/shared` (or DB-seeded), one source.

### D-6 · Naive "ROI" formula on import — 2 copies (MEDIUM, also a conflict — see C-5)

`Math.round(((proposedUnits - existingUnits) / existingUnits) * 100)` labeled `roi`:
- `frontend/src/pages/DataImport.jsx:110-112`
- `mobile/src/screens/ImportScreen.jsx:85-87`

### D-7 · Project stores — 3 unrelated "repositories" (MEDIUM)

- `frontend/src/store/projectStore.js` (41 lines) — zustand + `persist` (localStorage), seeds `MOCK_PROJECTS`.
- `mobile/src/store/projectStore.js` (53 lines) — zustand + manual AsyncStorage, no seed, different API (`addBulk`, `clear`).
- `backend/node/routes/projects.js:4-5` — in-memory array (`let projects = []`), never used by either client.

**Post-port home:** Postgres via `apps/api` (ADR-0004); a single client-side cache layer per app at most.

### D-8 · Minor duplicate constants/expressions

- GeoJSON extraction `data.features?.map(f => f.properties)`: `DataImport.jsx:77`, `import.js:42`, `ImportScreen.jsx:34`.
- Random coordinate jitter `32.0853 + (Math.random()-0.5)*0.5`: `DataImport.jsx:113-114`, `ImportScreen.jsx:89-90`.
- `PLAN_TYPES` list: `calculations.js:15`, `ROIScreen.jsx:15`.
- Sensitivity analysis logic: `calculations.js:233-245` (3×3 grid, both axes), `roi.py:86-96` (7-step price only), `ROIScreen.jsx:73-88` (7-step price only, negative ROI clamped — see T-8).

---

## 2. DEAD CODE

### DC-1 · The entire legacy backend has zero callers (HIGH — biggest surprise of the audit)

- `grep -rn "axios\|fetch(" frontend/src` → **0 hits**. The web app never performs a network call;
  all data lives in localStorage/zustand. Yet `axios` is a declared dependency (`frontend/package.json`).
- `mobile/src/utils/api.js` (32 lines, complete typed client for every backend endpoint) is
  **imported nowhere** (`grep -rn "utils/api" mobile/src mobile/app` → only the file itself).

Consequently unreferenced by any client:
- `backend/node/routes/projects.js` — full CRUD + `/bulk` (51 lines).
- `backend/node/routes/import.js` — `/excel`, `/json`, `/template` (61 lines).
- `backend/node/routes/roi.js` — proxy + fallback (40 lines).
- `backend/python/api/roi.py`, `analysis.py` (`/summary`, `/rank`), `geocode.py` (`/`, `/cities`) — all endpoints.

The prototype's "3-tier architecture" (docker-compose.yml wires `frontend → node-api → python-api`)
is a facade: both UIs are fully client-side. Port implication: the only battle-tested import/finance
code paths are the **frontend** ones; the backend variants were never exercised by real usage.

### DC-2 · Unreferenced frontend components

- `frontend/src/components/AIRecommendations.jsx` (121 lines) — exported, imported by no file.
- `frontend/src/components/ui/Progress.jsx` and `ui/Skeleton.jsx` (incl. `SkeletonCard`, `SkeletonTable`) —
  exported from `ui/index.js:12,8` but used by no page/layout (grep hits only the definition files).

### DC-3 · Unused frontend dependencies (`frontend/package.json`)

Zero `frontend/src` references: `axios`, `@tanstack/react-query`, `react-hook-form`,
`@hookform/resolvers`, `zod`. (Evidence of a planned server/form layer that never landed — see U-9.)

### DC-4 · Stale root scripts

`package.json:8-13` (`dev`, `dev:node`, `dev:python`, `dev:react`, `install:all`, `build`) still target
the frozen prototype directories, alongside the new pnpm workspace scripts (`lint`/`typecheck`/`test`).
Harmless today but a foot-gun: `pnpm dev` at root boots the legacy stack, not the platform.

### DC-5 · Mobile navigation — no orphans (verified clean)

All 6 screens in `mobile/src/screens/` are registered via expo-router wrappers
(`mobile/app/(tabs)/*.jsx`, `mobile/app/project/[id].jsx`); `_layout.jsx` registers all 5 tabs. No dead screens.

---

## 3. CONFLICTING IMPLEMENTATIONS

### C-1 · Demolition cost — three different answers (CRITICAL for trust)

- `frontend/src/utils/calculations.js:77` — `landArea * 250`, if planType contains `הריסה` or `פינוי`.
- `backend/python/api/roi.py:30` — `landArea * 200`, same trigger set.
- `backend/node/routes/roi.js:19` — `landArea * 200`, but triggers **only** on `פינוי` (misses `הריסה`).
- `mobile/src/screens/ROIScreen.jsx:61` — `1000 * 200` — **land area hardcoded to 1,000 m²** regardless of project.

25% cost-rate disagreement + differing trigger conditions + a hardcoded area.

### C-2 · Cost model composition — frontend vs everything else (CRITICAL)

`calculations.js:117-123` includes `permits 3.5%`, `bettermentLevy 2.5%` (waived only when
`planType === 'פינוי-בינוי'` exactly, line 87), `marketing 2%`, `overhead 8%`.
`roi.py:31-33`, `roi.js:20-22`, `ROIScreen.jsx:63-65` include only permits + finance.
Identical inputs → materially different totalCost, profit, and ROI. There is no recorded decision
which model is financially correct.

### C-3 · Revenue and construction basis disagree

- Revenue: frontend = unit-mix Σ(count·size·price) + commercial `area · rent · 12 · years · 8`
  (`calculations.js:38-43`; the ×12×years×8 "capitalization" at lines 17-18 is financially dubious —
  it multiplies annual rent by both project years AND a cap factor).
  Python/node/mobile = `addedUnits · avgUnitSize · salePrice` (`roi.py:27`, `roi.js:16`, `ROIScreen.jsx:59`).
- Construction: frontend uses caller-supplied `totalNewUnits` (`calculations.js:56`);
  python uses `existingUnits + addedUnits` (`roi.py:25,28`) — different unit basis for the largest cost line.

### C-4 · IRR / NPV / payback — three regimes

- IRR: solver guards differ (frontend `Number.isFinite` only, `calculations.js:175`;
  python silently zeroes any result outside `(-1,10)`, `roi.py:21`); cashflow shapes differ
  (frontend: all cost at t=0, revenue at t=N, `calculations.js:150-155`; python: construction+tenant
  spread annually, `roi.py:38-40`) — so even matching solvers would return different IRRs.
  Mobile's "IRR" is annualized ROI (`ROIScreen.jsx:69`), a different quantity.
- NPV: frontend is a true DCF over the series (`calculations.js:185-188`);
  python `npv = profit / (1+r)^years` (`roi.py:43`) — single-discounted profit, **not NPV**;
  mobile copies the fake (`ROIScreen.jsx:68`).
- Payback: frontend fractional interpolation (`calculations.js:195-206`); python integer-year loop over a
  different income model, `None` past 30 years (`roi.py:46-54`).

### C-5 · Two meanings of "roi" in the same data model

Imported projects get `roi` = unit-count uplift % (`DataImport.jsx:110-112`, `ImportScreen.jsx:85-87`);
calculator screens and `MOCK_PROJECTS` use `roi` = profit/cost % (`calculations.js:125`,
`mockProjects.js:27`). Dashboards (`Dashboard.jsx`, `analysis.py:14-37`) average them together as if
comparable.

### C-6 · Validation rules for the same fields

- `backend/python/models/schemas.py:4-14` — pydantic bounds (`existingUnits ge=1`, `financeRate le=30`,
  `projectYears le=20`, defaults 85/11000/25000/2500).
- `backend/node/routes/roi.js:15-21` — no validation; `||`-defaults mean a **legitimate 0 is replaced**
  (e.g. `avgUnitSize || 85`, `salePrice || 25000`), silently computing with fabricated inputs.
- Frontend/mobile — slider min/max only; no shared schema.

### C-7 · CSV/Excel parsing and encoding disagree — with a live Hebrew-quote bug

- Excel: read with `codepage: 1255` (`DataImport.jsx:63`, `import.js:29`); CSV: UTF-8
  (`DataImport.jsx:53`, `ImportScreen.jsx:57`) — two encoding regimes for the same customer data.
- `mobile/src/screens/ImportScreen.jsx:23,25` strips ALL `"` characters:
  `h.trim().replace(/"/g, '')`. Taba headers contain gershayim — `יח"ד קיים` becomes `יחד קיים`,
  which is **not** a `FIELD_MAP` key (`ImportScreen.jsx:14`), so `existingUnits`/`proposedUnits` are
  never mapped on mobile CSV import → imported ROI silently computes to 0 (`:85-87` guard fails).
  Verified against the fixture header row `data/sample/sample-taba-projects.csv:1`
  (`...,יח"ד קיים,יח"ד מוצע,...`). Same line also breaks `תמ"א 38/2` values → `תמא 38/2`.
- Mobile CSV parser is `line.split(',')` (`ImportScreen.jsx:24-25`) — quoted fields containing commas
  (Hebrew addresses) shift every subsequent column.

### C-8 · Auth handled three different ways (all insecure; prototype-only)

- Web: client-side zustand store; **plaintext passwords persisted to localStorage**
  (`frontend/src/store/authStore.js:58-59` — `saveUsers([...users, user])` where `user` includes `password`);
  hardcoded backdoor `demo@urc.app` / `demo1234` (`authStore.js:37`), pre-filled in the login form
  (`frontend/src/pages/auth/Login.jsx:15-16`). `ProtectedRoute` gates only the web UI.
- Backend: **zero** auth on any route (`backend/node/index.js`, `backend/python/main.py`); CORS wide open
  (`index.js:9` `app.use(cors())`, `main.py:7-12` `allow_origins=["*"]`).
- Mobile: no auth concept at all.

---

## 4. UNFINISHED FEATURES

- **U-1 · Marker sweep:** `grep -rniE "TODO|FIXME|HACK"` over all first-party code (legacy + scaffold) →
  **0 hits**. The debt is entirely unannotated; nothing in this repo self-declares as temporary.
- **U-2 · Auth without enforcement:** full login/register UX (`frontend/src/pages/auth/Login.jsx`,
  `Register.jsx`, `authStore.js`) with no server-side counterpart anywhere (see C-8).
- **U-3 · "Import to the system" that persists nothing server-side:** `DataImport.jsx:98-121` fakes an
  import with `setTimeout(..., 800)` and writes to localStorage; button copy says
  `ייבא N רשומות למערכת` (`DataImport.jsx:219`).
- **U-4 · In-memory "persistence" API:** `backend/node/routes/projects.js:4-5` — all data lost on restart;
  no client calls it anyway (DC-1).
- **U-5 · Mobile API client never wired:** `mobile/src/utils/api.js:4-5` placeholder base URLs
  (`https://your-api.example.com`), file never imported.
- **U-6 · Mobile advertises Excel import it can't do:** source card `'Excel/CSV'`
  (`ImportScreen.jsx:107`) but only CSV/JSON parse (`:61-63`); `.xlsx` rejected.
- **U-7 · Batch ROI has no fallback:** `roi.js:29-38` returns 503 when Python is down (while single
  `/calculate` silently degrades — inconsistent contract).
- **U-8 · docker-compose implies integration that doesn't exist:** `docker-compose.yml` `frontend`
  `depends_on` both APIs the frontend never contacts.
- **U-9 · Planned form/server layer abandoned:** `react-hook-form`, `zod`, `@tanstack/react-query`,
  `axios` installed but unused (DC-3).
- **U-10 · CI secrets scan is a stub (new platform, documented):** `.github/workflows/ci.yml`
  `secrets-scan` job runs `echo ... && exit 0` pending a GITLEAKS_LICENSE decision — tracked as an
  ATL-007 follow-up in the workflow comment itself.

---

## 5. TEMPORARY FIXES / WORKAROUNDS

- **T-1 (CRITICAL) · Silent numeric fallback:** `backend/node/routes/roi.js:11-26` — if the Python
  service errors, `catch` swallows it and returns a **different model's numbers** in a **different
  response shape** (no `irr`/`npv`/`paybackYears`, key `construction` vs `constructionCost`) with no
  flag that a fallback ran. In a bank-report product this is the archetypal trust-killer.
- **T-2 · Geocode catch-and-ignore with fake coordinates:** `backend/python/api/geocode.py:26-28` —
  `except Exception: pass`, then returns Jerusalem (`31.7683, 35.2137`) alongside an `error` key;
  a careless caller plots every failed address in Jerusalem.
- **T-3 · Random coordinates for imported projects:** `DataImport.jsx:113-114`,
  `ImportScreen.jsx:89-90` — jitter around Tel Aviv instead of geocoding (the geocode endpoint exists
  and is unused — DC-1).
- **T-4 · Fake import latency:** `DataImport.jsx:98` `setTimeout(..., 800)` to simulate work.
- **T-5 · Swallowed storage errors:** `mobile/src/store/projectStore.js:15-16` `catch {}` on load —
  corrupt store silently yields an empty project list.
- **T-6 · Hardcoded business constants inline:** parking `80000`/`15000` (`calculations.js:56`),
  permits `0.035` (4 places: `calculations.js:117`, `roi.py:31`, `roi.js:20`, `ROIScreen.jsx:63`),
  betterment `0.025` (`calculations.js:87`), marketing `0.02` (`:119`), overhead `0.08` (`:121`),
  demolition `250`/`200` (C-1), mobile land area `1000` (`ROIScreen.jsx:61`).
- **T-7 · Demo credentials shipped in code:** `Login.jsx:15-16` + backdoor `authStore.js:37`.
- **T-8 · Chart clamp hides losses:** `ROIScreen.jsx:84` `Math.max(0, ...)` — negative ROI renders as 0
  in the mobile sensitivity chart.
- **T-9 · 50 MB in-memory upload limits:** `import.js:6` (multer memoryStorage) and `index.js:10`
  (`json({ limit: '50mb' })`) — convenience settings, DoS-adjacent.
- Console debugging: only `backend/node/index.js:19` (startup log — benign). No commented-out code
  blocks found in first-party sources.

---

## 6. NEW-PLATFORM STATUS (apps/, services/, packages/, infra/)

**Verdict: clean.** Contents match the intended ATL-007 M0 placeholders; no stray real code, no drift
from `docs/FOLDER_STRUCTURE.md`.

- `apps/api/src/index.ts`, `apps/web/src/index.ts`, `packages/shared/src/index.ts` — identical-pattern
  `workspaceName()` placeholders, each self-documenting what lands in M1; one vitest each
  (`*/src/index.test.ts`).
- `apps/mobile` — stub workspace by design (`package.json` scripts echo "stub workspace (revived
  post-pilot)"), consistent with ADR-0007/ROADMAP.
- `services/analytics` — placeholder package (`src/atlas_analytics/__init__.py`, `__version__ 0.1.0`)
  + `tests/test_placeholder.py`; `pyproject.toml` documents the deliberate 3.11-local / 3.12-CI split
  and enables `mypy --strict` from day one. Not in `pnpm-workspace.yaml` (correct — Python).
- `infra/docker`, `infra/environments` — README-only, as specified.
- Domain-logic sweep: `grep -rniE "irr|npv|taba|roi|zod|fastify"` over scaffold `src/` →
  0 non-placeholder hits.
- `.github/workflows/ci.yml` — lint/typecheck (pnpm -r + ruff + mypy strict), tests (vitest + pytest),
  secrets-scan placeholder (U-10).

**Known deviations (pre-documented, decisions pending — not new findings):**
1. **ADR-0008 violation still tracked in git:** 21 root binaries (20 `.zip` + `Codex Installer (7).exe`,
   ~3.0 MB total; `git ls-files` confirms all tracked). Fully inventoried with hashes in
   `docs/CLEANUP_REPORT.md` (ATL-009); removal reserved for human owner (rule 9 / DL-007).
   `.gitignore:12-16` blocks new ones.
2. **Root `package.json` legacy scripts** (DC-4) — should be pruned when the prototype is removed after M2.
3. Local tool caches (`services/analytics/.venv`, `.mypy_cache`, `.pytest_cache`, `.ruff_cache`,
   `node_modules/.bin`) exist on disk but are untracked/self-ignored — verified via clean `git status`.

---

## 7. RISK NOTES FOR THE PORT (feeds R-02 numeric-regression / R-04 encoding)

Ranked by likelihood of a **silent** regression during M1/M2, each mapped to the ADR-0006 golden-fixture strategy:

1. **No source of truth among 4 financial engines (C-1/C-2/C-3; R-02).** The frontend and python models
   disagree on demolition rate (250 vs 200/m²), cost lines (levy/marketing/overhead present vs absent),
   revenue and construction bases. Porting "the" engine means first deciding, in writing, which formula
   set is financially correct. **Mitigation:** golden fixtures MUST be authored from a human-verified
   spreadsheet (ADR-0006's named-verifier rule), never by capturing any prototype's output — capturing
   would enshrine one of four unvalidated models. Product/Founder sign-off per formula line item.
2. **Fake NPV and fake mobile IRR (C-4; R-02).** `roi.py:43` and `ROIScreen.jsx:68-69` return
   plausible-looking wrong quantities. A port that "keeps behavior" preserves wrong finance invisibly.
   **Mitigation:** ADR-0006 property test `NPV(cashflows, IRR) ≈ 0` mechanically rejects both fakes;
   include cashflow-shape fixtures (lump-sum vs spread) so the shape decision is pinned too.
3. **Gershayim/quote handling in Hebrew headers (C-7; R-04).** `יח"ד` headers are destroyed by mobile's
   quote-stripping today; the same class of bug (quote normalization, ״ vs " vs ") can silently zero unit
   counts post-port. **Mitigation:** golden import fixtures whose headers contain gershayim and quoted
   comma-bearing addresses, in BOTH UTF-8 and cp1255 encodings (Excel path is cp1255 today,
   `import.js:29` / `DataImport.jsx:63`), asserting on the full mapped row, not just row count.
4. **Boundary rounding vs integer agorot (C-4 rounding; R-02).** Python rounds to 2 decimals at the API
   (`roi.py:57-70`), JS returns raw floats, and `docs/CODING_STANDARDS.md` mandates integer agorot —
   three numeric representations will coexist mid-port. **Mitigation:** golden fixtures specify expected
   values in integer agorot with ADR-0006 tolerances (exact for agorot, 1e-4 for iterative solvers);
   conversion happens once, at the engine boundary, and is itself fixture-tested.
5. **Silent-degradation paths poison "trusted numbers" (T-1/T-2; R-02).** The node fallback engine and
   geocode's Jerusalem default both substitute wrong data without any signal. If the port reproduces the
   proxy pattern, a partial outage changes bank-report numbers. **Mitigation:** the new `apps/api` →
   `services/analytics` contract must fail loudly (5xx + alert, never a client-side recompute); add a
   QA_PLAN scenario "analytics down → report generation refuses" and a golden test asserting the API
   returns no numbers it did not get from the engine.

---

## 8. SUMMARY TABLE

Severity is informational (audit input to Sprint-1 planning, not a release gate).
Legend: CRITICAL = can silently corrupt customer-facing numbers; HIGH = structural/security debt that
shapes the port; MEDIUM = duplication/drift to retire during port; LOW = hygiene.

| Category | Findings | CRITICAL | HIGH | MEDIUM | LOW |
|---|---:|---:|---:|---:|---:|
| 1. Duplicate work | 11 clusters (D-1…D-8, incl. 4 sub-items in D-8) | 1 (D-3) | 2 (D-1, D-4) | 5 | 3 |
| 2. Dead code | 5 (DC-1…DC-5; DC-5 verified clean) | 0 | 1 (DC-1) | 2 | 2 |
| 3. Conflicting implementations | 8 (C-1…C-8) | 3 (C-1, C-2, C-4) | 3 (C-5, C-7, C-8) | 2 | 0 |
| 4. Unfinished features | 10 (U-1…U-10) | 0 | 2 (U-2, U-3) | 5 | 3 |
| 5. Temporary fixes | 9 (T-1…T-9) | 1 (T-1) | 2 (T-2, T-8) | 4 | 2 |
| 6. New-platform drift | 0 new (2 pre-documented deviations) | 0 | 0 | 0 | 0 |
| **Total** | **43** | **5** | **10** | **18** | **10** |

Single riskiest item for the port: **D-3/C-2 — four divergent financial engines with no designated
source of truth.** Everything else in R-02 is downstream of deciding, with a named human verifier,
which formula set Atlas stands behind.

---

## Appendix A — Commands run (all read-only)

```
git status
ls -la
find . -path ./node_modules -prune -o -path ./.git -prune -o -type f -print
git ls-files | grep -Ei '\.(zip|exe|db)$|mypy_cache|pytest_cache' ; git ls-files | wc -l
grep -rn "TODO\|FIXME\|HACK\|XXX" <first-party dirs> --include=*.{js,jsx,ts,tsx,py}   # 0 hits
grep -rn "console\.log\|console\.warn\|print(" frontend/src backend mobile
wc -l <key legacy files>
cat .gitignore ; ls -la services/analytics/
# Full reads: frontend/src/utils/calculations.js, backend/python/api/{roi,analysis,geocode}.py,
#   backend/python/{main.py,models/schemas.py}, backend/node/{index.js,routes/*.js},
#   frontend/src/pages/DataImport.jsx, frontend/src/{App.jsx,store/*.js,hooks/useAuth.js},
#   mobile/src/screens/ImportScreen.jsx, mobile/src/{store/projectStore.js,utils/api.js},
#   mobile/app/**/*.jsx, docker-compose.yml, .github/workflows/ci.yml,
#   apps/*/src/*, packages/shared/src/*, services/analytics/{pyproject.toml,src,tests},
#   docs/{FOLDER_STRUCTURE,ARCHITECTURE,CLEANUP_REPORT}.md, docs/adr/0006-*.md
grep -rn "utils/api|AIRecommendations|cityPrices|utils/calculations|utils/export|axios|fetch(" frontend/src mobile
grep -rln "<each ui component>" frontend/src            # usage counts
grep -rn "Math.random|catch {}|except.*pass" frontend/src mobile/src backend
grep -rniE "irr|npv|taba|roi|zod|fastify" apps/*/src packages/*/src services/analytics/{src,tests}  # scaffold purity: 0
head -3 data/sample/sample-taba-projects.csv ; file data/sample/sample-taba-projects.csv
cat package.json pnpm-workspace.yaml frontend/package.json backend/node/package.json
```

## Appendix B — Read-only compliance proof

`git status` at audit start: `nothing to commit, working tree clean`.

`git status` after the audit:

```
On branch claude/production-project-init-bfa25e
Changes not staged for commit:
	modified:   docs/coordination/AGENT_WORKBOARD.md

Untracked files:
	docs/CODEBASE_AUDIT.md
```

The `AGENT_WORKBOARD.md` modification is **not from this audit**: it appeared mid-audit from a
concurrent CEO session (diff = the DL-013 scope amendment adding ATL-021; verified with read-only
`git diff`). This audit created exactly one file (`docs/CODEBASE_AUDIT.md`) and modified/deleted
nothing else, per the ATL-020 read-only constraint.
