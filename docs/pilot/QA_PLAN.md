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
