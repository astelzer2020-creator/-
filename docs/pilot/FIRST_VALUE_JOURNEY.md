# Atlas — First-Value Journey (ATL-002)

**Owner:** Head of Product (atlas-product) · **Reviewer:** atlas-ceo · **Status:** delivered for review
**Last updated:** 2026-07-21
**Definition of first value:** *"raw project data → trusted Hebrew feasibility PDF in under 30 minutes"*
(PILOT_SCOPE.md §5). "Trusted" means reconciled to the customer's own Excel within 1% (PILOT_SCOPE.md §6).

Related: [PILOT_SCOPE.md](PILOT_SCOPE.md) (scope + M2 acceptance criteria §9),
[PILOT_ONBOARDING.md](PILOT_ONBOARDING.md) (Growth-owned cadence), [QA_PLAN.md](QA_PLAN.md)
(verification suite), [../ROADMAP.md](../ROADMAP.md) (M1/M2 items).

---

## 1. Step-by-step map: raw data → trusted Hebrew PDF (<30 min)

The first-value path has a **pre-gate** (step 0, human, done once before kickoff) and an
**in-product path** (steps 1–8, repeated per project). The <30 min clock covers steps 1–8 only;
the week-0 gate exists precisely so the clock is never burned on data surprises (risk R-04).

| # | Step | Owner | Time budget | Notes |
|---|------|-------|-------------|-------|
| 0 | **Week-0 data dry-run (GATE)** — obtain 1–2 real taba CSV/XLSX exports + the customer's Excel model; run the import internally; verify cp1255 handling and column mapping (מספר תיק, יח"ד קיים/מוצע…). Kickoff does not get scheduled until this passes. | Human process — Growth lead runs the relationship; atlas-cto runs the technical dry-run (see GAP-3) | Pre-kickoff, not on the clock | PILOT_ONBOARDING.md §4 week 0; mitigates R-04 ("data too messy to import") |
| 1 | **Log in** — champion opens Atlas with a pre-provisioned account (email+password, JWT session) | Product feature — **M1 "Auth: email+password login, JWT sessions, roles"**; account creation itself is a human process today (see GAP-2) | 2 min | First-login timestamp starts the time-to-first-simulation clock |
| 2 | **Import the taba file** — upload CSV/XLSX (cp1255-safe), see column-mapping preview, confirm | Product feature — **M2 "Taba/PIO import: CSV/XLSX (Windows-1255) with column mapping, validation report, dedup by מספר תיק"** | 5 min | AC-IMP-1…5 in PILOT_SCOPE.md §9 |
| 3 | **Review import summary** — row count, per-row errors in Hebrew, duplicates flagged; fix or accept | Product feature — **M2 import validation report** (same roadmap item) + human champion decides on flagged rows | 3 min | QA_PLAN.md §5 robustness cases |
| 4 | **Configure a scenario** — existing vs. proposed units, apartment mix, עלות בנייה, מחיר מכירה, timeline | Product feature — **M2 "Scenario builder: apartment mix, costs, prices"** | 8 min | Longest step; Hebrew field labels and validation are acceptance criteria (AC-SCN) |
| 5 | **Run simulation** — IRR, NPV, payback + sensitivity table | Product feature — **M1 analytics engine (IRR/NPV/payback with golden-file tests)** surfaced through **M2 "full ROI results (IRR, NPV, payback, sensitivity)"** | 1 min (results ≤10 s per QA_PLAN.md §2.5) | AC-RES |
| 6 | **Compare two scenarios side by side** | Product feature — PILOT_SCOPE.md §4 **Must** "Scenario compare". ⚠ Not named explicitly in any ROADMAP M2 bullet — see INCONSISTENCY-4 | 3 min | AC-SCN-3 |
| 7 | **Export the Hebrew executive-summary PDF** (and XLSX when needed) | Product feature — **M2 "Report export: executive summary + cashflow (PDF, XLSX) with correct RTL rendering"** | 2 min | AC-EXP |
| 8 | **Trust check** — numbers reconciled against the customer's own Excel; discrepancies resolved and explained | Human process — champion + atlas-product in the week-2 working session, with atlas-cto on call for engine discrepancies; backed by golden-fixture tests (`services/analytics/tests/golden/`) | Buffer 6 min in-session; full reconciliation is the week-2 milestone, not on the 30-min clock | AC-RES-4; the "trusted" in first value is earned here, not in step 7 |

