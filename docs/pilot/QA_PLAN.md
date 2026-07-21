# QA Plan — First Pilot Launch

Gates the first pilot customer launch of Atlas (סימולטור התחדשות עירונית). Scope: `apps/web`, `apps/api`, `services/analytics`. Mobile is **out of scope** for the pilot.

## 1. Quality Bar

| Severity | Definition | Launch policy |
|---|---|---|
| S1 — Blocker | Wrong financial result (IRR/NPV/payback), data loss/corruption on import, crash in the core loop, security/auth breach | **Blocks launch.** Zero open S1s. |
| S2 — Major | Core-loop step fails for a common input class (e.g. cp1255 CSV rejected), export unusable, garbled Hebrew in report | **Blocks launch** unless a documented, tested workaround exists — then max 2, listed in known issues. |
| S3 — Minor | Cosmetic RTL glitches, non-core feature broken (e.g. 3D view artifact), slow but functional | Acceptable with entry in `KNOWN_ISSUES.md` shared with pilot customer. |
| S4 — Trivial | Typos, minor styling, nice-to-haves | Acceptable, backlog only. |

Principle: the pilot customer is buying **trustworthy numbers**. Any doubt about financial correctness is S1 regardless of how rare the input.

## 2. Pilot Acceptance Test Suite (E2E, core workflow)

Run manually against a staging build identical to the pilot deploy. All pass = acceptance gate met. Test data: `data/sample/sample-taba-projects.csv` plus a real (anonymized) file from the pilot customer.

1. **Import real taba CSV (cp1255)**
   Given a Windows-1255 CSV with the standard 17 Hebrew columns (מספר תיק … סטטוס), When the user uploads it on the import page, Then all rows appear with correct Hebrew (no mojibake), the column mapping preview shows מספר תיק → caseNumber etc., and the row count matches the file.
2. **Import XLSX with Hebrew sheet**
   Given the same data as `.xlsx`, When uploaded, Then results are identical to the CSV import (same normalized rows in DB).
3. **Import GeoJSON and see it on the map**
   Given a GeoJSON of project parcels, When imported, Then each project appears as a Leaflet marker/polygon at the correct coordinates and clicking opens the project.
4. **Create project & configure scenario**
   Given an imported project (e.g. case 2024-001, פינוי-בינוי), When the user sets apartment mix, build cost, and sale price and saves, Then the scenario persists after reload and input validation rejects negatives/blank required fields with Hebrew error messages.
5. **Run simulation**
   Given a saved scenario, When the user runs the simulation, Then IRR, NPV, payback, and the sensitivity table are displayed within 10 s and match the golden values for that fixture (§3).
6. **View results: dashboard + 3D + map**
   Given computed results, When the user opens the results view, Then charts render, the before/after 3D view shows existing vs. proposed floors (4 → 22 for 2024-001), and figures on screen equal figures in the API response.
7. **Export PDF report**
   Given computed results, When the user exports the executive-summary PDF, Then Hebrew text is RTL and readable (not reversed/boxes), numbers match the on-screen values, and the file opens in Adobe Reader and Chrome's viewer.
8. **Export Excel report**
   Given computed results, When the user exports XLSX, Then cashflow rows are numeric (not text), Hebrew headers are intact, and totals recompute correctly in Excel.
9. **Project CRUD lifecycle**
   Given an existing project, When the user edits fields, duplicates a scenario, and deletes a scenario, Then changes persist, deletion asks for confirmation, and no orphaned results remain.
10. **Re-import same file (idempotency)**
    Given a file already imported, When it is uploaded again, Then the user is warned about duplicate מספר תיק values and no silent duplicates are created (see §5.5).
11. **Auth boundary**
    Given two user accounts, When user B requests user A's project by URL/id, Then access is denied and nothing leaks in the response.

## 3. Financial-Correctness Testing

