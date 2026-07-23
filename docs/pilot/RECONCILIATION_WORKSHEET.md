# Excel Reconciliation Worksheet — Spec & Session Protocol (ATL-014)

**Owner:** atlas-product · **Reviewer:** atlas-qa · **Approver:** atlas-ceo · **Status:** delivered for review
**Last updated:** 2026-07-23
**Gate it implements:** the **numeric-trust metric** — "reconciliation to customer model within 1% on 3
projects, joint working session, documented" (PILOT_SCOPE.md §6) — executed as acceptance criterion
**AC-RES-4** (PILOT_SCOPE.md §9) in the week-2 and week-6 sessions (PILOT_ONBOARDING.md §4).

This document is the **spec and template**. Each session instantiates it as a real spreadsheet that
lives **with the pilot's private records, outside the repo** — a filled worksheet contains customer data
and never enters git (SECURITY.md; TESTING_STRATEGY rule 4). Only sanitized summaries (§8) enter the
workboard as evidence.

---

## 1. Purpose

"Trusted" in the first-value definition ("raw data → **trusted** Hebrew feasibility report") is earned
here, not in the export button (FIRST_VALUE_JOURNEY.md §1 step 8). The worksheet turns "the numbers
match" from a recollection into a row-by-row, signed record — and turns "the numbers don't match" into
an S1 (DL-006) or an honestly documented model difference, never a shrug.

## 2. Worksheet structure

One worksheet per project per session. Four sections.

### Section A — Metadata (operator fills before the session)

Project name + מספר תיק · session date + week (2 or 6) · attendees · Atlas build/commit under test ·
customer Excel file name + version/date (their identifier — we do not hash or retain their model file
beyond the pilot data store) · period basis agreed (see ASSUMPTION R1).

### Section B — Headline metrics (one row per metric)

Rows: **IRR · NPV · Profit (רווח יזמי) · ROI-on-cost · Payback**.

### Section C — Line items (one row per cost/revenue line)

Rows: **Total revenue (סה"כ הכנסות)** · one row per Atlas cost item (construction, tenant costs, etc.,
as configured in the scenario) · one row per **customer-Excel line item that has no Atlas counterpart**
(these are the definitional-gap candidates — pre-listed from the week-0 C8 review,
DRY_RUN_RUNBOOK.md §5).

### Section D — Verdict (joint, before the session closes)

Per-project gate result (§6), open items with owners and dates, signatures (champion + Atlas pilot lead).

### Columns (Sections B and C) — who fills what

| Column (Hebrew header on the customer-facing sheet) | Filled by | When |
|---|---|---|
| פריט — line item | Atlas (operator) | Pre-session |
| ערך אטלס — Atlas value | **Atlas** — copied from the results screen / exported PDF of the build under test | Pre-session |
| מקור באטלס — Atlas source ref (screen/PDF page) | Atlas | Pre-session |
| ערך האקסל — customer Excel value | **Customer** (champion/finance person, from their open workbook) | Live in session |
| תא באקסל — Excel cell ref | Customer | Live in session |
| סטייה — divergence (per §3 formula) | Computed live (sheet formula) | Live |
| סיווג — outcome class (§3.3) | Joint | Live, before close |
| הערת יישוב — resolution note | Joint | Live, **mandatory for every non-MATCH row before close** |

Units: **whole shekels (₪)** — Atlas engine values are integer agorot; divide by 100 and round half-even
(display policy per QA_PLAN.md §3). IRR in percent to 0.1 pp. The customer's values are entered exactly
as their sheet shows them, at their precision — never "helped."

## 3. Divergence formula, tolerance tiers, outcome classes

### 3.1 Divergence formula (per row)

- **₪ amounts** (NPV, profit, revenue, cost lines) and **ratios** (ROI-on-cost) and **payback**:
  `div% = |Atlas − Excel| / |Excel| × 100`
- **IRR:** compared in **percentage points**: `Δpp = |IRR_Atlas − IRR_Excel|` (relative division on rates
  is unstable near zero).
- **Near-zero ₪ rule:** when `|Excel| < ₪1,000`, relative divergence is meaningless — compare absolute
  delta instead; pass if `|Atlas − Excel| ≤ ₪1,000`, and flag the row for discussion regardless.
  (**ASSUMPTION R3** on the ₪1,000 floor, §9.)

