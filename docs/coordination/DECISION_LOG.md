# Atlas — Decision Log (live)

Append-only. Structural/architectural decisions also get a full ADR in `docs/adr/`; this log records
that they were made, plus operational decisions too small for an ADR.

| ID | Date | Decision | Reason | Alternatives | Risk | Owner | Revisit condition |
|---|---|---|---|---|---|---|---|
| DL-001 | 2026-07-21 | Adopt production structure + strategies per ADR-0001…0008 (monorepo, TS/Fastify, internal Python analytics, Postgres+PostGIS, Compose deploy, golden-file testing, frozen prototype, no binaries) | Rebuild prototype to production grade for pilot | See individual ADRs | Migration effort underestimated (R-02) | atlas-ceo | Any ADR's context changes materially |
| DL-002 | 2026-07-21 | MISSION-1 (pilot prep) is **prepared but not executing**; kickoff requires human owner approval | Setup task explicitly excluded feature development; external commitments involved | Start immediately (rejected: violates mission constraints) | Momentum loss if kickoff delayed | atlas-ceo | Human owner gives kickoff |
| DL-003 | 2026-07-21 | Five-role agent operating model installed (ADR-0009); no self-approval, QA gates all releases | Prevent duplicated/conflicting agent work and unverified "done" claims | Single generalist agent; ad-hoc spawning | Coordination overhead | atlas-ceo | If overhead exceeds benefit at current team size |
| DL-004 | 2026-07-21 | Pilot ICP = small/mid developer (יזם) with active pinui-binui pipeline; municipalities and שמאים deferred | Fastest sales cycle, sharpest Excel-replacement pain (PILOT_SCOPE.md) | Municipality (procurement too slow); שמאי (methodology risk) | Wrong wedge (R-05) | atlas-product | Pilot exit review |
| DL-005 | 2026-07-21 | Pilot offer = free 8-week design-partner with hard end date, traded for feedback commitment, case-study rights, week-7 conversion conversation | First-customer economics; feedback is the payment (PILOT_ONBOARDING.md) | Discounted paid pilot (rejected: adds procurement friction) | Free anchors price at zero | atlas-growth | Pricing validation, week 6 |
| DL-006 | 2026-07-21 | Any incorrect financial output is an automatic S1 release blocker | Numeric trust is the product (QA_PLAN.md) | Severity by magnitude (rejected: invisible small errors are the worst kind) | Slower releases | atlas-qa | Never |