- **Golden files.** ≥ 12 fixtures in `services/analytics/tests/golden/`: each is an input JSON + expected outputs hand-verified in a spreadsheet (Excel `IRR`/`XIRR`, `NPV` with explicit discounting, manual payback). The spreadsheet lives next to the fixture and is the source of truth. Cases must include: standard פינוי-בינוי, תמ"א 38/2, negative-NPV project, no-IRR case (all-negative cashflows), multiple sign changes (document which IRR root we return), zero-discount-rate NPV, payback landing exactly on a period boundary, and mid-period payback interpolation.
- **Tolerance policy.** Relative tolerance `1e-9` for engine unit tests (pure NumPy/SciPy math); `1e-6` vs. spreadsheet goldens (Excel iterates IRR to ~1e-7); displayed values compared after rounding (IRR to 0.1 pp, ₪ to whole shekels). Never assert float equality. NPV comparisons use absolute tolerance of ₪1 when values are near zero.
- **Contract test.** One golden case is run end-to-end through `apps/api` → analytics to catch serialization/rounding drift between services (e.g. percent vs. fraction for IRR).
- **Sensitivity analysis** is checked structurally (grid axes, monotonic direction of NPV vs. price) plus one fully hand-verified grid cell per fixture.

## 4. Hebrew / RTL / Encoding Test Matrix

| # | Case | Input | Expected |
|---|---|---|---|
| E1 | cp1255 CSV | Standard taba export | Auto-detected, Hebrew intact |
| E2 | UTF-8 CSV (with BOM) | Same data re-saved | Identical result to E1 |
| E3 | UTF-8 no BOM | Same data | Identical result to E1 |
| E4 | Mis-detected bait | ASCII-heavy file with few Hebrew chars | Correct encoding chosen or user prompted; never silent mojibake |
| E5 | Mixed Hebrew/English field | `רח' Ben Gurion 12, תל אביב` | Stored and rendered verbatim, correct bidi order on web and PDF |
| E6 | Geresh/gershayim | `יח"ד`, `תמ"א 38`, `רח'` — both ASCII quote and U+05F3/U+05F4 forms | Column mapping still matches; both forms normalized for lookup |
| E7 | Niqqud in address | `רְחוֹב הַזַּיִת 3` | Import succeeds; search/dedup ignores niqqud (NFKD-based compare) |
| E8 | RTL layout — web | Full app walkthrough with `dir="rtl"` | No mirrored icons pointing wrong way, numbers/dates LTR inside RTL text, forms aligned right |
| E9 | RTL — PDF export | Report for E5 data | Hebrew shaped correctly (no reversed letters), embedded font (no tofu), mixed-direction lines correct |
| E10 | RTL — XLSX export | Same | Sheet direction RTL, Hebrew headers intact in Excel 365 and LibreOffice |

## 5. Data-Import Robustness

1. **Malformed rows**: non-numeric in numeric column, empty row mid-file, unclosed quote, extra delimiter — file imports the good rows, and a per-row error report (row number + reason, in Hebrew) is shown; never an all-or-nothing silent failure, never a partial import without a report.
2. **Missing columns**: file lacking a required column (e.g. מספר תיק) is rejected with a message naming the missing column; missing optional columns import with nulls.
3. **Wrong column order / extra columns**: mapping is by header name, not position — shuffled columns import identically; unknown columns are ignored and listed in the import summary.
4. **Huge files**: 50k rows imports within 60 s without OOM; a file over the size limit (define: 20 MB) is rejected up front with a clear message, not a timeout.
5. **Duplicate מספר תיק**: duplicates within one file → import summary flags them, second occurrence skipped by default; duplicate vs. existing DB row → user chooses skip/overwrite; enforced by a DB unique constraint per tenant, so a race cannot create duplicates.
6. **Wrong file entirely**: a PDF renamed `.csv`, an empty file, a binary — rejected gracefully with a Hebrew error, API returns 4xx (never 500), nothing persisted.

## 6. Cross-Browser / Device Matrix

Pilot users are desktop-first office staff; keep the matrix minimal and revisit after pilot.

