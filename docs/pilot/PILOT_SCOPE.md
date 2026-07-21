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