**Total in-product budget: 30 min** (2+5+3+8+1+3+2+6). ⚠ These per-step budgets are design targets,
not measurements — verified as a whole via AC-E2E-1 (PILOT_SCOPE.md §9).

**ASSUMPTION A1:** a champion (analyst persona) can complete steps 2–7 unassisted by week 3 with at
most one prompt. *Cheapest test:* the week-3 self-import session already in PILOT_ONBOARDING.md §4 is
the real test; pre-validate earlier with one 30-min hallway usability run on the synthetic sample file
with a Hebrew-speaking non-team-member.

**ASSUMPTION A2:** <30 minutes is the threshold at which the customer perceives a step-change vs.
Excel (where one iteration "costs days"). *Cheapest test:* in each pilot-candidate qualification call,
ask "how long did your last feasibility iteration take, wall-clock, and who touched it?" — 3 data
points before kickoff.

**ASSUMPTION A3:** the Hebrew PDF is the artifact actually forwarded to banks/partners (our virality
mechanism). *Cheapest test:* week-5 live-decision milestone — ask the champion to forward one Atlas PDF
to one real external party and report the reaction verbatim.

**ASSUMPTION A4:** the customer's taba export matches the standard 17-Hebrew-column shape our fixtures
model. *Cheapest test:* the week-0 dry-run gate itself — this is why it is a gate.

## 2. Week-by-week alignment with PILOT_ONBOARDING.md

PILOT_ONBOARDING.md §4 is Growth-owned; this section validates the first-value journey against it and
**flags** divergences instead of editing it.

| Week | PILOT_ONBOARDING.md milestone | First-value journey view | Aligned? |
|------|------------------------------|--------------------------|----------|
| 0 | Data audit / import dry-run | Step 0 gate. Journey adds: dry-run needs a written runbook + named owner (GAP-3), because M2 import UI may not be the tool used for the internal dry-run | ✔ aligned; gap filed |
| 1 | Kickoff, accounts created, project #1 imported live | Steps 1–3 performed live; first "wow". ⚠ Onboarding scripts the wow as "their real project **on the map**" — the Leaflet map is a **Should** in PILOT_SCOPE.md §4. See INCONSISTENCY-3 | ✔ with flag |
| 2 | First simulation + Excel reconciliation | Steps 4–8 end-to-end; step 8 (trust check) is this week's exit. Reconciliation protocol needs a worksheet template (GAP-4) so "reconcile every discrepancy" is repeatable, not ad hoc | ✔ aligned; gap filed |
| 3 | Champion imports projects 2–3 unassisted | Repeats steps 1–7 without us; validates ASSUMPTION A1; friction log feeds triage (PILOT_SCOPE.md §7) | ✔ |
| 4 | Mid-pilot checkpoint with sponsor, usage stats shown | Requires activation metrics to be reportable by week 4 → instrumentation must ship with M2 features, not after (see §4 and GAP-1) | ✔ conditional on GAP-1 |
| 5 | Real decision workflow, PDF/XLSX in a live setting | Steps 5–7 on a live deal; tests ASSUMPTION A3 | ✔ |
| 6 | Review #2 + pricing interviews; second reconciliation pass | Step 8 repeated on newer projects — numeric-trust metric (3 projects within 1%) should be closable here | ✔ |
| 7 | Conversion conversation | Consumes journey evidence: activation, usage, trust metrics. Product supplies the metric readout; Growth runs the conversation | ✔ |
| 8 | Wrap-up + case study | Exit interviews close the two manual metrics (numeric trust documentation, PMF-style survey) | ✔ |

### Flagged inconsistencies (not silently changed — owners named)