| Target | Priority | Rationale |
|---|---|---|
| Chrome (latest, Windows 11) | P1 — full suite | Dominant browser at pilot customer; taba files come from Windows |
| Edge (latest, Windows 11) | P1 — core loop (§2) | Default on municipal/corporate Windows machines |
| Firefox (latest) | P2 — smoke: import, results, export | Coverage of the non-Chromium engine, cheap insurance |
| Safari (latest, macOS) | P2 — smoke | WebGL/3D and PDF-viewer differences |
| Mobile browsers / native apps | Out of scope | Pilot contract is desktop web; mobile app deferred |

Minimum resolution supported: 1366×768. WebGL required for 3D view; a non-WebGL browser must show a graceful fallback message, not a blank pane.

## 7. UAT Protocol & Pilot Support SLAs

- **UAT (week 0, before go-live):** 2 sessions × 2 hours with the pilot customer on staging, using **their own taba files**. Session 1: import + scenario + simulation. Session 2: results, exports, and their real workflow end-to-end. QA lead observes and logs; nothing is fixed live. Exit criteria: customer signs off the §2 suite on their data, and their finance person confirms one project's numbers against their own spreadsheet.
- **Feedback channel:** single shared channel (WhatsApp/Slack) + a lightweight issue template (what/steps/screenshot/file). QA lead is the only triager, assigns severity per §1 within the response SLA.
- **SLAs (team of ~3, Israel business hours Sun–Thu 9:00–18:00):**

| Severity | First response | Workaround/fix target |
|---|---|---|
| S1 | 2 business hours | Fix or rollback within 1 business day |
| S2 | 4 business hours | Fix within 3 business days |
| S3 | 1 business day | Next scheduled release |
| S4 | 2 business days | Backlog |

- **Weekly pilot review:** 30 min with the customer — open bugs, severity disputes, upcoming fixes. Known-issues list updated after each release.

## 8. Regression Policy — What Gets Automated First

Priority order for automation after launch (each pilot bug fixed must land with a regression test at the appropriate layer):

1. **Analytics golden tests (§3)** — already required pre-launch; run in CI on every commit, blocking. Highest value per line of test code.
2. **Import pipeline tests** — encoding matrix (§4 E1–E7) and robustness cases (§5) as API-level tests with fixture files committed under `apps/api/test/fixtures/imports/`. These are deterministic and cheap; automate within 2 weeks of launch.
3. **One Playwright E2E of the core loop** — scenario §2.1→2.7 (import → simulate → export PDF exists and contains a known Hebrew string), run nightly against staging. One reliable journey beats ten flaky ones.
4. **API contract tests** — Zod schemas from `packages/shared` and the analytics OpenAPI schema checked in CI to catch breaking changes between services.
5. Deferred until post-pilot: visual-regression screenshots for RTL layout, cross-browser automation, load testing beyond the §5.4 import benchmark.

Release rule during pilot: no deploy without green CI on layers 1–2 and a manual pass of the §2 core-loop scenarios touched by the change.

## M0 Verification Results (ATL-010, 2026-07-21)

Independent re-verification of ATL-007 (toolchain) and ATL-009 (cleanup report) by atlas-qa.
Environment: node v22.22.2, pnpm 10.33.0, uv 0.8.17, Python 3.11.15 (CI pins 3.12 — divergence
documented in `services/analytics/pyproject.toml` header). HEAD = `4038cfa`; baseline = `cbbdedd`.

### ATL-007 — commands executed and results

