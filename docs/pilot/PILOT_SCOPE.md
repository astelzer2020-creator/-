# Atlas Pilot Scope — First Pilot Definition

**Status:** Approved for execution · **Owner:** Head of Product · **Last updated:** 2026-07-21
**Duration:** 8 weeks from first login · **Target:** 2–3 design partners, one primary

---

## 1. Ideal Pilot Customer Profile

Candidates in the Israeli urban-renewal ecosystem, evaluated on pain intensity, sales cycle, and willingness to pay:

| Profile | Pain fit | Cycle | Verdict |
|---|---|---|---|
| **Small/mid developer (יזם)** running 3–15 pinui-binui / TAMA 38 deals | Lives in Excel; every feasibility iteration (בדיקת כדאיות) costs days and consultant fees | Weeks | **Recommended** |
| Municipality / מנהלת התחדשות עירונית | Real pain, but procurement (מכרזים) and budget cycles kill an 8-week pilot | 12–18 months | Later (land-and-expand via developer references) |
| Appraiser (שמאי מקרקעין) | Uses own methodology for דו"ח אפס / תקן 21; sees us as a threat or a toy until the engine is audited | Months | Later (credibility partner, not buyer) |
| Standalone TAMA 38 / pinui-binui project managers (מנהלי פרויקטים) | Good users, but rarely hold budget; influence, don't sign | Weeks | Include as users inside the developer account |

**Recommendation:** a boutique-to-mid developer (יזם) with an active pinui-binui pipeline, whose VP/analyst runs feasibility in Excel today. One economic buyer (CEO/CFO), 2–4 hands-on users (analyst, project manager). Ideally already evaluating deals weekly — we need natural usage, not staged demos.

## 2. Pilot Goals

1. **Prove the core loop replaces Excel** for early-stage feasibility: import → scenario → IRR/NPV → shareable report.
2. **Validate the numbers earn trust** — outputs reconciled against the customer's own models / שמאי figures on at least 3 real projects.
3. **Establish willingness to pay** — a concrete price conversation anchored on time saved per feasibility run.
4. **Harvest a ranked backlog** from real usage, not speculation.

## 3. Explicit Non-Goals

- No municipality or שמאי sale during the pilot.
- No custom features per pilot account; configuration only.
- No SLA, no SSO, no multi-tenant role hierarchy beyond basic users.
- Not validating the mobile app, and not validating 3D as a decision tool.
- Not attempting full דו"ח אפס / תקן 21 compliance — we produce feasibility, not appraisal.

## 4. Feature Set for Pilot (MoSCoW)

Ruthlessly cut from the prototype. If it doesn't serve the core workflow (§5), it waits.

| Prototype feature | Pilot? | Rationale |
|---|---|---|
| Project CRUD dashboard | **Must** | Entry point; must handle the customer's real portfolio |
| Taba/PIO import — CSV + XLSX (cp1255) | **Must** | Killer wedge: their data in, in minutes, Hebrew-safe |
| Taba/PIO import — GeoJSON | **Won't** | No pilot persona supplies GeoJSON unprompted |
| ROI calculator — IRR, NPV, payback | **Must** | The product. Must reconcile with customer Excel to <1% |
| Sensitivity analysis | **Must** | The #1 question banks/partners ask (מחיר מכירה ±, עלות בנייה ±) |
| Scenario compare (2+ apartment-mix/cost scenarios per project) | **Must** | This is how feasibility decisions are actually made |
| Executive summary report (PDF, Hebrew RTL) | **Must** | The artifact the buyer forwards to bank/partners — our virality |
| Cashflow report | **Should** | High value, ship by week 3 if Musts are stable |
| Leaflet project map | **Should** | Cheap, impressive in portfolio review; not load-bearing |
| 3D before/after view | **Won't** | Demo candy; zero decision value for the יזם persona; costly to productionize |
| Mobile app | **Won't** | Desktop workflow; revisit if field usage is requested unprompted |
| Multi-user roles/permissions | **Won't** | Single shared workspace, basic auth only |

## 5. The One Core Workflow

> **"From raw project data to a bank-ready feasibility summary in under 30 minutes."**