### 3.2 Pass thresholds (the <1% gate, PILOT_SCOPE §6)

A row **passes** when:

| Row type | Pass condition |
|---|---|
| ₪ amounts, ROI-on-cost, payback | `div% ≤ 1%` |
| IRR | `Δpp ≤ 0.1 pp` **or** relative ≤ 1% — the 0.1 pp floor comes from QA_PLAN §3's display-rounding policy (IRR compared after rounding to 0.1 pp) |
| Any row | **Display-precision floor:** a delta smaller than half of one unit of the coarser side's displayed precision cannot fail the row (e.g., their sheet shows payback to 0.1 years → deltas ≤ 0.05 y are below observable precision). Recorded as MATCH-PRECISION, never silently as MATCH |

These are *reconciliation* tolerances (customer Excel vs. Atlas). They are deliberately looser than the
engine's internal golden tolerances (1e-9 / 1e-6, QA_PLAN §3) — the engine is held to a far stricter
bar than the reconciliation gate.

### 3.3 Outcome classes (every row gets exactly one)

| Class | Meaning | Counts toward the <1% gate? |
|---|---|---|
| **MATCH** | Within §3.2 threshold | Yes |
| **MATCH-PRECISION** | Outside 1% but below the display-precision floor | Yes, with note |
| **DEFINITIONAL** | The two models compute different things (e.g., their model includes financing interest; the M1 engine models only explicit cost lines). Handled per §3.4 | Only via §3.4 adjusted comparison |
| **CUSTOMER-SIDE** | Traced to an error in the customer's sheet, **acknowledged by the customer in the resolution note** — we never record this class unilaterally | Yes (Atlas was right), with note |
| **ATLAS-DIVERGENCE** | Atlas is wrong, or the gap is unexplained at session close | **No — and triggers S1 routing (§5.3)** |

**Fail-honest default:** any row not resolved before the session closes is classified ATLAS-DIVERGENCE
until proven otherwise. We never park an unexplained gap as "probably definitional."

### 3.4 Definitional-difference protocol (recorded honestly, not papered over)

When the models differ by construction (expected first case: **financing interest** — their Excel
carries it, the M1 engine has no financing model; also candidates: מע"מ treatment, הצמדה/indexation,
agent/marketing fees — pre-scanned in week-0 check C8):

1. **Name and quantify** the definitional item from their sheet (item, ₪ amount, direction, cell ref).
2. Add an **adjusted-comparison row** directly under the raw row: either Excel value with the item
   removed, or Atlas value with the item added manually — one basis, stated in the note.
