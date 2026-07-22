# Atlas — Founder Status Report

> **Snapshot 2026-07-21 — point-in-time document.** Live state is always
> [FOUNDER_DASHBOARD.md](../../FOUNDER_DASHBOARD.md) (generated — regenerate with `pnpm dashboard`,
> never hand-edit the dashboard). This report is written by atlas-ceo at the M1 delivery-cycle
> consolidation and is not auto-updated.

---

## 1. Current product stage

**M1 walking-skeleton slice VERIFIED (2026-07-21, DL-015).** Atlas is no longer documents — it is a
running system: a demo-clickable Hebrew RTL web app plus a **live, independently verified
API → analytics-engine chain** (login → create project → create scenario → run simulation → correct
numbers back).

Delivered as ATL-003, three work packages + integration pass (commits 8c37779…f1fc530):

- **ENGINE** — Decimal financial engine (IRR/NPV/payback/sensitivity), 9 analytic golden fixtures,
  FastAPI `/v1/simulate`; 39 pytest green.
- **SHARED+API** — `@atlas/shared` (taba mapping, integer-agorot money, zod schemas, i18n keys);
  Fastify API with JWT + argon2id auth, roles, fail-closed routes, org-scoped repositories
  (in-memory default + Postgres stubs + `0001_init.sql` migration), no-fallback analytics client;
  53 TS tests green.
- **WEB** — RTL Hebrew SaaS app: 11 UI primitives, 5 pages, demo mode (default, synthetic data),
  accessibility; 31 tests green.
- **INTEGRATION** — engine + web aligned to the shared contract; live e2e smoke executed and
  hand-verified by QA.

M0 (toolchain/foundation) remains done-pending-remote-CI-observation.

## 2. Current production score

- **M0: 8/10** (QA, ATL-010) — toolchain green in 48s vs the 10-minute gate; residuals: remote CI
  unobserved (QA-M0-3), decorative secrets-scan (QA-M0-2 → Founder, DL-009).
- **M1 pilot-readiness: 6/10** (QA, ATL-003 verdict). QA's reasoning, quoted:

  > "The financial engine and the API/auth/analytics contract are trustworthy and independently
  > verified — the hard part is done and honest. The remaining 4 points are the unbuilt
  > pilot-critical remainder: durable persistence (data currently lost on restart), the live web
  > core loop in non-demo mode, and a first green remote CI run. Not a launch candidate yet; a
  > solid, verified walking skeleton."

  Verdict: **PASS-WITH-KNOWN-ISSUES → VERIFIED slice-scoped.** Zero S1/S2 defects, **zero wrong
  financial numbers** — every displayed figure in the live smoke matched QA's independent
  arithmetic to the agora.

## 3. Current risks (top of register)

- **R-02 (silent numeric regressions in the ported engine) — mitigated in part.** What changed: the
  9 golden fixtures are now committed and green, and QA independently re-derived 3 of 9 from
  closed-form algebra (exact rationals, no Atlas code) — all MATCH — plus hand-verified every live
  smoke figure. The engine's numbers are no longer trusted on the implementer's word. Residual: the
  Excel reconciliation gate vs a real customer spreadsheet (<1% divergence, ATL-014/M2) has not run
  yet.
- **R-04 (real customer taba files too messy for import) — open, High/High.** Untouched by M1; the
  week-0 dry-run runbook (ATL-013) is the mitigation and is still READY, not started.
- **R-09 (decorative secrets-scan gives false security confidence) — open.** Blocked on the Founder
  GITLEAKS_LICENSE decision (DL-009); until then, secrets hygiene is convention-only.
- **R-06 (pilot customer data mishandled) — open, High severity / Low probability.** No customer
  data exists in the system yet (demo data is synthetic); becomes acute at pilot start. Note: with
  in-memory persistence, no real data may touch this build anyway.

## 4. Current blockers

**Founder decisions pending (nothing else can move these):**
1. **ATL-008 / DL-010** — archive deletion ruling: 21 root archives = 4 unique payloads, all
   already in git history; proposal is delete-all; awaiting written approval.
2. **DL-009 — GITLEAKS_LICENSE** (or alternative scanner): the CI secrets-scan job passes
   unconditionally until this is decided (spending decision).
3. **ATL-001 sign-off** — Sprint-1 plan is complete and awaiting Founder acknowledgement.

**Technical (owned, filed, READY — not waiting on anyone):**
- **ATL-022** — Postgres persistence live (P0), **ATL-023** — web non-demo mapping (P1),
  **ATL-024** — first green remote CI + prettier gate (P1).

## 5. Current sprint (Sprint-1, 2026-07-21 → +1 week)