- **INCONSISTENCY-1 — GeoJSON:** PILOT_SCOPE.md §4 says GeoJSON import is **Won't** ("no pilot persona
  supplies GeoJSON unprompted"), but ROADMAP.md M2 includes "CSV/XLSX (Windows-1255) / **GeoJSON**"
  and QA_PLAN.md §2.3 tests GeoJSON import. One of these is wrong. Product position: keep the Won't;
  ROADMAP M2 bullet and QA scenario 3 should be descoped for pilot. **Decision needed from atlas-ceo**
  (ROADMAP) with atlas-qa (QA_PLAN edit).
- **INCONSISTENCY-2 — 3D view:** PILOT_SCOPE.md §3/§4 exclude 3D for the pilot, but QA_PLAN.md §2.6
  requires the before/after 3D view in the results verification, and PILOT_ONBOARDING.md §1 positioning
  says Atlas "shows the before/after in 3D". Product position: pilot results view is charts + figures
  only; 3D claims must not appear in pilot-facing materials until QA-verified (also relevant to the
  ATL-004 "planned"-labeling rule). **Owners:** atlas-qa (QA_PLAN §2.6), atlas-growth
  (PILOT_ONBOARDING §1), routed via atlas-ceo.
- **INCONSISTENCY-3 — map as the week-1 wow:** PILOT_ONBOARDING.md week 1 scripts the first wow as the
  project on the map; the Leaflet map is **Should**, not Must (PILOT_SCOPE.md §4). ROADMAP M2 does
  include it, so this is a dependency flag, not a contradiction: if the map slips, the scripted wow
  falls back to the Hebrew-correct import preview + first simulation. **Owner:** atlas-growth to add
  the fallback line; no scope change requested.
- **INCONSISTENCY-4 — scenario compare not named in ROADMAP M2:** PILOT_SCOPE.md §4 makes scenario
  compare a **Must** and §5 step 4 depends on it, but no ROADMAP M2 bullet names it (it is at best
  implied by "Scenario builder"). Covered by acceptance criterion AC-SCN-3 (PILOT_SCOPE.md §9);
  **atlas-ceo** should make it explicit when decomposing M2 into workboard tasks so it cannot be
  silently dropped.

## 3. GAPS — proposed workboard tasks (for atlas-ceo to file; not self-added)

| Proposed ID | Title | Proposed owner / reviewer | Why (journey step) |
|---|---|---|---|
| ATL-011 | Activation instrumentation: core-loop events + funnel | atlas-cto / atlas-qa | Steps 1–7; week-4 checkpoint needs usage stats |
| ATL-012 | Pilot account provisioning runbook + admin tooling | atlas-cto / atlas-product | Step 1; kickoff "create accounts live" |
| ATL-013 | Week-0 data dry-run runbook + column-mapping checklist | atlas-product / atlas-cto | Step 0 gate |
| ATL-014 | Excel reconciliation worksheet + session protocol | atlas-product / atlas-qa | Step 8; week-2 and week-6 milestones |
| ATL-015 | Hebrew product copy pack: onboarding, empty states, import errors | atlas-product / atlas-growth | Steps 2–7; every user-facing string |

**ATL-011 — Activation instrumentation (PROPOSAL for atlas-cto).**
Outcome: pilot team can read the activation funnel every Monday without asking engineering.
Justification: PILOT_SCOPE.md §6 metrics and §7 Monday review are unmeasurable without events; the
week-4 sponsor checkpoint shows usage stats.
Acceptance criteria: (1) Given a user completes login / import / scenario-save / simulation-run /
report-export, When the action succeeds, Then an event with user id, project id, and timestamp is
recorded server-side; (2) Given events exist, When the weekly funnel query is run, Then it yields
per-user activation status, median time-to-first-simulation, and sessions/user/week as defined in
PILOT_SCOPE.md §6; (3) Given a pilot user has no login event for 5 days, When the daily check runs,
Then an internal alert fires (PILOT_ONBOARDING.md §7 signal); (4) no PII beyond user id in events.

