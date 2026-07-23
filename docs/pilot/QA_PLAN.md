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
3. **Import GeoJSON and see it on the map** — **DEFERRED TO POST-PILOT (DL-008 — out of pilot scope; PILOT_SCOPE Won'ts win).** Not executed for the pilot acceptance gate; retained verbatim for post-pilot re-activation. (The Leaflet map itself is a PILOT_SCOPE §4 "Should" and, if shipped, is smoke-checked under §2.6's dashboard portion — only the GeoJSON import path is deferred.)
   Given a GeoJSON of project parcels, When imported, Then each project appears as a Leaflet marker/polygon at the correct coordinates and clicking opens the project.
4. **Create project & configure scenario**
   Given an imported project (e.g. case 2024-001, פינוי-בינוי), When the user sets apartment mix, build cost, and sale price and saves, Then the scenario persists after reload and input validation rejects negatives/blank required fields with Hebrew error messages.
5. **Run simulation**
   Given a saved scenario, When the user runs the simulation, Then IRR, NPV, payback, and the sensitivity table are displayed within 10 s and match the golden values for that fixture (§3).
6. **View results: dashboard + 3D + map** — **DEFERRED TO POST-PILOT (DL-008 — out of pilot scope; PILOT_SCOPE Won'ts win)** for its **3D portion** (per PILOT_SCOPE §9 scope note: "their GeoJSON/3D portions"). The 3D before/after clause is not executed for the pilot gate. The non-3D substance — charts render and **figures on screen equal figures in the API response** — remains in scope and is executed under PILOT_SCOPE §9 AC-RES-1/AC-SCN-3 and §2.5 of this suite; it is NOT deferred.
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

### Addendum — QA-S1-1 re-verification (fix commit bc52714, 2026-07-21)

Independent adversarial re-verification of the atlas-cto layered fix (ci.yml `fetch-depth: 0` +
`fetch-tags`; generator stamp `--no-merges`, docs/**-scoped, shallow-repo fallback). All tests ran
in scratch clones pinned to `bc52714` — NOT the working tree, which carries in-flight M1 work
(`079e8e8`, out of scope). Generator invoked as `node tools/founder-dashboard/generate.mjs`
(what `pnpm dashboard` wraps).

| Test | Setup | Result |
|---|---|---|
| RV-1 | `git clone --depth 1` (CI-default shallow) + fresh dashboard → generate + `git diff --exit-code FOUNDER_DASHBOARD.*` | Gate PASSES — shallow fallback reuses committed stamp `0d58c3b`, zero diff (the QA-S1-1 false positive is gone) |
| RV-2 | Shallow + stale: RISK_REGISTER.md R-02 probability edited, no regen | Gate FAILS as required — data values are re-parsed fresh under the fallback (R-02 row diff observed) |
| RV-3 | Full clone + committed edit to a parsed docs source, no regen | Gate FAILS as required (stamp `0d58c3b`→`c7cf85e` plus content diff, 6 changed lines) |
| RV-4 | Full clone + committed edit to a NON-parsed docs file (ARCHITECTURE.md), no regen | Gate FAILS as required — docs/** scope moves the stamp (`0d58c3b`→`f45ca44`) |
| RV-5 | Synthetic merge commit carrying a docs change (side `1b1cf93`, merge `8fd026e`) | Stamp resolves to `1b1cf93` (the real source commit), never the merge — `--no-merges` effective |
| RV-6 | Full-clone determinism at bc52714: generator run twice | Byte-identical both runs (`sha256` md `54bafb47…e086a4`, html `f7d81848…76de4ba`) and identical to the committed bc52714 outputs (`git diff --exit-code` clean) |
| RV-7 | Code-only commit outside docs/** (README edit), no regen | Stamp unmoved (`0d58c3b`), output identical, gate green — intended new behavior, no false positive |
| RV-8 | Code-only commit that changes derived content: add `apps/web/src/Probe.tsx`, no regen | Gate FAILS as required — UX-status line is re-derived from the tree (`pre-build…` → `1 UI component file(s)…`), so the docs/** stamp scope creates no content blind spot |
| RV-9 | Re-read of generate.mjs at bc52714 (diff = one `gitStamps()` hunk + ci.yml checkout config) | No new hand-entered status values — fallback strings are parsed from the committed FOUNDER_DASHBOARD.md, all data values still source-parsed |

Residual notes (non-blocking):

- RN-1 (S4) — in SHALLOW clones only, the fallback reuses the committed stamp, so a docs commit
  that changes no parsed value passes the gate there (reproduced with an ARCHITECTURE.md-only edit
  in the shallow clone). The enforced gate runs in CI on a full clone (`fetch-depth: 0`), where the
  identical case fails (RV-4). Accepted with this note.
- RN-2 (S4) — the rendered label "last source commit" now semantically means "last docs/** commit";
  values derived outside docs/** (UX status from apps/web/src, future git tags) can postdate the
  stamp. Cosmetic label drift; content staleness is still caught (RV-8).
- RN-3 (observation, for atlas-cto) — at the in-flight tip `079e8e8` the committed dashboard is
  already stale by 2 lines (UX status; M1 web files landed without regeneration). The repaired gate
  will correctly fail the next remote CI run until the M1 committer runs `pnpm dashboard`. Working
  as designed — regenerate with the M1 commit train.

**QA-S1-1: CONFIRMED-FIXED at bc52714.** ATL-021 acceptance criterion 3 now holds under adversarial
testing (fresh passes, stale fails, merge commits excluded, determinism intact). QA recommends
promoting ATL-021 to VERIFIED. QA-M0-3 (first remote CI run observed green) remains open — it gates
ATL-007's `verified`, not ATL-021, and per RN-3 that first run will exercise this gate for real.

## M1 Verification Results (ATL-003, 2026-07-21)

Independent adversarial verification of ATL-003 (three CTO work packages + integration pass) at
HEAD `f1fc530` on branch `claude/production-project-init-bfa25e`. Environment: node v22.22.2,
pnpm 10.33.0, uv 0.8.17, Python 3.11.15. Working tree clean before and after (`git status
--porcelain` empty except this append); no product or legacy file modified. Servers were run on
non-default ports (analytics 8021, API 3021, web preview 4021) and killed afterward.

### 1. Full gates — commands executed and results (all run by QA)

| # | Command | Result | Key output |
|---|---|---|---|
| 1 | `pnpm install` | PASS | "Done in 958ms", 6 workspace projects |
| 2 | `pnpm lint` | PASS | eslint api/web/shared Done; mobile stub skipped |
| 3 | `pnpm typecheck` | PASS | tsc --noEmit Done ×3 (api/web/shared) |
| 4 | `pnpm test` | PASS | **84 TS tests**: shared 32 (5 files), web 31 (5 files), api 21 (5 files) — matches claim exactly |
| 5 | `pnpm -r build` | PASS | shared tsc -b; web `tsc -b && vite build` → 122 modules, `dist/index.html` + assets; api tsc -b |
| 6 | `uv sync` | PASS | "Resolved 31 packages", audited 29 |
| 7 | `uv run ruff check .` | PASS | "All checks passed!" |
| 8 | `uv run ruff format --check .` | PASS | "16 files already formatted" |
| 9 | `uv run mypy src` | PASS | "Success: no issues found in 11 source files" |
| 10 | `uv run pytest` | PASS | **39 passed** in 2.63s (1 StarletteDeprecationWarning, non-blocking) |

All gate expectations (0 errors; 84 TS = 32/31/21; 39 pytest) reproduced independently. Green.

### 2. Golden-fixture independent re-derivation (ADR-0006 human-verification proxy)

**This is analytic re-derivation from the closed-form algebra in each fixture's `derivation`
field — NOT a customer spreadsheet.** Three of nine fixtures recomputed from scratch in Python
(`fractions.Fraction` / `decimal.Decimal`, exact rationals), independent of any Atlas code:

- **02_geometric_three_period** (`cf=[-1e6,0,0,1.331e6]`, r=0): IRR = (1.331)^(1/3)−1 = **0.1** exact
  (verified 1.1³ = 1331/1000 as exact fraction); NPV@0 = **331000**; simple payback = 2 + 1000/1331 =
  **2.7513148009015777…** — fixture pins `2.751314800901578` (agrees to 15 sig figs, within the 1e-9
  rel tol). MATCH.
- **07_multi_root_smallest_positive** (`cf=[-1e5,2.5e5,-1.56e5]`, r=0): quadratic 100x²−250x+156=0,
  discriminant **100**, roots x∈{1.3,1.2} ⇒ r∈{0.3,0.2}; verified NPV(0.3)=NPV(0.2)=**0** exactly
  (both genuine roots); smallest-positive policy ⇒ IRR = **0.2**; NPV@0 = **−6000**; first-crossing
  payback = 1e5/2.5e5 = **0.4** (the later dip to −6000 correctly ignored). MATCH.
- **09_scenario_remainder_split** (`total_rev=1000001` over periods 1-3, one 2-agora cost at t0):
  floor split 333333 + remainder 2 to the two earliest periods ⇒ cashflows **[-2,333334,333334,
  333333]** (sum 1000001, lossless); NPV@0 = profit = **999999**; roi_on_cost = 999999/2 =
  **499999.5** exact; payback = 2/333334 = 5.999988…e−6 (fixture `0.000005999988`, rel err 4e−12,
  within 1e-9); IRR = **null** confirmed — NPV stays strictly positive across (−0.99, 10) (scanned;
  min NPV over window ≈ 33306 > 0), so the true root lies outside the policy window. MATCH.

All three fixtures' committed values equal my own independent arithmetic. `uv run pytest
tests/test_golden.py` runs all 9 fixtures + inventory = 10 passed. Golden suite is trustworthy.

### 3. LIVE e2e smoke — independently executed (real analytics + real API)

Started analytics (`uvicorn … --port 8021`, healthz→`{"status":"ok"}`) and API (`node dist/server.js`,
PORT=3021, ANALYTICS_URL=http://127.0.0.1:8021, 32-char JWT_SECRET, SEED_USER_PASSWORD set).
Flow: login `analyst@atlas.local` → POST /projects → POST scenario → POST simulate, all with my own
PROFITABLE inputs (mix 20u × 100 m² × 3,000,000 agorot/m²; costs 4,000,000,000 + 500,000,000; rate 0.08).

Response (`HTTP 200`): `irr="0.333333333"`, `npvAgorot=1055555556`, `profitAgorot=1500000000`,
`roiOnCost=0.3333…`, `paybackYears=0.75`, full 5×5 sensitivity grid.

**Hand-verified against my own arithmetic (Decimal):** revenue = 20·100·3e6 = 6,000,000,000;
cost = 4,500,000,000; profit = **1,500,000,000** ✓; NPV = −4.5e9 + 6e9/1.08 = 1,055,555,555.5…
→ half-even **1,055,555,556** ✓; IRR = 6/4.5 − 1 = **0.3333…** ✓; payback = 4.5/6 = **0.75** ✓
(non-null, numeric, as required for a profitable scenario). Two sensitivity corner cells also
hand-checked: cell[0][0] (cost/price −10%) = −4.05e9 + 5.4e9/1.08 = **950,000,000** ✓; cell[4][4]
(cost/price +10%) = **1,161,111,111** ✓; centre cell = base NPV 1,055,555,556 ✓. Every displayed
financial figure equals my independent computation to the agora.

### 4. Security probes on the live API

| Probe | Expected | Actual | Result |
|---|---|---|---|
| 4a — no token → `GET /projects` | 401 envelope | `401 {"error":{"code":"FST_JWT_NO_AUTHORIZATION_IN_HEADER",…}}` | PASS |
| 4b — viewer token → `POST /projects` | 403 | `403 {"error":{"code":"FORBIDDEN","message":"Insufficient role for this route"}}` | PASS |
| 4b′ — viewer token → `GET /projects/:id` (same org) | 200 | `200` (read allowed, write denied — role split correct) | PASS |
| 4d — wrong password vs unknown email | identical 401 shape | both `401 {"error":{"code":"INVALID_CREDENTIALS","message":"Email or password is incorrect"}}` — byte-identical, no account probing | PASS |
| extra — garbage token | 401 | `401 FST_JWT_AUTHORIZATION_TOKEN_INVALID` (bad base64url) | PASS |
| extra — tampered signature | 401 | `401` "The token signature is invalid" | PASS |
| extra — analytics DOWN → simulate | 503, no fabricated number | `503 {"error":{"code":"ANALYTICS_UNAVAILABLE",…}}` — **NO number returned** (legacy silent-fallback ban holds live) | PASS |

Note on the 503 test: my first kill hit only the `uv run` wrapper; the uvicorn child reparented and
kept serving (log showed a second `POST /v1/simulate 200`), so the re-simulate legitimately returned
correct numbers. I then killed the real listener via `fuser -k 8021/tcp` (healthz→connection
refused) and re-ran: 503 with no numbers. The no-fallback path is genuinely verified, not a false
pass.

**4c — cross-tenant (live):** NOT probeable on this build's default seed — `server.ts` seeds all
three users (admin/analyst/viewer) under **one** shared `orgId`, so no second org exists to probe
across at runtime. Cross-tenant isolation is instead verified via committed evidence:
`apps/api/test/projects.test.ts` "cross-tenant probe" seeds ORG_A + ORG_B and asserts org B gets
**404** on read/update/delete of org A's project and `[]` on list, with org A's project untouched
(part of the 21 green api tests). Org scoping is taken from the token, never client input
(routes pass `request.user.orgId` into every service call — confirmed by source read). Recorded as
QA-M1-3 (note): live two-org probing needs a two-org seed or the Postgres user store.

### 5. Web — preview smoke, RTL, demo banner, contract render path

- `pnpm --filter @atlas/web build` → green (in step 1). `vite preview --port 4021`: served `/`
  returns `<html lang="he" dir="rtl">` and `<title>אטלס — סימולטור התחדשות עירונית</title>` — RTL and
  Hebrew lang attributes present in the served artifact (matches `dist/index.html`).
- Demo-mode banner logic exists: `lib/api.ts` `isDemoMode()` = `(VITE_DEMO ?? "1") !== "0"` (ON by
  default); `app/AppShell.tsx:52` renders `<p className="demo-banner" role="note">{t("app.demoBanner")}</p>`;
  he string `"מצב הדגמה — הנתונים סינתטיים ואינם נשמרים בשרת"`. Demo dataset is synthetic
  (`lib/demo-adapter.ts`, TESTING_STRATEGY rule 4) — no customer data.
- `ResultsPage.tsx` render path matches the shared contract: reads `result.irr` (string|null →
  honest "undefined" state, no fabricated number), `npvAgorot`, `profitAgorot`, `roiOnCost` (number),
  `paybackYears` (number|null → "none" state), and `sensitivity` (priceDeltas/costDeltas/npvAgorot).
  Field shapes align with `SimulationResultSchema`.

### 6. Acceptance-criteria coverage map (ATL-003)

| # | Criterion | Status | Evidence |
|---|---|---|---|
| AC-1 | Persistence with migrations | **PARTIAL** | `migrations/0001_init.sql` written and well-formed (orgs/users/projects/scenarios; money BIGINT agorot; `projects_org_case_number_unique` per-org dedup for §5.5; argon2id column; role CHECK). BUT never executed — `repo-pg.ts` are 501 NOT_IMPLEMENTED stubs, `app.ts` wires `InMemory*Repo` by default. Consequence: data does **not** survive a process restart, so QA_PLAN §2.4 "persists after reload" holds only within process lifetime. |
| AC-2 | Auth with roles | **MET** (in-memory stopgap) | Live: argon2id hash at seed, HS256 15-min token (`expiresInSeconds:900`), viewer→POST 403 / analyst→POST 201, undeclared routes fail closed (`ROUTE_POLICY_MISSING`), identical 401 for wrong-password/unknown-email. Stopgap: users are in-memory (`InMemoryUserStore`), seeded only when `SEED_USER_PASSWORD` set (safe default = no login). |
| AC-3 | Analytics internal-only, single public API | **MET** (architecturally) | `AnalyticsClient` is the only caller path; **no fallback compute** — unreachable → 503 (proven live), non-200 → 502 ANALYTICS_ERROR, schema mismatch → 502 ANALYTICS_CONTRACT_VIOLATION (Zod-validated response). No internet binding in code — host binding is a deployment concern (`uvicorn --host`); analytics carries no auth by design and trusts the private network per SECURITY.md. Deployment MUST bind analytics to a private interface (localhost/private subnet) — verify in the deploy manifest before pilot. |
| AC-4 | CI green gate | **PARTIAL** | Every gate command green **locally, run by QA** (step 1). Remote CI still unobserved — QA-M0-3 carried forward; and the ATL-021 freshness gate was fixed at bc52714 but the in-flight tip is stale until `pnpm dashboard` runs with the M1 train (RN-3). First remote run remains the open evidence. |

### Defects filed

| ID | Sev | Finding | Return to |
|---|---|---|---|
| QA-M1-1 | S3 | `apps/web/src/lib/contracts.ts` is a hand-maintained LOCAL MIRROR, not an import of `@atlas/shared` (TODO says blocked on the zod ^3/^4 split) — contract-drift risk that the API contract-test layer does not cover for web. The non-demo form→ScenarioCreate mapping is **not implemented**: form `ApartmentMixRow{rooms,count,areaSqm,salePricePerUnitAgorot}` and named cost fields do not map to shared `{label,units,areaSqm,salePricePerSqmAgorot}` / `costItems[]`. So the live web core loop in **non-demo** mode cannot yet POST a valid scenario. Demo mode (default) works and is synthetic-only. Explicitly flagged by CTO in the f1fc530 message; scoped to a later integration slice, not an ATL-003 AC. Must close before any pilot on real data. | atlas-cto |
| QA-M1-2 | S4 | Web mirror types `SimulationResult.roiOnCost` as `number` while the shared contract is `number \| null` (null when total cost = 0). Runtime is safe (`ResultsPage` uses `formatFraction(...) ?? fallback`), but the type is unsound and will drift once web imports shared. | atlas-cto |
| QA-M1-3 | S4 (note) | Live cross-org probing is impossible on the default seed — `server.ts` puts all three seeded users in one org. Isolation is proven by committed `projects.test.ts` (ORG_A/ORG_B → 404 / `[]`). Add a two-org seed option (or wait for the Postgres user store) so cross-tenant can be probed against a live deploy during UAT. | atlas-cto |
| QA-M0-3 | S4 (carried) | First remote CI run still unobserved; all gates verified locally by QA only. Gates ATL-007/ATL-003 AC-4 `verified`. | atlas-cto |

Persistence gap (AC-1 PARTIAL) is not filed as a standalone defect — it is a declared, documented
M1 boundary (in-memory stopgap with the Postgres task tracked separately). It is, however, a hard
prerequisite for a real pilot (QA_PLAN §2.4/§2.9 require data to survive reload) and is called out
in the readiness score below.

### Verdict

- **ATL-003: PASS-WITH-KNOWN-ISSUES.** The verified slice is strong: all gates green (84 TS + 39
  pytest, reproduced), golden values independently re-derived to the agora, and a genuinely live
  e2e smoke with every financial figure hand-checked and every security probe (401/403/401-parity/
  no-fallback-503) passing against the running services. Zero S1/S2 defects; zero wrong financial
  numbers. Known issues are all S3/S4 and all are documented, in-scope-for-later boundaries
  (in-memory persistence, web non-demo mapping, unobserved remote CI), not regressions. AC coverage:
  AC-2 and AC-3 MET; AC-1 and AC-4 PARTIAL (by design, not by defect).
- **M1 production-readiness score: 6/10.** The financial engine and the API/auth/analytics contract
  are trustworthy and independently verified — the hard part is done and honest. The remaining 4
  points are the unbuilt pilot-critical remainder: durable persistence (data currently lost on
  restart), the live web core loop in non-demo mode, and a first green remote CI run. Not a launch
  candidate yet; a solid, verified walking skeleton.
- **Recommended workboard status:** move ATL-003 to **VERIFIED** for the slice it actually claims
  (persistence-schema + auth/roles + analytics-single-API + local-green gates), with QA-M1-1/2/3 and
  QA-M0-3 recorded as open follow-ups and AC-1/AC-4 explicitly logged as PARTIAL. Do **not** treat
  ATL-003 as closing the pilot core loop — CLOSED and any "pilot-ready" claim stay blocked until
  Postgres persistence, the web non-demo mapping, and an observed green remote CI land and are
  re-verified.

## M1 Completion Verification Plan (ATL-018)

Written 2026-07-23 (atlas-qa, ATL-018). This is a **plan**, not a result: nothing below is claimed as
executed, and no verification claim is made about any unbuilt feature. It states exactly what QA will
run, independently, when each M1 follow-up task lands (DL-015 gate: all three VERIFIED → M1 complete).
Mapping to ATL-003 acceptance criteria: ATL-022 closes **AC-1** (persistence) and the AC-2 live
cross-tenant residual (QA-M1-3); ATL-023 closes the web side of the core loop (QA-M1-1/-2); ATL-024
closes **AC-4** (CI green gate). AC-2 (auth/roles) and AC-3 (analytics internal-only, no fallback)
were already verified live in the M1 results above and will be regression-checked, not re-litigated.

### ATL-022 — Postgres persistence live (P0)

All checks run by QA against a real Postgres (the delivered compose/testcontainers setup), never
against the in-memory repos. Fixture users/orgs are synthetic (TESTING_STRATEGY rule 4).

1. **Migration apply + re-apply idempotency.** Apply migrations to a **fresh** Postgres; assert schema
   objects exist (orgs/users/projects/scenarios, `projects_org_case_number_unique`, role CHECK, BIGINT
   money columns). Run the migration runner a **second time** on the same database: it must be a clean
   no-op (exit 0, "already applied", zero DDL executed) — no errors, no duplicate objects. Then apply
   to a dirty database mid-state if the runner claims resumability; otherwise confirm it refuses safely.
2. **Restart-survival.** Via the live API: login → create project → create scenario → simulate. `kill -9`
   the API process (and separately restart the Postgres container to prove durability is in the DB, not
   a cache). Restart, login again, GET the same ids: project, scenario, and stored results identical
   field-by-field to the pre-kill responses. This is the §2.4/§2.9 "persists after reload" criterion —
   the check that the M1 slice could not pass.
3. **Live cross-org probes (two-org seed).** Requires the ATL-022 AC's real multi-org store or two-org
   seed (closes QA-M1-3). Obtain tokens for an ORG_A user and an ORG_B user. From ORG_B: GET/PUT/DELETE
   ORG_A's project and scenario by id → **404 every time** (not 403 — no existence leak), list → `[]`,
   response bodies free of ORG_A identifiers; ORG_A data unchanged after the probe. Repeat in the
   opposite direction. Also re-check org scoping is still token-derived (`request.user.orgId`), never
   client input — by source read and by sending a forged `orgId` in request bodies/query.
4. **Agorot BIGINT round-trip at boundary values.** POST scenarios whose money fields are: `0`, `1`,
   `2147483647` and `2147483648` (int4 boundary — catches an accidental INTEGER column or driver cast),
   `9007199254740991` (`Number.MAX_SAFE_INTEGER`, the JS float-precision cliff), and a value above it
   (e.g. `9007199254740993`) — the last must either round-trip **exactly** or be **rejected at the
   boundary** by validation; silent precision loss (value comes back off by 1 agora) is a wrong stored
   financial number = **S1** per §1/DL-006. Round-trip = POST → pg → GET returns the identical integer;
   also verify the pg driver path (BIGINT as string/BigInt, not `parseFloat`).
5. **/readyz behavior with DB up/down.** DB up → 200. Stop Postgres → /readyz returns non-200 (503)
   while the process stays alive (no crash-loop), and mutating endpoints fail with an honest 5xx error
   envelope, never a fabricated success. Start Postgres again → /readyz recovers to 200 **without an
   API restart**. Contrast check: /healthz (liveness) stays 200 throughout if that is its declared
   contract.
6. **Regression:** full gates rerun (`pnpm lint/typecheck/test`, `uv run pytest`), the api test suite
   green against real Postgres (testcontainers), and the M1 live e2e smoke (§ M1 results, step 3)
   repeated on the pg-backed build with the same hand-verified numbers.

### ATL-023 — Web non-demo mapping + accessToken flow (P1)

1. **Form→ScenarioCreate mapping correctness against the shared schema.** The mapping's output must
   parse under the **`@atlas/shared`** `ScenarioCreate` Zod schema (imported, or guarded by a contract
   test if the mirror survives — either way QA-M1-2's `roiOnCost` nullability must be gone). Adversarial
   content check, not just shape: the form's `ApartmentMixRow {rooms, count, areaSqm,
   salePricePerUnitAgorot}` and named cost fields must land in shared `{label, units, areaSqm,
   salePricePerSqmAgorot}` / `costItems[]` with **hand-verified arithmetic** — I will compute one
   mapped scenario to the agora myself (per-unit → per-sqm price conversion is a financial
   transformation; any drift is a wrong number = S1). Includes rounding behavior when
   per-unit price does not divide evenly by area.
2. **accessToken flow.** Live against the API: login from the web UI → token attached to subsequent
   calls; a request after the 15-minute expiry (or with a forged/expired token injected) is handled
   honestly — user is returned to login / shown a Hebrew auth error, no silent retry loop, no stale
   data rendered as fresh. Note where the token is stored (memory/localStorage) for the security
   review record.
3. **Full browser loop against live API + engine.** `VITE_DEMO=0` build, real analytics + real API
   (Postgres-backed if ATL-022 landed first). In a real browser: login → create project → configure
   scenario → simulate → results. Every displayed figure must equal the API response **and** my own
   independent arithmetic (golden-fixture inputs or the M1 smoke inputs re-used). Demo banner absent
   in non-demo mode; present in demo mode (regression).
4. **RTL rendering of live results.** On the live results page: `dir="rtl"` and `lang="he"` hold; all
   strings from i18n keys (no hardcoded English leaking in non-demo paths); numbers/dates LTR-embedded
   inside RTL text (§4 E8); IRR-null and payback-null fixture states render the honest Hebrew
   "undefined" wording, never a fabricated number (§ M1 results, ResultsPage contract).

### ATL-024 — First green remote CI + prettier gate (P1)

1. **What "observed green" means — nothing less:** a **link to the actual GitHub Actions run** on the
   pushed M1-train commit (run URL + commit SHA recorded as evidence), with **all three jobs** green —
   lint (including the ATL-021 dashboard-freshness step, exercised for real per RN-3 on a freshly
   regenerated dashboard), test, and secrets-scan. Explicit caveat carried with the evidence: the
   secrets-scan job is still the decorative exit-0 placeholder (QA-M0-2 / DL-009) — its green counts
   for "workflow executes remotely", **not** as a security gate. A green run on a stale dashboard, a
   partial-job run, or "it should pass" does not close anything.
2. **Prettier gate proven both ways:** `prettier --check` (or `pnpm format:check`) added to the lint
   job; demonstrated **failing** on a deliberately misformatted scratch commit (red run linked) and
   **passing** once formatted (green run linked). One-directional evidence is insufficient.
3. **Freshness-gate negative check (if cheap):** the RN-3 scenario — a docs change without regeneration
   — fails the remote run as designed (already proven in scratch clones at bc52714; a remote
   confirmation is a bonus, not a gate).
4. **Explicit promotion list this unlocks, and nothing more:** ATL-007 → fully **verified** (its last
   open evidence was remote CI); ATL-003 **AC-4** → MET; **QA-M0-3 closed**; **QA-M0-4 closed** (via
   the prettier gate). NOT unlocked: QA-M0-2 (stays open until the human owner rules on DL-009),
   and no "pilot-ready" implication — that needs all three tasks plus the Founder items per DL-015.

## M2 Verification Approach (ATL-018 preview)

How QA will execute PILOT_SCOPE.md §9's acceptance-criteria groups, mapped to TESTING_STRATEGY.md
layers. §9 already references this plan's §2 scenarios and §4 encoding matrix — this section assigns
**test types**, it does not restate criteria. §2 scenarios 3 and 6 (3D portion) are deferred per
DL-008 (annotations above); the §2 suite for M2 is therefore 9 active scenarios plus 6's non-3D
substance. Detailed per-criterion scripts will be written when M2 tasks are delegated.

| §9 group | Golden files (pytest, blocking) | Automated API/integration | Playwright E2E | Manual / UAT |
|---|---|---|---|---|
| **AC-IMP** (import) | — | AC-IMP-1..5 as API-level tests with fixtures under `apps/api/test/fixtures/imports/` (TESTING_STRATEGY: every fixture in UTF-8 / UTF-8-BOM / cp1255; §4 E1–E7; §5 robustness) | AC-IMP-1 upload happy path inside the core-loop journey | AC-IMP-6 time budget on staging; §4 E4 mis-detection prompt UX |
| **AC-SCN** (scenario + compare) | — | AC-SCN-1/-2 persistence + lifecycle against real Postgres (testcontainers; builds on ATL-022) | AC-SCN-3 compare view = results view = API response (internal consistency, golden inputs); AC-SCN-1 Hebrew validation messages | Spot-check compare on UAT data |
| **AC-RES** (results) | AC-RES-1/-2/-3: golden fixtures + §3 tolerance policy; §3 contract test guards API↔engine drift; grow suite from 9 fixtures to the §3-required ≥12 before the M2 gate | Sensitivity structure (axes, monotonicity) at API level | AC-RES-1/-2 rendered values + honest null states in-browser | **AC-RES-4 customer reconciliation — manual only, documented session record (never repo data)**; AC-RES-5 ≤10 s on staging |
| **AC-EXP** (PDF/XLSX) | Numbers in exports tie back to golden values via AC-RES-1 | XLSX cell-type checks (numeric not text) where library-testable | PDF text extraction: correctly ordered Hebrew + known figures present (TESTING_STRATEGY RTL-PDF rule); export triggered in the E2E journey | §4 E9/E10 visual shaping, Adobe Reader / Chrome viewer / Excel 365 / LibreOffice opens (§6 browser matrix); AC-EXP-2 completeness checklist |
| **AC-E2E** (<30-min gate) | — | — | The single core-loop journey (§8 item 3): import → scenario → simulate → compare → PDF exists with known Hebrew string | **AC-E2E-1 executed by QA by hand, wall-clock timed, zero developer assistance**; AC-E2E-2 live authZ probes across all four surfaces (extends §2.11 + the ATL-022 two-org probes to results/exports) |

Standing rules for all of the above: any failed numeric criterion is S1 (§1, DL-006); golden-file
changes need written justification in the same PR; encoding matrix = §4 of this plan, executed not
duplicated; Hebrew/RTL correctness is part of every criterion (§9 cross-cutting rule), not a separate
pass; real customer data never enters fixtures (TESTING_STRATEGY rule 4) — AC-RES-4 evidence lives
only in reconciliation session records.

## ATL-022 Verification Results (Postgres persistence live, 2026-07-23)

Independent adversarial verification of ATL-022 by atlas-qa at HEAD `08cd493` (branch
`claude/production-project-init-bfa25e`, delivery was a `wip … UNVERIFIED checkpoint` commit).
Executed the ATL-022 subsection of the M1 Completion Verification Plan above. Environment: node
v22.22.2, pnpm 10.33.0, PostgreSQL 16.13. QA ran its **own** scratch cluster (independence): `initdb`
as the unprivileged `postgres` user under the scratchpad, port **54331**, databases `atlas_qa`,
`atlas_qa_test`, plus `atlas_qa_lock`/`atlas_qa_dirty` for edge tests. Analytics on 8033, API on 3033.
Cluster + processes torn down after; `git status --porcelain` empty before and after (this append only).
`infra/environments/dev/README.md` was followed as written and is accurate except for the reliability
claim contradicted in item 5.

Plan items executed: **8/8** (item 5 FAILS).

### 1. Migration apply + re-apply + advisory lock + dirty-DB — PASS

- `DATABASE_URL=…/atlas_qa pnpm --filter @atlas/api migrate` run 1 → `applied: 0001_init.sql` /
  `migrations complete — 1 applied, 0 already applied`. Run 2 (same DB) → `already applied:
  0001_init.sql` / `0 applied, 1 already applied` — clean idempotent no-op, exit 0, no DDL.
- Schema objects verified by `psql`: 5 tables (orgs/users/projects/scenarios/schema_migrations);
  `land_value_agorot`/`build_cost_per_sqm_agorot`/`sale_price_per_sqm_agorot` = **bigint**;
  `projects_org_case_number_unique` partial unique index (`WHERE case_number IS NOT NULL`) present;
  users role CHECK = `role = ANY (ARRAY['admin','analyst','viewer'])`; `discount_rate numeric(7,6)`;
  jsonb apartment_mix/cost_items/result.
- **Advisory lock (concurrent boot):** held `pg_advisory_lock(721000001)` in a psql session for 6 s,
  launched the migrate CLI against the same DB → it **blocked 5 s** until the lock released, then
  applied. Concurrent runners serialize, not race. PASS.
- **Dirty-DB safety:** pre-created a conflicting `projects` table, ran migrate → failed loudly
  (`relation "projects" already exists`, exit 1) and **rolled back** — `schema_migrations` count = 0,
  `orgs`/`users` = null (transaction-per-file rollback works; no partial apply recorded).

### 2. Restart-survival (kill -9 + Postgres restart) — PASS

Live: login `analyst@atlas.local` → POST project (`2026-QA-022`) → POST scenario → POST simulate
(`irr="0.333333333"`, `npvAgorot=1055555556`, `profitAgorot=1500000000` — matches the M1 hand-verified
arithmetic). Captured pre-kill GET responses, then **`kill -9`** the API (pid confirmed dead, no
listener on 3033). Separately **restarted Postgres** (`pg_ctl -m fast restart`) to prove durability is
on disk, not a process cache. Restarted the API, re-logged-in (users survived), re-GET the same ids:
`cmp` of pre-kill vs post-kill project JSON → **byte-identical**; scenario+stored result JSON →
**byte-identical**. This is the §2.4/§2.9 "persists after reload" criterion the M1 slice could not pass.

### 3. Live cross-org probes + forged orgId — PASS (closes QA-M1-3)

Two-org seed (org A `analyst@atlas.local`, org B `analyst-b@atlas.local`) via `SEED_USER_PASSWORD`.
From org B against org A's project/scenario:

| Probe | Result |
|---|---|
| `GET /projects` (B) | `[]` (200) |
| `GET /projects/:idA` | 404, 0 leak hits (no A caseNumber/orgId/id in body) |
| `PATCH /projects/:idA` `{name:"hijack"}` | 404, 0 leak |
| `DELETE /projects/:idA` | 404, 0 leak |
| `GET /projects/:idA/scenarios` | 404 `Project not found` |
| `GET …/scenarios/:sidA` | 404 `Scenario not found` |
| `POST …/simulate` | 404 `Scenario not found` |

**No existence oracle:** org B gets the identical `Project not found` for org A's *real* project id and
for a random UUID, and identical `Scenario not found` for real-vs-random — 404 leaks nothing. Org A's
row unchanged in pg after all probes (`cmp` clean). **Forged orgId injection:** org B POSTed a project
with `orgId`=orgA in both the JSON body and `?orgId=` query → created row landed in **org B**
(token-derived), org A cannot see it. Org scoping is taken from `request.user.orgId`, never client
input (confirmed by source + live). The committed `pg.integration.test.ts` cross-tenant test also runs
green against real pg (item 6).

### 4. Agorot BIGINT boundary round-trip — PASS (no S1)

POST project `landValueAgorot` at each boundary; compared raw pg value and round-trip GET:

| Sent | HTTP | stored in pg | GET round-trip |
|---|---|---|---|
| 0 | 201 | 0 | 0 |
| 1 | 201 | 1 | 1 |
| 2147483647 (int4 max) | 201 | 2147483647 | 2147483647 |
| **2147483648 (int4+1)** | 201 | 2147483648 | 2147483648 (true BIGINT, no INTEGER-column cast) |
| 9007199254740991 (MAX_SAFE) | 201 | 9007199254740991 | 9007199254740991 |
| **9007199254740993 (>2^53)** | **400** | — | rejected: `VALIDATION_ERROR` `too_big`, `maximum:9007199254740991` |

The above-2^53 value is **rejected loudly at the boundary**, not silently truncated — the S1 precision-loss
trap is closed on both the write path (Zod `AgorotSchema`) and the read path (`agorotFromDb` throws on
unsafe int, covered by the committed test `agorotFromDb refuses unsafe integers`). Every stored value is
exact to the agora.

### 5. /readyz DB up/down/recover — **FAIL (defect QA-M1-4, S2)**

- DB up: `/readyz` → `{"status":"ok","database":"ok"}` (200); `/healthz` → 200. OK.
- **Stop Postgres → the API PROCESS CRASHES.** node-postgres emits an `'error'` event on an idle
  pooled client (`terminating connection due to administrator command`, SQLSTATE **57P01**); there is
  **no `pool.on('error', …)` handler**, so Node throws `Unhandled 'error' event` and the whole process
  exits. Observed: no listener on 3033, `/readyz` and `/healthz` both return HTTP `000`, stack trace in
  the process log (`throw er; // Unhandled 'error' event` → `Emitted 'error' event on BoundPool
  instance at … Client.idleListener`). The `/readyz` 503 branch in `app.ts` **can never fire** — the
  process dies before it can serve the honest 503 it was designed to return.
- **No self-recovery:** after Postgres came back up, the API stayed down (no listener) — it only served
  again after a **manual restart**. The plan's "process stays alive (no crash-loop)" and "recovers
  without an API restart" both fail.
- **Worse than a full stop:** terminating a **single idle pooled backend** via `pg_terminate_backend`
  (the routine failover / `idle_session_timeout` / maintenance / connection-limit scenario) crashes the
  API identically (same 57P01 unhandled 'error'). Any server-side connection reset = full API outage
  for all tenants.
- This **contradicts `infra/environments/dev/README.md`** ("`/readyz` pings the DB … data survives
  restarts" — the *data* survives, the *service* does not) and the `pool.ts` intent ("fail loudly and
  quickly … rather than hanging"). Data durability is intact; service availability is not.
- Filed **QA-M1-4 (S2)** — reliability/availability defect, no documented/tested workaround → must be
  fixed and independently re-verified before pilot go-live. Fix direction (CTO's choice, not
  prescribed): attach a `pool.on('error', …)` handler that logs and lets `/readyz` report 503 while the
  process survives and reconnects.

### 6. Regression gates — PASS

| Command | Result |
|---|---|
| `pnpm test` (in-memory, no `DATABASE_URL_TEST`) | 84 TS: shared **32**, web **31**, api **21**; pg suite **9 skipped** (gate works) |
| `DATABASE_URL_TEST=…/atlas_qa_test pnpm --filter @atlas/api test` | **30 passed** (21 + 9 pg integration incl. live cross-tenant, restart-survival, BIGINT round-trip, idempotent-migrate, dup-case-number) — exactly as the plan predicted |
| `pnpm lint` | PASS (eslint api/web/shared Done) |
| `pnpm typecheck` | PASS (tsc ×3 Done) |
| `pnpm -r build` | PASS (web vite build 122 modules; api/shared tsc -b) |
| `uv run pytest` (services/analytics) | **39 passed** (1 StarletteDeprecationWarning, non-blocking) |

Live no-fallback path re-confirmed: the committed `scenarios.test.ts` `503 ANALYTICS_UNAVAILABLE …
never a fallback number` passes on the pg build.

### 7. 409 DUPLICATE_CASE_NUMBER per-org / cross-org — PASS

Live: org A POST `caseNumber:DUP-1` → 201; A POSTs `DUP-1` again → **409** `DUPLICATE_CASE_NUMBER`
("already exists in this organization"). Org B POSTs the **same** `DUP-1` → **201 allowed** (dedup is
per-org, `orgId` from token). Two projects with **null** caseNumber for org A → both 201 (partial index
`WHERE case_number IS NOT NULL` lets nulls coexist). Matches §5.5.

### 8. CTO-flagged gaps — confirmed real, recorded (not re-litigated)

- **Timing-observable login (account enumeration):** unknown email avg **4.6 ms** (skips argon2id) vs
  valid-email/wrong-password avg **39.2 ms** (runs argon2id) — ~8.5×. Response *bodies* are byte-identical
  (verified M1), but the timing side-channel enables account enumeration. CTO-disclosed; recorded as a
  known security note (see ledger), not a new blocking find for ATL-022.
- **No checksum in `schema_migrations`:** columns are `filename` + `applied_at` only — a silently
  edited already-applied migration file would not be detected. CTO-disclosed known gap.
- **CI has no Postgres service / no `DATABASE_URL_TEST`:** `.github/workflows/ci.yml` contains no
  postgres service, so the 9 pg-integration tests **never run in CI** (skipped, green-by-absence). Stays
  with **ATL-024**.

### AC-1 recommendation & verdict

- **ATL-003 AC-1 (persistence with migrations): PARTIAL → MET.** Migrations execute against a real
  Postgres; pg repositories + pg user store are the **default** wiring when `DATABASE_URL` is set;
  org-scoped queries are token-derived; data survives `kill -9` **and** a Postgres restart, byte-identical.
- **ATL-022: PASS-WITH-KNOWN-ISSUES.** All stated ATL-022 acceptance criteria (workboard) are
  independently verified and MET; zero S1 — no wrong financial numbers (above-2^53 rejected loudly),
  no cross-tenant leak, no data loss, live two-org isolation proven. **One S2 (QA-M1-4):** the pg pool
  lacks an error handler, so any DB connection reset (stop, failover, idle-timeout, single-backend kill)
  crashes the whole API and defeats the `/readyz` graceful-degradation design. This is outside ATL-022's
  written ACs but is a real production availability defect surfaced by plan item 5.
- **Workboard recommendation:** promote ATL-022's coded ACs (and ATL-003 AC-1 → MET) on this evidence,
  but ATL-022 **may not count toward "M1 complete / pilot-ready" (DL-015)** until **QA-M1-4 is fixed by
  atlas-cto and independently re-verified** (CLAUDE.md rule 2 — no fix-and-approve in one cycle). The
  delivery commit is still a `wip … UNVERIFIED` checkpoint; a clean delivery commit + handoff entry are
  also required. QA-M1-3 → **CLOSED**; QA-M1-2 remains OPEN under ATL-023 (web `roiOnCost` nullability,
  untouched by ATL-022).

## Open Defects Ledger (single source of status)

Consolidated 2026-07-23 (ATL-018). **This table is the one authoritative status list for QA-filed
defects and residual notes.** The per-section defect tables above remain as historical record of
filing; status changes are made HERE only. QA-M0-5 excluded (explicitly "not a defect"; recorded
note only).

| ID | Sev | Defect (short) | Owner | Fixed by | Status |
|---|---|---|---|---|---|
| QA-M0-1 | S3 | ATL-007/009 delivery handoff missing from HANDOFFS.md | atlas-ceo | Retroactive handoff filed by CEO (HANDOFFS.md, "to remedy QA defect QA-M0-1") | **CLOSED** 2026-07-21 |
| QA-M0-2 | S3 | CI secrets-scan job is decorative exit-0 (green with zero scanning) | human owner (escalated, DL-009) | GITLEAKS_LICENSE / alternative-scanner ruling | **OPEN — escalated**, blocks any release gate relying on that job |
| QA-M0-3 | S4 | First remote CI run never observed; gates ATL-007 + ATL-003 AC-4 "verified" | atlas-cto | ATL-024 | **OPEN** |
| QA-M0-4 | S4 | No `prettier --check` in CI; formatting drift cannot fail CI | atlas-cto | ATL-024 | **OPEN** |
| QA-S1-1 | S3 | Dashboard freshness gate false-positives on shallow CI clone | atlas-cto | Fix bc52714; QA re-verification RV-1..RV-9 | **CLOSED** 2026-07-21 (CONFIRMED-FIXED) |
| QA-S1-2 | S4 | Commit e3f7e6d message claims "coordination updates" it does not contain | atlas-cto | None possible (history not rewritten, CLAUDE.md rule 8) | **CLOSED — accepted as recorded history note** |
| QA-S1-3 | S4 | CODEBASE_AUDIT.md C-1/T-6 cite ROIScreen.jsx:61; actual line 62 | atlas-cto | Optional doc correction, backlog | **OPEN — backlog** |
| QA-M1-1 | S3 | Web non-demo form→ScenarioCreate mapping unimplemented; live non-demo core loop cannot POST a valid scenario | atlas-cto | ATL-023 | **OPEN** — blocks any pilot on real data |
| QA-M1-2 | S4 | Web mirror types `roiOnCost` as `number`, shared contract is `number \| null` | atlas-cto | ATL-023 | **OPEN** |
| QA-M1-3 | S4 | Default seed is single-org — live cross-tenant probe impossible; isolation proven only via committed tests | atlas-cto | ATL-022 (two-org seed / real multi-org store) | **CLOSED** 2026-07-23 — ATL-022 ships a two-org seed; QA ran live cross-org probes at HEAD 08cd493 (org B → A: list `[]`, GET/PATCH/DELETE/scenarios all 404, zero leak, no existence oracle, forged orgId ignored). See ATL-022 Verification Results §3 |
| QA-M1-4 | S2 | pg pool has no `pool.on('error')` handler → any Postgres connection reset (stop, restart, failover, `idle_session_timeout`, single-backend `pg_terminate_backend`) crashes the whole API via an unhandled `'error'` event (SQLSTATE 57P01). The `/readyz` 503 branch never fires (process dies first); no self-recovery — manual restart required. Data durability intact; service availability is not. Contradicts `infra/environments/dev/README.md` "data survives restarts". No workaround. | atlas-cto | — (ATL-022 follow-up; fix + independent re-verify before pilot go-live) | **OPEN** — reliability; blocks pilot-ready (DL-015) |
| QA-M1-5 | S3 | Login timing side-channel: unknown email ~4.6 ms (skips argon2id) vs valid-email/wrong-password ~39 ms (~8.5×); bodies identical but timing enables account enumeration. CTO-disclosed; recorded per ATL-022 item 8. | atlas-cto | — (constant-time verify / dummy-hash on unknown email) | **OPEN — recorded** |
| RN-1 | S4 | Shallow-clone fallback passes a docs commit that changes no parsed value (enforced CI path is full-clone, where it fails) | atlas-cto | Accepted with note | **ACCEPTED** |
| RN-2 | S4 | "Last source commit" label semantically means "last docs/** commit" | atlas-cto | Cosmetic; fix opportunistically | **ACCEPTED** |
| RN-3 | note | Committed dashboard stale at M1 tip until `pnpm dashboard` runs with the M1 train; repaired gate will correctly fail the first remote run otherwise | atlas-cto | ATL-024 (regeneration with the train) | **OPEN** (tracked under ATL-024) |