| Task | Owner | Pri | Status | One line |
|---|---|---|---|---|
| ATL-001 | atlas-ceo | P0 | IMPLEMENTED | Sprint plan complete; Founder sign-off pending |
| ATL-003 | atlas-cto | P0 | **VERIFIED** (slice) | M1 skeleton delivered + QA-verified; pilot-ready claim blocked |
| ATL-003-PLAN | atlas-cto | P0 | CLOSED | Superseded by DL-014 direct green-light |
| ATL-013 | atlas-product | P1 | READY | Week-0 customer data dry-run runbook |
| ATL-014 | atlas-product | P1 | READY | Excel reconciliation worksheet spec (<1% gate) |
| ATL-018 | atlas-qa | P1 | READY | M1 verification plan + DL-008 QA_PLAN annotations |
| ATL-019 | atlas-growth | P1 | READY | Pilot agreement draft text (material prep only) |
| ATL-020 | atlas-cto | P0 | VERIFIED | Codebase audit; QA PASS 6/6 spot-checks |
| ATL-021 | atlas-cto | P0 | **VERIFIED** | Founder Control Center; QA-S1-1 confirmed-fixed |

Post-sprint follow-ups filed: ATL-022 (P0, READY), ATL-023 (P1, READY), ATL-024 (P1, READY).

## 6. Assigned owners

| Task | Owner | Reviewer |
|---|---|---|
| ATL-022 Postgres persistence live | atlas-cto | atlas-qa |
| ATL-023 Web non-demo mapping | atlas-cto | atlas-qa |
| ATL-024 Remote CI green + prettier | atlas-cto | atlas-qa |
| ATL-013 Dry-run runbook | atlas-product | atlas-cto |
| ATL-014 Excel reconciliation spec | atlas-product | atlas-qa |
| ATL-018 M1/M2 verification plan | atlas-qa | atlas-ceo |
| ATL-019 Pilot agreement draft | atlas-growth | atlas-product |
| ATL-005 Full pilot verification | atlas-qa | atlas-ceo |
| ATL-006 Capability matrix | atlas-qa | atlas-growth |
| ATL-008 / GITLEAKS rulings | **Founder** | atlas-ceo (execution routing) |

## 7. Pilot readiness — honest assessment

**Atlas is NOT pilot-ready.** QA scores M1 at 6/10 and has explicitly blocked any "pilot-ready"
claim (DL-015). What stands between here and a pilot, per the QA verdict and the
TECHNICAL_READINESS.md go/no-go checklist (every item blocking):

1. **Durable persistence** — data currently dies with the process; migrations exist but have never
   executed; pg repositories are stubs (ATL-022). This is the last P0-fatal gap of the original four.
2. **Live web core loop in non-demo mode** — the form cannot yet POST a valid scenario to the real
   API (QA-M1-1 → ATL-023). Today's app is demo-clickable, not customer-usable.
3. **A first observed green remote CI run** (ATL-024) — all gates are green locally only.
4. Then the unstarted go/no-go items: backups + restore drill, HTTPS/secrets audit, import path
   proven on real customer files, Excel cross-check sign-off, staging environment, runbook, signed
   DPA. These are M2/M3 scope and mostly untouched.

What IS true and provable: the numbers Atlas produces are correct (independently verified to the
agora), auth denies what it should deny, and the analytics engine never fabricates a fallback
number. The trust core is real; the durability and workflow around it are not built yet.

## 8. Top 10 priorities (ordered)

1. **ATL-022** — Postgres persistence live (P0; last P0-fatal readiness gap).
2. **ATL-023** — web non-demo mapping + accessToken flow (makes the app customer-usable).
3. **ATL-024** — first green remote CI + prettier gate (closes AC-4, QA-M0-3/4).
4. **ATL-013** — week-0 data dry-run runbook (R-04, the highest open product risk).
5. **ATL-014** — Excel reconciliation worksheet spec (R-02 residual; M2 gate).
6. **ATL-018** — M1/M2 verification plan + DL-008 annotations (QA readiness for the above).
7. **ATL-019** — pilot agreement draft text (Founder review material; no external use).
8. **ATL-005 prep** — full 11-scenario pilot verification, staged to run as ATL-022/023/024 land.
9. **Founder rulings** — ATL-008 archives (DL-010) + GITLEAKS_LICENSE (DL-009) + ATL-001 sign-off.
10. **ATL-006** — verified capability matrix (unblocks all external claims by Growth).

## 9. Recommended next implementation task

**ATL-022 — Postgres persistence live.** It is the last P0-fatal gap from TECHNICAL_READINESS.md
still open (persistence; auth, single-API are MET; CI is an observation away). Everything
pilot-shaped — real data dry-runs, UAT, the full QA scenario suite, any customer touch — is
meaningless while data does not survive a restart. The schema and migration are already written and
QA-reviewed as well-formed; ATL-022 is execution, not design. Owner atlas-cto, reviewer atlas-qa,
status READY on the workboard.