**ATL-012 — Account provisioning (PROPOSAL for atlas-cto).**
Outcome: 2–4 pilot users have working accounts before kickoff minute one.
Acceptance criteria: (1) Given a name+email list, When the provisioning procedure is run, Then
accounts exist with the analyst role and forced password set on first login; (2) Given the runbook,
When a non-author follows it on staging, Then accounts are created in <10 min with no code edits.

**ATL-013 — Week-0 dry-run runbook (self-assigned proposal, atlas-product owner).**
Outcome: the week-0 gate is a repeatable checklist, not tribal knowledge.
Acceptance criteria: (1) Given a candidate's sample files, When the runbook is followed, Then it
produces a written pass/fail verdict covering encoding (QA_PLAN.md §4 E1–E7 cases as applicable),
required columns present, and row-level anomalies; (2) Given a fail, Then the runbook names the
remediation path (custom mapping budget / white-glove import / polite disqualification, per
PILOT_ONBOARDING.md §7).

**ATL-014 — Reconciliation worksheet (self-assigned proposal, atlas-product owner).**
Outcome: "within 1% on 3 projects" is documented evidence, not a recollection.
Acceptance criteria: (1) Given a joint session, When Atlas and customer-Excel values are entered for
IRR, NPV, and payback, Then the worksheet computes per-metric deltas and flags any |delta| > 1%
(threshold source: PILOT_SCOPE.md §6 numeric-trust metric); (2) every flagged delta gets a written
resolution (our bug / their formula / definitional difference) before the session closes.

**ATL-015 — Hebrew copy pack (self-assigned proposal, atlas-product owner).**
Outcome: no English placeholder or mojibake string anywhere on the first-value path.
Acceptance criteria: (1) Given the steps 1–7 screens, When walked in `dir="rtl"`, Then every
user-facing string comes from an i18n key (docs/CODING_STANDARDS.md) with reviewed Hebrew copy;
(2) import error messages match the Hebrew per-row report requirement (QA_PLAN.md §5.1).

## 4. ACTIVATION METRICS — instrumented, ticketed, or manual

Per PILOT_SCOPE.md §6. Instrumentation asks are **PROPOSALS for atlas-cto** (route via ATL-011); the
open question from the ATL-002 handoff ("M1 vs. M2 instrumentation") is answered per-metric below and
needs CTO confirmation once ATL-007 lands.

| Metric (PILOT_SCOPE.md §6) | M1 | M2 | Manual during pilot |
|---|---|---|---|
| Activation (full core workflow, real project, week 1) | Partial: login + simulation-run events possible once M1 auth + request logging exist | **Instrument in M2** — funnel needs import and export events, which only exist as M2 features | Fallback: weekly session log (product) if events slip |
| Time-to-first-simulation (<30 min, median) | **Instrumentable in M1**: first-login timestamp → first simulation-run timestamp (both M1 surfaces) | Refined in M2 (real import replaces hard-coded simulation) | No |
| Weekly active usage (≥2 sessions/user/week) | No — session definition includes report export | **Instrument in M2**; reviewed manually each Monday per PILOT_SCOPE.md §7 | Review is manual; data is instrumented |
| Real projects loaded (≥5/account) | No | **M2** — direct DB count of imported projects (a SQL query in the Monday review is acceptable; no UI needed) | Query run manually is fine |
| Reports exported & shared externally (≥3) | No | Export **events** in M2 | "Shared externally" is inherently manual — self-report captured in the weekly check-in (human process, Growth-run per PILOT_ONBOARDING.md §4) |
| Numeric trust (≤1% on 3 projects) | No | No | **Manual only** — week-2/-6 joint sessions, documented via ATL-014 worksheet |
| Qualitative (unprompted "would stop using Excel"; PMF survey) | No | No | **Manual only** — exit interviews, week-8 (Growth + Product) |

**ASSUMPTION A5:** WhatsApp is the customer's preferred friction-report channel (PILOT_ONBOARDING.md
assumes it). *Cheapest test:* one question at kickoff; fall back to whatever they already use daily.

---

*Change control: this document is atlas-product-owned. Scope changes here must be reflected in
PILOT_SCOPE.md in the same change; conflicts with ROADMAP.md escalate to atlas-ceo.*