| # | Command | Result | Key output |
|---|---|---|---|
| 1 | `pnpm install` (working tree) | PASS | "Scope: all 6 workspace projects … Done in 641ms" (warm) |
| 2 | `pnpm install --store-dir <fresh>` (cold clone, isolated store) | PASS | "Packages: +176 … downloaded 176 … Done in 1.7s"; lockfile holds exactly 226 resolved packages (`grep -c "resolution:" pnpm-lock.yaml` = 226) — reconciles the "~226 packages" claim |
| 3 | `CI=true pnpm install --frozen-lockfile` (clone, as CI runs it) | PASS | "Done in 916ms" |
| 4 | `pnpm lint` | PASS | api/web/shared `eslint .` Done; mobile stub echo |
| 5 | `pnpm typecheck` | PASS | api/web/shared `tsc --noEmit` Done |
| 6 | `pnpm test` | PASS | 3× vitest "1 passed (1)" (api, web, shared) |
| 7 | `pnpm format` (cold clone only — `prettier --write` is a mutator) | PASS | exit 0; `git status --porcelain` empty afterward → formatting idempotent at HEAD |
| 8 | `uv sync` (services/analytics) | PASS | "Resolved 14 packages"; cold clone: installs pytest 9.1.1, ruff 0.15.22, mypy |
| 9 | `uv run ruff check .` | PASS | "All checks passed!" |
| 10 | `uv run ruff format --check .` | PASS | "2 files already formatted" |
| 11 | `uv run pytest` | PASS | "1 passed in 0.00s" (tests/test_placeholder.py) |
| 12 | `uv run mypy src` (strict) | PASS | "Success: no issues found in 1 source file" |

**M0 <10-min setup gate:** cold clone + cold install (isolated pnpm store) + full TS suite + full
Python suite = **~12 seconds total** (install 1.8s, lint/typecheck/test/format 8s, uv suite 2s).
Gate passed with wide margin.

**package.json additive check:** `git diff cbbdedd..HEAD -- package.json` shows only additions
(`private`, `packageManager: pnpm@10.33.0`, scripts `lint`/`typecheck`/`test`/`format`). All six
prototype scripts (`dev`, `dev:node`, `dev:python`, `dev:react`, `install:all`, `build`) unchanged
in value. Confirmed ADDITIVE.

**CI review (`.github/workflows/ci.yml`):** lint job = install --frozen-lockfile, pnpm lint,
pnpm typecheck, uv sync + ruff check + ruff format --check + mypy src; test job = pnpm test +
pytest — same commands QA ran. Divergences noted: (a) CI has **never run remotely** — first run
occurs on next push (known gap); (b) `secrets-scan` job is a **placeholder that always exits 0**
(gitleaks pending GITLEAKS_LICENSE decision) — a green job name with no scan behind it;
(c) CI does not enforce formatting (no `prettier --check` step; the `format` script is write-mode);
(d) CI pins Python 3.12, local dev runs 3.11 (documented in pyproject.toml).

### ATL-009 — inventory re-verification

- `sha256sum *.zip "Codex Installer (7).exe"` recomputed: **21 files, 4 unique digests** —
  13× `0d6b8994f911ff86…a1084a` (Group B), 6× `b0ee11606da774ee…62de2f` (Group C),
  1× `fecff00a63ab4e43…9864db` (Group A), 1× `af718c66f9028d51…f13bf8` (Group D).
  All four full digests byte-identical to the report. Sizes match (251,662 / 125,765 / 68,751 /
  1,315,384 B). `file` confirms Group D is "PE32 executable (GUI) Intel 80386 Mono/.Net assembly".
- Read-only listing spot-check (`python3 -m zipfile` API, zero extraction):
  Group B = 96 entries / 362,913 B uncompressed / internal dates 2026-06-26→29 /
  `data/sample/sample-taba-projects.csv` 1,411 B — all match. Group A = 97 entries / 488,678 B,
  extra entry `urbanrenewalcomplete (2).zip` at exactly 125,765 B (the Group B payload size) —
  matches "zip nested inside itself". Group C = 94 entries / 145,806 B, rooted at `-/`,
  dates 2026-06-25→29 — matches. Section-3 size cross-checks reproduce exactly:
  `backend/node/index.js` 615 B (tree = zip), `routes/import.js` 2,347 B (tree = zip),
  `ROICalculator.jsx` 24,042 B tree vs 10,390 B (B) vs 10,386 B (C); commit `f91e18e` exists.
- **Zero legacy modification:** `git diff cbbdedd..HEAD -- frontend/ backend/ mobile/ data/
  README.md docker-compose.yml | wc -c` = **0**; `git status --porcelain` = empty; changed-file
  list since baseline contains no legacy path, no `*.zip`, no `*.exe`. `.gitignore` lines 13–14
  block `*.zip`/`*.exe` recurrence as claimed.

### Discrepancies / defects filed

