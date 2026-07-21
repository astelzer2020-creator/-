# Atlas Pilot Offer — Design-Partner One-Pager (Structure)

**Owner:** atlas-growth · **Task:** ATL-004 · **Status:** DRAFT — internal structure, not yet an external document
**Governing decisions:** DL-004 (ICP), DL-005 (offer terms) · **Aligned with:** `docs/pilot/PILOT_SCOPE.md`, `docs/pilot/PILOT_ONBOARDING.md`

> **Honesty gate (binding):** The verified capability matrix (ATL-006) does not exist yet. Nothing in
> this document may be shown to a prospect as a statement of what Atlas *currently does*. Every product
> capability referenced below is labeled **planned** (or **prototype-demonstrated, unverified**). This
> document becomes an external-facing one-pager only after ATL-006 exists and the claims audit maps
> every capability statement to QA evidence.

---

## 1. The offer in one sentence

A **free, 8-week design-partner pilot** — not a discount, not a trial — in which the partner gets the
Atlas feasibility workflow on their real pinui-binui projects with white-glove onboarding, and Atlas
gets structured feedback, case-study rights, and a contractually scheduled conversion conversation.

## 2. Terms (per DL-005 — non-negotiable structure)

| Term | Definition |
|---|---|
| **Price** | Free. Framed explicitly as design-partnership: feedback is the payment. |
| **Duration** | 8 weeks from first login. **Hard end date fixed in writing at kickoff.** No open-ended extension; any extension is paid only (per PILOT_SCOPE.md §8: a "free forever extension" request counts as a soft no). |
| **Feedback commitment** | Named champion; 1 hour/week fixed review session; responses to async questions within 2 business days; written feedback captured weekly. |
| **Case-study rights** | Written approval at signing to publish an **anonymized** case study. Logo / named rights negotiated at pilot end, contingent on results. |
| **Testimonial** | Testimonial plus 2 reference calls if the jointly agreed success criteria are met. |
| **Week-7 conversion conversation** | Contractually scheduled at kickoff: the partner agrees up front to hear a paid annual offer in week 7. Scheduled, never sprung. |

## 3. What the pilot partner receives

Scope per PILOT_SCOPE.md §4–5. **Readiness labels are mandatory in every external use.**

- Up to **5 real projects** imported; **unlimited scenarios**; web app + reports. Mobile app excluded (desktop feasibility-desk workflow), 3D excluded from pilot scope.
- The core workflow — *raw project data to a bank-ready Hebrew feasibility summary* — consisting of:
  - Taba/PIO import, CSV + XLSX with Hebrew (cp1255) handling — **planned — M2; prototype-demonstrated, unverified**
  - Scenario configuration (existing vs. proposed units, mix, עלות בנייה, מחיר מכירה, timeline) — **planned — M2**
  - IRR / NPV / payback + sensitivity analysis — **planned — M2; prototype-demonstrated, unverified**
  - Scenario comparison (2+ scenarios side by side) — **planned — M2**
  - Executive summary PDF, Hebrew RTL — **planned — M2**
  - Cashflow report — **planned — Should, targeted by pilot week 3 per PILOT_SCOPE.md**
- **White-glove onboarding:** week-0 data dry-run on their sample files before kickoff (the go/no-go gate); manual import assistance on the first 2 projects so the pilot never stalls on plumbing.
- **Weekly working session** with the Atlas team; direct async channel (WhatsApp) with 2-business-day response commitment on product questions.
- **Numeric reconciliation:** joint side-by-side reconciliation of Atlas outputs against their own Excel models on at least 3 projects (target per PILOT_SCOPE.md: within 1%). This is offered as a *process commitment*, not a claim that reconciliation currently passes — the engine is **planned — M2** and gated by QA (any wrong financial number is an automatic S1 blocker, DL-006).

## 4. Mutual obligations

**Atlas commits to:**
1. Week-0 data audit and dry-run before kickoff; no live-import surprises.
2. Fixed weekly cadence (same slot every week) plus mid-pilot sponsor checkpoint at week 4.
3. Weekly triage of feedback per PILOT_SCOPE.md §7 (Blocker / Core / Later / No), with explicit answers — including honest "not in pilot."
4. Transparent handling of any numeric discrepancy: every gap investigated and explained.
5. The data-handling promises in §6.

**Partner commits to:**
1. Named champion + economic sponsor present at kickoff; sponsor attends weeks 1 and 4.
2. 1 hour/week champion session; second trained user by week 3.
3. Real projects and real data (minimum 3, target 5) — not staged samples.
4. Use of Atlas output in at least one live decision setting (go/no-go, bank deck, or שמאי review) by around week 5, data permitting.
5. Written feedback, anonymized case-study approval, week-7 conversion conversation, and (if success criteria are met) testimonial + 2 reference calls.

## 5. Exit terms

- **Hard end** at week 8. Outcomes: **convert** (paid annual agreement, target signature within 2 weeks of pilot end), **iterate** (one adjusted pilot cycle maximum, per PILOT_SCOPE.md §8), or **end**.
- Either side may terminate early with 1 week's written notice; case-study rights then lapse unless separately agreed, and the data-deletion promise (§6) executes immediately.
- Two consecutive missed weekly sessions trigger a reset conversation or pilot end (PILOT_ONBOARDING.md §7).
- If conversion is declined, Atlas asks for the detailed *why* (captured in writing) and, where earned, reference value.

## 6. Data-handling promise (references `docs/SECURITY.md`)

To be stated verbatim in the one-pager, since the partner's feasibility data is commercially sensitive:

1. Processing under the Israeli **Privacy Protection Law (חוק הגנת הפרטיות)** incl. Amendment 13: defined data region (EU/Israel), documented processing purpose.
2. **Deletion at pilot end** (or on request at any time), verified — including expiry of backups.
3. Customer data never appears in logs, analytics events, or test fixtures.
4. Encryption in transit (TLS 1.2+) and at rest (disk/volume and backup encryption).
5. Single-tenant deployment for the pilot; all access scoped by organization; analytics service and database never internet-facing.

*(These are the security commitments Atlas is building to per `docs/SECURITY.md`. Before external use, the one-pager's security wording must pass the ATL-006 claims audit like everything else — implemented controls stated as fact only with QA evidence.)*

## 7. Pricing appearing in or around the offer

**All pricing figures are hypotheses** — not quotes, not list prices — pending week-6 Van Westendorp
validation (PILOT_ONBOARDING.md §5) and **human-owner approval in the decision log** before any
external communication (hard rule; DL-005 revisit condition).

- Hypothesis under test: per-active-project or tiered project-count pricing fits how developers budget better than per-seat SaaS.
- Ranges to test in week 6 (internal only until owner-approved): ₪3–5K/month/company vs. ₪1.5–2.5K per active project.
- The pilot one-pager itself carries **no price**; it carries only the commitment to the week-7 conversation.

## 8. Open items before this becomes an external document

1. ATL-006 verified capability matrix + Growth claims audit (capability → evidence link) — **blocking**.
2. atlas-product review for alignment (ATL-004 reviewer).
3. Human owner approval of the one-page pilot agreement text (external commitment — CLAUDE.md rule 9) and of any pricing framing.
4. Hebrew-primary version of the final one-pager.