1. **Import or create** a project (upload the customer's CSV/XLSX with Hebrew columns, or manual entry).
2. **Configure a scenario:** existing vs. proposed units, apartment mix, עלות בנייה, מחיר מכירה, timeline.
3. **Simulate:** IRR, NPV, payback + sensitivity table render in seconds.
4. **Compare** at least two scenarios side by side.
5. **Export** the Hebrew executive summary PDF and send it to a real external party (bank, partner, board).

Every design, bug-triage, and cut decision during the pilot is judged against this loop. If a request doesn't shorten or strengthen it, it goes to the post-pilot backlog.

## 6. Success Metrics

| Metric | Target | Definition |
|---|---|---|
| Activation | 100% of seats within week 1 | User completes the full core workflow on a **real** project |
| Time-to-first-simulation | < 30 min from first login | Instrumented; median across users |
| Weekly active usage | ≥ 2 sessions/user/week, weeks 2–8 | Session = at least one simulation run or report export |
| Real projects loaded | ≥ 5 per account | Not sample data |
| Reports exported & shared externally | ≥ 3 during pilot | Self-reported + export events |
| Numeric trust | Reconciliation to customer model within 1% on 3 projects | Joint working session, documented |
| Qualitative | Buyer states unprompted they'd stop using Excel for early feasibility; PMF-style survey ("very disappointed" ≥ from 2 of 3 power users) | Exit interviews |

## 7. Feedback Loop Mechanics

- **Weekly 30-min check-in** with the power user (fixed slot); **bi-weekly 45-min** review with the economic buyer including usage data.
- **Shared WhatsApp/Slack channel** for friction reports; product acknowledges within 1 business day.
- **Instrumentation:** activation funnel, simulation runs, export events reviewed every Monday.
- **Triage rule (weekly):** every item labeled one of —
  - **Blocker** — breaks the core workflow → fixed within the week;
  - **Core** — strengthens the §5 loop → ranked into the next weekly build;
  - **Later** — real but outside pilot scope → post-pilot backlog, customer told explicitly "not in pilot";
  - **No** — conflicts with direction → declined with rationale.
- Week 4: **mid-pilot review** — go/adjust checkpoint against §6 metrics; scope may be cut further, never expanded.

## 8. Exit Criteria

**Convert (pilot → paying customer):**
- ≥ 5 of 7 success metrics hit, including numeric trust and weekly usage;
- The core workflow was used on a live deal decision at least once;
- Buyer signs an annual agreement at the agreed pilot-conversion price (target: within 2 weeks of pilot end) — a "free forever extension" request counts as a soft no.

**Iterate (one more pilot, adjusted):** metrics partially hit, users engaged, but a specific fixable gap (e.g., missing cashflow depth) blocked conversion. Max one iteration cycle before a verdict.

**Kill the direction if:**
- Usage collapses after week 3 despite blockers being fixed (novelty effect, no real pull);
- Users keep exporting to Excel to finish the job — the product is a data-entry front-end, not the system of record;
- Numbers can't earn trust without full שמאי-grade methodology — meaning the real buyer is the appraiser market and this wedge is wrong.

A kill verdict kills the *developer-first wedge*, not necessarily the platform — findings feed a deliberate re-aim (e.g., שמאי tooling or municipal portfolio view) with a new pilot scope document.

## 9. M2 Acceptance Criteria (pilot workflow features)

Added 2026-07-21 under ATL-002. These criteria define "done" for the ROADMAP M2 items that serve the §5
core workflow. They are written to be executed by atlas-qa as-is; where they overlap the QA_PLAN.md §2
scenarios they **reference** them rather than restate them. Expected-value sources for every numeric
criterion: **(a)** golden fixtures in `services/analytics/tests/golden/` with their hand-verified
spreadsheets (QA_PLAN.md §3 — the spreadsheet next to the fixture is the source of truth), **(b)** the
synthetic sample file `data/sample/sample-taba-projects.csv`, **(c)** the pilot customer's own
spreadsheet in the week-2/week-6 reconciliation sessions. Real customer data never enters the repo
(TESTING_STRATEGY rule); customer-sourced expectations live only in reconciliation session records.

Scope note: GeoJSON import and the 3D results view are **out of M2 acceptance scope** per §3–§4 of this
document. QA_PLAN.md scenarios 3 and 6 (their GeoJSON/3D portions) and the ROADMAP M2 GeoJSON mention
conflict with this scope — flagged in FIRST_VALUE_JOURNEY.md (INCONSISTENCY-1/-2) for atlas-ceo
decision; this section deliberately does not test them.

Cross-cutting criterion (applies to every AC below, per CLAUDE.md rule 5-equivalent for product):
**Hebrew/RTL correctness is part of each criterion, not a separate pass** — any user-facing string on
the tested screen must render in Hebrew from i18n keys, laid out RTL, with numbers/dates LTR-embedded
(QA_PLAN.md §4 E8).

### AC-IMP — Taba/PIO import (CSV/XLSX incl. cp1255, column mapping, validation, dedup)

- **AC-IMP-1 (cp1255 CSV):** Given `data/sample/sample-taba-projects.csv` saved as Windows-1255 with
  the standard 17 Hebrew columns, When the user uploads it, Then all Hebrew renders intact (no
  mojibake), the mapping preview shows each Hebrew header mapped to its canonical field (מספר תיק →
  caseNumber, …), and the imported row count equals the file's data-row count. Executes QA_PLAN.md
  §2.1; encoding behavior per QA_PLAN.md §4 E1.
- **AC-IMP-2 (encoding equivalence):** Given the same data as UTF-8 CSV (with and without BOM) and as
  XLSX, When each is uploaded, Then the normalized rows persisted are identical to AC-IMP-1's
  (field-by-field diff is empty). Executes QA_PLAN.md §2.2 and §4 E2–E3.
- **AC-IMP-3 (validation report):** Given a copy of the sample file with 3 seeded defects (one
  non-numeric value in a numeric column, one empty mid-file row, one missing-optional-column cell),
  When uploaded, Then the good rows import, and a per-row Hebrew error report lists exactly the 3
  seeded defects with row numbers and reasons — never a silent partial import. Behavior per QA_PLAN.md
  §5.1–§5.3; seeded-defect fixture committed under `apps/api/test/fixtures/imports/`.
- **AC-IMP-4 (dedup by מספר תיק):** Given a file containing a מספר תיק that already exists in the
  account, When uploaded, Then the user is warned and chooses skip/overwrite, and re-importing the
  identical file creates zero new rows. Executes QA_PLAN.md §2.10 and §5.5.
- **AC-IMP-5 (geresh/gershayim mapping):** Given headers written with ASCII quotes (`יח"ד`) and with
  U+05F4 gershayim, When uploaded, Then both map to the same canonical fields. Per QA_PLAN.md §4 E6.
- **AC-IMP-6 (time budget):** Given a well-formed file of ≤500 rows on staging, When uploaded, Then
  import completes and the summary renders in ≤60 seconds (source of budget: FIRST_VALUE_JOURNEY.md §1
  step-2 allocation of 5 min including human review; QA_PLAN.md §5.4 covers the 50k-row upper bound
  separately).

### AC-SCN — Scenario builder + compare

- **AC-SCN-1 (create & persist):** Given an imported project, When the user sets existing/proposed
  units, apartment mix, עלות בנייה, מחיר מכירה, and timeline, saves, and reloads the page, Then all
  values persist exactly, and validation rejects negative numbers and blank required fields with
  Hebrew messages naming the field. Executes QA_PLAN.md §2.4.
- **AC-SCN-2 (lifecycle):** Given an existing scenario, When it is duplicated, edited, and deleted,
  Then behavior follows QA_PLAN.md §2.9 (confirmation before delete, no orphaned results).
- **AC-SCN-3 (compare — §4 Must):** Given two saved scenarios of one project with computed results,
  When the user opens scenario compare, Then IRR, NPV, and payback for both are shown side by side and
  each figure equals that scenario's own results screen exactly (source: golden fixture values where a
  fixture scenario is used; otherwise internal consistency — compare view vs. results view vs. API
  response must be identical).