| ID | Sev | Finding |
|---|---|---|
| QA-M0-1 | S3 | No delivery handoff entry for ATL-007/ATL-009 exists in HANDOFFS.md (status still `accepted`; the ATL-007 commit is labeled "wip … UNVERIFIED"). CLEANUP_REPORT.md Appendix B cites "the ATL-007/ATL-009 delivery handoff" for its verbatim `git status` output — that handoff is absent. Violates the handoff rule ("TESTS lists actual commands and results"). QA reproduced all results independently, so this is a process defect, not a technical one. |
| QA-M0-2 | S3 | CI `secrets-scan` job is a no-op that reports green. Disclosed in comments, but branch protection pointing at it would show a passing secrets gate with zero scanning. Must be wired (gitleaks or equivalent) or renamed before any release gate relies on it. |
| QA-M0-3 | S4 | CI never executed remotely yet; first run on next push. lint/typecheck/test/pytest verified locally by QA only. |
| QA-M0-4 | S4 | No `prettier --check` in CI; `pnpm format` is write-mode, so formatting drift will not fail CI. |
| QA-M0-5 | S4 (note) | "~226 packages" claim refers to lockfile resolutions (exactly 226); a cold install adds 176 physical packages after dedup. Not a defect; recorded to prevent future confusion. |

### Verdicts

- **ATL-007: PASS-WITH-KNOWN-ISSUES** (QA-M0-1..4). All toolchain acceptance criteria executed
  and green locally; <10-min gate passed at ~12s; package.json additive confirmed. CI-green-remote
  remains unproven until the first push.
- **ATL-009: PASS** (with QA-M0-1 process note). Every inventory claim independently reproduced;
  zero legacy files modified; recommendations correctly left as proposals for the human owner.

## Sprint-1 Verification Results (ATL-020/ATL-021, 2026-07-21)

Independent verification of ATL-020 (docs/CODEBASE_AUDIT.md) and ATL-021 (Founder Control Center)
by atlas-qa. HEAD moved mid-verification from `6800f71` to `ecbcdef` — the ATL-021 owner landed the
two-commit train (`e3f7e6d` sources, `ecbcdef` regenerated dashboard) while checks ran; all ATL-021
results below were re-executed against `ecbcdef`. Toolchain: node v22, pnpm 10.33.0.

### ATL-020 — audit claims spot-checked (adversarial, against source)