3. The **adjusted row must pass §3.2**. If it does, the raw row is DEFINITIONAL and the metric counts as
   reconciled **on the adjusted basis — stated explicitly in the verdict** ("profit reconciled excluding
   financing interest, which Atlas does not yet model"). If the adjusted row still fails, the remainder
   is ATLAS-DIVERGENCE.
4. **Both raw and adjusted rows stay in the record** — the raw divergence is never overwritten.
5. Each definitional item is filed to the pilot backlog as **Later** per the PILOT_SCOPE §7 triage rule,
   and the customer is told explicitly "not in pilot" — the honest sentence, not a silent gap.

## 4. Session protocol

### 4.1 Week-2 — first reconciliation (PILOT_ONBOARDING §4)

- **Prep (T-2 days):** operator pre-fills Sections A–C Atlas columns for ≥ 1 fully modeled real project,
  from the results screen and exported PDF of the pilot build (whose golden correctness AC-RES-1 must
  already be QA-verified — we never reconcile an unverified build against a customer). Section C's
  no-Atlas-counterpart rows come from the week-0 C8 scan. Customer is asked to join with their workbook
  open and their finance person present.
- **Attendees:** customer champion + their finance person (QA_PLAN §7 UAT exit criterion names them);
  Atlas — pilot lead (atlas-product process, run live by the human pilot lead) facilitating,
  atlas-cto on call for engine questions.
- **Duration:** 90 min; target ≥ 1 project fully classified, 2 if time allows.
- **Order:** Section C line items first, then Section B metrics — line-item gaps usually *explain*
  metric gaps, so this order converts mystery divergences into traced ones.
- **Close:** every row classified; every non-MATCH row has a written resolution note; Section D signed.
  "Every flagged delta gets a written resolution before the session closes" is a hard rule
  (FIRST_VALUE_JOURNEY §3, ATL-014 criterion 2).

### 4.2 Week-6 — re-run

Same protocol on the cumulative set: ≥ 3 real projects total (newer projects preferred — they were
modeled by the champion unassisted, so this also re-tests trust after self-serve use). Previously
DEFINITIONAL items are re-confirmed as still documented and still communicated. Week-6 close is where
the numeric-trust metric is formally closable (FIRST_VALUE_JOURNEY §2).

### 4.3 Recording and routing

- The completed worksheet (customer data) is stored with the pilot's private records, outside the repo.
- **atlas-qa receives the full record within 1 business day** and independently spot-verifies the Atlas
  column against the running build (implementer ≠ verifier — the operator who pre-filled values does not
  verify them).
- **S1 rule (DL-006):** any row classified ATLAS-DIVERGENCE — including the fail-honest defaults — is a
  **wrong-financial-number S1**: atlas-qa files it same day; release blocked; SLA per QA_PLAN §7
  (first response 2 business hours, fix or rollback within 1 business day). The fix must land with a
  **synthetic regression fixture reproducing the structural trigger with invented values — never the
  customer's numbers** (QA_PLAN §8 regression rule + TESTING_STRATEGY rule 4). The affected rows are
  re-run with the customer in a follow-up mini-session after the fix.
- A **sanitized summary** — per project: rows compared, count per outcome class, gate result, zero
  customer values — is filed as workboard evidence for AC-RES-4 (CLAUDE.md rule 2).

## 5. Gate pass rule

- **Per project PASS:** IRR, NPV, and payback rows each MATCH / MATCH-PRECISION / CUSTOMER-SIDE, or
  DEFINITIONAL with a passing adjusted row; **zero open ATLAS-DIVERGENCE rows**.
- **Numeric-trust metric CLOSED** (PILOT_SCOPE.md §6; feeds the PILOT_SCOPE.md §8 convert criteria):
  ≥ 3 real projects at per-project PASS by week-6 close, with signed Section D records for each.
- A project that fails re-enters after the S1 cycle; it counts toward the 3 only after a clean re-run.

## 6. Synthetic worked example (golden-fixture values — no customer data)

Two synthetic mini-projects. Atlas values are the pinned expected values of the cited golden fixtures
(source (a) per PILOT_SCOPE §9); "customer Excel" values are **invented for illustration** and labeled
as such — they are not customer claims.

### Project SYN-A — Section B metrics

Fixture: `services/analytics/tests/golden/02_geometric_three_period.json`
(cashflows ₪−10,000 / 0 / 0 / +13,310; rate 0 → IRR 10.0% exact, NPV ₪3,310, payback 2.7513 periods).

| פריט | ערך אטלס | ערך האקסל (synthetic) | סטייה | סיווג | הערת יישוב |
|---|---|---|---|---|---|
| IRR | 10.0% | 10.05% | 0.05 pp | MATCH | ≤ 0.1 pp floor (their solver iteration) |
| NPV | ₪3,310 | ₪3,310 | 0.00% | MATCH | — |
| Payback | 2.75 שנים | 2.8 שנים | 1.77% raw | MATCH-PRECISION | Their sheet displays to 0.1 y; delta 0.049 y < 0.05 y floor |

### Project SYN-B — Section C line items + derived metrics

Fixture: `services/analytics/tests/golden/08_scenario_linear_phasing.json`
(revenue ₪30,000; construction ₪20,000; profit ₪10,000; ROI-on-cost 0.5; payback 3.333 periods).
Synthetic customer sheet carries a ₪300 financing-interest line the M1 engine does not model.

| פריט | ערך אטלס | ערך האקסל (synthetic) | סטייה | סיווג | הערת יישוב |
|---|---|---|---|---|---|
| סה"כ הכנסות | ₪30,000 | ₪30,000 | 0.00% | MATCH | — |
| עלות בנייה | ₪20,000 | ₪20,000 | 0.00% | MATCH | — |
| ריבית מימון | — (not modeled) | ₪300 | n/a | DEFINITIONAL | M1 engine has no financing model; filed Later per PILOT_SCOPE §7; customer told "not in pilot" |
| רווח יזמי (raw) | ₪10,000 | ₪9,700 | 3.09% | DEFINITIONAL | Fully traced to the ₪300 financing line |
| רווח יזמי (adjusted: Excel excl. financing) | ₪10,000 | ₪10,000 | 0.00% | MATCH (adjusted basis) | Reconciled **excluding financing interest** — stated in verdict |
| ROI-on-cost (raw) | 0.500 | 0.485 | 3.09% | DEFINITIONAL | Same trace |
| ROI-on-cost (adjusted) | 0.500 | 0.500 | 0.00% | MATCH (adjusted basis) | — |

**S1 illustration (hypothetical):** had SYN-A's NPV read Atlas ₪3,150 vs. Excel ₪3,310 (4.8%) with no
definitional trace found by session close, the row would close as ATLAS-DIVERGENCE → same-day S1 per
DL-006 → release blocked → fix + synthetic regression fixture → follow-up mini-session. That path is the
worksheet working correctly, not failing.

## 7. Assumptions (labeled)

- **ASSUMPTION R1 (period basis):** the customer's Excel computes IRR/NPV on **annual** cashflows
  (Excel `IRR`/`NPV` on yearly columns), matching Atlas's period basis; a monthly-basis model would need
  a basis conversion row before any comparison is meaningful. *Cheapest test:* week-0 check C8
  (DRY_RUN_RUNBOOK.md §5) — locate their IRR formula cell and read its range; zero customer meetings
  consumed.
- **ASSUMPTION R2 (likely definitional gaps):** financing interest is the most common item their models
  carry that M1 does not; מע"מ and הצמדה are next. *Cheapest test:* the same C8 scan — list their cost
  lines against Atlas's cost-item categories before week 2.
- **ASSUMPTION R3 (₪1,000 near-zero floor):** customer sheets round to ₪1,000 or coarser, making ₪1,000
  the sensible near-zero comparison floor. *Cheapest test:* read the displayed precision of their model
  during C8; tighten or loosen the floor in Section A notes for that customer before week 2.
- **ASSUMPTION R4 (session capacity):** 90 minutes suffices for 1–2 projects at ~10–15 rows each.
  *Cheapest test:* the week-2 session itself; if it overruns, week-6 splits into two sessions — protocol
  unchanged.

## 8. Acceptance criteria for this spec (executable by atlas-qa as written)

- **AC-RW-1 (dry-run executability):** Given the §6 fixture values and the synthetic "customer" values,
  When atlas-qa instantiates the worksheet from §2 and applies §3 without consulting the author, Then
  every §6 row reproduces the same divergence figures and outcome classes shown above. Expected-value
  source: golden fixtures 02 and 08 (source (a), PILOT_SCOPE §9).
- **AC-RW-2 (gate determinism):** Given a completed worksheet, When §6 is applied by two people
  independently, Then they reach the same per-project PASS/FAIL.
- **AC-RW-3 (fail-honest default):** Given a row left unclassified at session close in a dry run, When
  §3.3/§4.3 are applied, Then the row lands as ATLAS-DIVERGENCE and produces an S1 filing action — not a
  silent carry-over.
- **AC-RW-4 (data hygiene):** Given a completed real session, When the repo is searched, Then no customer
  value from the worksheet appears in git; the workboard evidence contains only the §4.3 sanitized
  summary.
- **AC-RW-5 (Hebrew-facing):** Given the instantiated customer-facing sheet, Then Section B/C headers are
  the Hebrew headers of §2, laid out RTL, with numbers LTR-embedded (QA_PLAN §4 E8) — Hebrew/RTL
  correctness is a criterion here as on every user-facing artifact.

---

*Change control: atlas-product owns this spec; the tolerance tiers (§3) change only with atlas-qa
agreement (they define a QA gate). Companion: [DRY_RUN_RUNBOOK.md](DRY_RUN_RUNBOOK.md) — its check C8 is
this worksheet's session prep. Threshold source of record: PILOT_SCOPE.md §6; severity source: DL-006.*