### AC-RES — Results (IRR, NPV, payback, sensitivity)

- **AC-RES-1 (golden correctness):** Given a scenario whose inputs replicate a golden fixture from
  `services/analytics/tests/golden/`, When the simulation runs, Then displayed IRR, NPV, and payback
  match the fixture's hand-verified spreadsheet values under the QA_PLAN.md §3 tolerance policy
  (display comparison after rounding: IRR to 0.1 pp, ₪ to whole shekels; never float equality).
  Executes QA_PLAN.md §2.5; the §3 contract test guards API↔engine drift (e.g., percent vs. fraction).
- **AC-RES-2 (edge fixtures surfaced honestly):** Given the no-IRR golden fixture (all-negative
  cashflows) and the negative-NPV fixture, When simulated, Then the UI states in Hebrew that IRR is
  undefined (no fabricated number, no crash) and renders the negative NPV with correct sign and RTL
  number formatting. Expected values: those fixtures' spreadsheets.
- **AC-RES-3 (sensitivity):** Given a golden-fixture scenario, When the sensitivity table renders,
  Then the grid axes are מחיר מכירה ± and עלות בנייה ± as configured, NPV moves monotonically in the
  correct direction along each axis, and the one hand-verified grid cell per fixture (QA_PLAN.md §3)
  matches its spreadsheet value.