| Check | Claim (audit ref) | Verification | Result |
|---|---|---|---|
| A20-a | Four financial engines exist and disagree (D-3, C-1, C-2) | Read all four files in full. `frontend/src/utils/calculations.js` = 259 lines (`wc -l`), demolition `landArea * 250` (line 77), cost model includes permits 3.5% / levy 2.5% / marketing 2% / overhead 8% (lines 117–121). `backend/python/api/roi.py` `compute_roi` lines 24–71: demolition `landArea * 200` (line 30), cost = construction+tenant+demolition+permits+finance only (line 33), fake NPV `profit / (1+r)^years` (line 43), IRR clamped to 0 outside (-1,10) (line 21). `backend/node/routes/roi.js` lines 12–25: third model, demolition triggers only on `פינוי` (line 19, misses `הריסה`), `\|\|`-defaults fabricate inputs (lines 16–21). `mobile/src/screens/ROIScreen.jsx` lines 57–71: fourth model, land area hardcoded `1000 * 200` (line 62), fake IRR = annualized ROI (line 69), fake NPV copied (line 68). Formulas genuinely pairwise divergent (250 vs 200 rate, trigger sets, cost-line composition, revenue basis) | **MATCH** |
| A20-b | Silent numeric fallback, roi.js:11–26 (T-1) | `catch (err)` at line 11 discards the error, recomputes with the local model, responds via `res.json` at line 25 with keys `construction`/`tenant`/`demolition`/`finance` (vs python's `constructionCost`/`tenantCost`/…), no `irr`/`npv`/`paybackYears`, no fallback flag. Confirmed by full read | **MATCH** |
| A20-c | ImportScreen.jsx:23 strips gershayim → יח"ד columns unmappable (C-7) | Line 23: `headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))`. Fixture header (`head -1 data/sample/sample-taba-projects.csv`) contains `יח"ד קיים,יח"ד מוצע` with ASCII quote; after strip → `יחד קיים`, not a FIELD_MAP key (line 14) → `existingUnits`/`proposedUnits` undefined → roi guard (lines 85–87) yields 0. Value-side `תמ"א 38/2` also broken (line 25) | **MATCH** |
| A20-d | Frontend performs zero network calls (DC-1) | `grep -rn "axios\|fetch(" frontend/src` → 0 hits; `axios` nonetheless declared at frontend/package.json line 20 | **MATCH** |
| A20-e | Plaintext password storage + backdoor (C-8) | `frontend/src/store/authStore.js` lines 58–59: `saveUsers([...users, user])` persists the full `{name,email,password,company}` object to localStorage; backdoor `demo@urc.app`/`demo1234` at line 37; credentials pre-filled at `Login.jsx` lines 15–16. Mobile: `mobile/src/store/` contains only `projectStore.js`, no auth/password hit in `mobile/src` — matches "no auth concept at all" | **MATCH** |
| A20-f | Read-only: audit modified nothing | `git log --stat 9489194` → exactly one file, `docs/CODEBASE_AUDIT.md`, 400 insertions, 0 other paths | **MATCH** |

Nit (QA-S1-3, S4): C-1 and T-6 cite `ROIScreen.jsx:61` for the hardcoded `1000 * 200`; actual line
is 62 (line 61 is the tenant-cost line). Substance unaffected. No other citation drift found in the
~30 line references exercised above.

### ATL-021 — checks executed

| Check | Verification | Result |
|---|---|---|
| A21-determinism | `sha256sum` of delivered FOUNDER_DASHBOARD.md/html, then `pnpm dashboard` twice, re-hash after each: `8a2e0b2caac3…5cd3` (md) / `fe85a7df59d5…5e30` (html) all three times — byte-identical, and identical to the files committed in `ecbcdef` (`git diff --stat` empty). Timestamp source is `git log -1 --format=%cs -- docs/coordination`, not wall clock | **PASS** |
| A21-accuracy-1 | Open P0/P1/P2 vs workboard: hand-recount of all 22 task blocks → open P0 = {ATL-001, 003, 003-PLAN, 005, 020, 021} = 6; P1 = {006, 013, 014, 018, 019} = 5; P2 = {008, 011, 012, 015, 016, 017} = 6. Dashboard: 6/5/6, same IDs | **MATCH** |
| A21-accuracy-2 | TEAM rows recomputed from task blocks: CTO 9 total / 1 blocked (008) / 2 backlog (011, 012) / 2 completed (007, 009); QA 4/2/0/1; Product 4/0/1/1; Growth 2/0/0/1; CEO 1/0/0/0; sprint-task cells and Active/Ready labels consistent with sprint-table statuses | **MATCH** |
| A21-accuracy-3 | Risk grouping: RISK_REGISTER.md has exactly R-01…R-09; dashboard renders all 9 exactly once (Technical 3, Security 2, Product 1, Business 2, Process 1); severities/probabilities/statuses verbatim incl. `Mitigated (residual: remote CI observation)` and `Low / High (already true)` | **MATCH** |
| A21-accuracy-4 | Frozen tasks: DL-012 freeze list {011, 012, 015, 016, 017} fully accounted — backlog counts CTO 2 + Product 1 + worker line "ATL-016 (Grok, BACKLOG), ATL-017 (Codex, BACKLOG)" | **MATCH** |
| A21-accuracy-5 | Doc counts vs filesystem (`ls \| wc -l`): docs/*.md = 11, docs/adr = 10, docs/pilot = 5, docs/coordination = 9, docs/growth = 3 — dashboard line identical | **MATCH** |
| A21-accuracy-6 | Founder-blocker list vs CURRENT_MISSION.md standing constraint 4: exactly the same 3 items (ATL-008 archive deletion, GITLEAKS/DL-009, M1 kickoff green-light), plus sprint-progress recount (0 of 8; IN PROGRESS 3, READY 5) matches sprint table | **MATCH** |
| A21-no-hand-status | Full read of tools/founder-dashboard/generate.mjs (980 lines): hardcoded content limited to the permitted presentation mappings — ADR-0010 status-vocabulary normalizer, AGENTS display names, RISK_CATEGORY map, n/a placeholder strings. Team Active/Ready/Waiting, pilot-readiness line, and prospects=0 are derived from parsed sources (heuristics, not constants). No hand-entered status values found | **PASS** |
| A21-freshness-local | ci.yml lint job contains the "Founder dashboard freshness" step (`pnpm dashboard` + `git diff --exit-code FOUNDER_DASHBOARD.*`); two-commit workflow respected (`e3f7e6d` = 4 source files, no dashboard; `ecbcdef` = dashboard only); local regeneration at HEAD leaves zero diff | **PASS** |
| A21-freshness-remote | Simulated the actual CI checkout (`git clone --depth 1`, matching actions/checkout@v4 default fetch-depth 1) into scratchpad and ran the generator: it stamped source commit `ecbcdef` (grafted HEAD) instead of `e3f7e6d`, producing a 4-line diff in each output → `git diff --exit-code` fails. **The freshness gate will fail on every remote CI run even when the dashboard is fresh** (defect QA-S1-1) | **FAIL** |
| A21-toolchain | `pnpm lint` PASS (eslint api/web/shared Done) · `pnpm typecheck` PASS (tsc Done ×3) · `pnpm test` PASS (vitest "1 passed (1)" ×3). No regression from the ATL-021 package.json/ci.yml changes | **PASS** |

### Defects filed

| ID | Sev | Finding | Return to |
|---|---|---|---|
| QA-S1-1 | S3 | CI freshness gate false-positives under the default shallow checkout: `actions/checkout@v4` fetches depth 1, the grafted HEAD "introduces" every path, so the generator's `git log -1 -- . :(exclude)FOUNDER_DASHBOARD.*` resolves to HEAD (e.g. the dashboard-only commit `ecbcdef`) instead of the true last source commit — regenerated output differs from committed output and the lint job goes red on every push/PR regardless of freshness. Reproduced with `git clone --depth 1`. Consequence: QA-M0-3 (first remote CI run green) is unachievable until fixed. Fix direction (CTO's choice): `fetch-depth: 0` on the lint-job checkout, or stamp from a source that survives shallow clones; PR-event merge-commit behavior must be re-verified after the fix | atlas-cto |
| QA-S1-2 | S4 | Commit `e3f7e6d` message says "…; coordination updates" but the commit touches only ci.yml, README.md, package.json, tools/founder-dashboard/generate.mjs — no coordination file. Misleading history | atlas-cto |
| QA-S1-3 | S4 | CODEBASE_AUDIT.md C-1/T-6 cite ROIScreen.jsx:61 for the hardcoded land area; actual line 62 | atlas-cto |

### Verdicts

- **ATL-020: PASS.** 6/6 spot-checks MATCH, including all CRITICAL claims (four divergent engines,
  silent fallback, gershayim import bug verified against the shipped fixture); read-only constraint
  proven at commit level. One S4 citation nit (QA-S1-3). QA recommends promotion to VERIFIED.
- **ATL-021: PASS-WITH-KNOWN-ISSUES.** Dashboard is deterministic, honest (every value traced to a
  source or explicit n/a), and 6/6 accuracy cross-checks MATCH; two-commit workflow respected;
  toolchain regression green. However the CI freshness gate — acceptance criterion 3 — is broken in
  the real CI environment (QA-S1-1): it fails closed on *every* remote run, fresh or stale. Hold at
  IMPLEMENTED; VERIFIED only after QA-S1-1 is fixed by atlas-cto and independently re-verified
  (which also unblocks QA-M0-3). Note: this QA_PLAN.md append is itself a dashboard source change —
  the committing session must run `pnpm dashboard` in the follow-up commit per the two-commit rule
  (content is expected to be unchanged by this section; verify with `git diff`).