- **AC-RES-4 (customer reconciliation — the "trusted" gate):** Given a joint week-2 (and week-6)
  session on ≥3 of the customer's real projects, When Atlas results are compared to the customer's own
  spreadsheet using the ATL-014 reconciliation worksheet (proposed; FIRST_VALUE_JOURNEY.md §3), Then
  each of IRR/NPV/payback agrees within 1% (threshold source: §6 numeric-trust metric) or the
  discrepancy has a written, customer-acknowledged resolution. Expected-value source: the customer's
  spreadsheet — this criterion is executed manually and documented; it cannot be closed from repo
  fixtures alone.
- **AC-RES-5 (latency):** Given a saved scenario, When simulation is triggered on staging, Then
  results render in ≤10 s (source: QA_PLAN.md §2.5).

### AC-EXP — Hebrew report export (PDF + XLSX)

- **AC-EXP-1 (PDF correctness):** Given computed results for a golden-fixture scenario, When the
  executive-summary PDF is exported, Then Hebrew is shaped correctly (RTL, not reversed, embedded font
  — no tofu), mixed Hebrew/Latin lines follow QA_PLAN.md §4 E5/E9, every number in the PDF equals the
  on-screen value (which AC-RES-1 ties to the golden spreadsheet), and the file opens in Adobe Reader
  and Chrome's viewer. Executes QA_PLAN.md §2.7 + §4 E9.
- **AC-EXP-2 (PDF completeness):** Given the same export, Then the PDF contains at minimum: project
  identity (שם + מספר תיק), scenario parameters (mix, costs, prices, timeline), IRR/NPV/payback, the
  sensitivity table, and an export date — the §5 definition of a bank-forwardable artifact. (Content
  list is the product spec; values' source remains the golden fixture.)
- **AC-EXP-3 (XLSX):** Given computed results, When XLSX is exported, Then numeric cells are numbers
  (not text), sheet direction is RTL, Hebrew headers are intact in Excel 365 and LibreOffice, and
  totals recompute in-sheet to the exported values. Executes QA_PLAN.md §2.8 + §4 E10.
- **AC-EXP-4 (cashflow — §4 Should):** If the cashflow report ships in the pilot window, its PDF/XLSX
  outputs meet AC-EXP-1/-3 verbatim, with per-period rows matching the golden fixture's cashflow
  schedule. If it does not ship by week 3, it moves to the post-pilot backlog per §4 — this criterion
  then reads "not shipped, not claimed" (relevant to the ATL-004/ATL-006 claims rule).

### AC-E2E — The <30-minute gate (M2 exit)

- **AC-E2E-1:** Given a fresh analyst-role account on staging and the week-0-validated file format
  (synthetic stand-in: the AC-IMP-1 cp1255 file), When atlas-qa performs login → import → scenario →
  simulate → compare two scenarios → export PDF following FIRST_VALUE_JOURNEY.md §1 without developer
  assistance, Then wall-clock time from login to a saved PDF is ≤30 minutes, zero manual interventions
  (matching the ROADMAP M2 exit gate), and the produced PDF passes AC-EXP-1/-2. Numeric values in the
  run: golden fixture inputs, so outputs are checkable against source (a).
- **AC-E2E-2 (auth boundary carried into the workflow):** Given two accounts, When user B requests
  user A's project, scenario, results, or export artifact by id/URL, Then access is denied with no
  data leakage. Executes QA_PLAN.md §2.11 across all four M2 surfaces.

**Verification protocol:** atlas-qa executes these independently (implementer ≠ verifier); any failed
numeric criterion is S1 per QA_PLAN.md §1. Golden-fixture changes require written justification in the
same PR (TESTING_STRATEGY rule). AC-RES-4 evidence is the documented reconciliation record, filed with
the workboard entry.
