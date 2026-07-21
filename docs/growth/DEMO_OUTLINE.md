# Atlas Demo Script — OUTLINE (not yet a demo script)

**Owner:** atlas-growth · **Task:** ATL-004 · **Status:** OUTLINE ONLY
**Keyed to:** the pilot core workflow (PILOT_SCOPE.md §5): import → scenario → results → Hebrew PDF

> **GATE (binding):** This outline becomes a real demo script **only after atlas-qa verifies each
> demonstrated step and ATL-006 (verified capability matrix) exists**. Until then, nothing in this
> outline may be demonstrated live to a prospect or described to a prospect as working. Readiness
> labels below are the current truth: **planned — M2** means the capability is on the roadmap for
> milestone M2 and has NOT been QA-verified; **prototype-demonstrated, unverified** means the frozen
> legacy prototype (ADR-0007) showed a version of it, which is evidence of design intent only — the
> production platform has not implemented or verified it. The prototype itself is never demoed to
> prospects as the product.

---

## 1. Demo objective and rules

- **Objective:** show the ICP champion (the analyst who owns the Excel) that the core loop — *their raw project data to a bank-ready Hebrew feasibility summary in under 30 minutes* — replaces their Excel ritual for early-stage feasibility.
- **Rule 1 — their data:** the ideal demo uses the prospect's own sample file (obtained in discovery), which is why the demo comes *after* the internal dry-run, never before.
- **Rule 2 — no claim beyond the matrix:** every sentence in the final script must map to a row in the ATL-006 capability matrix or be explicitly framed as "planned."
- **Rule 3 — never demo around a bug:** if a step fails verification, it is cut from the demo, not narrated over. Wrong financial numbers are an S1 (DL-006); a demo showing an unreconciled number is a trust-destroying event, not a sales event.

## 2. Discovery questions (asked BEFORE any demo)

Qualification + demo-tailoring; answers feed the pipeline scorecard (`PIPELINE.md` §3) and the week-6
pricing interviews (PILOT_ONBOARDING.md §5).

**Workflow & pain**
1. Walk me through your last בדיקת כדאיות — who built the model, from what data, and how long did it take end-to-end?
2. How many pinui-binui / urban-renewal deals are you evaluating right now? How many per quarter?
3. When a deal's assumptions change (מחיר מכירה, עלות בנייה), how do you re-run the numbers today? How long does one iteration take?
4. Have you ever found a material error in a feasibility Excel after a decision was made? What happened?
5. How do you compare two apartment-mix or cost scenarios today — side by side, or two files?

**Data (feeds the week-0 dry-run gate)**
6. What format is your source plan data in — taba/PIO exports, CSV/XLSX, consultant PDFs? Can you share 1–2 real (or redacted) sample files?
7. Which Hebrew column conventions do your files use (מספר תיק, יח"ד קיים/מוצע, ...)? Any exports from municipal systems?

**Trust & output**
8. Who consumes the feasibility output — bank, partners, board, שמאי, diyarim assembly? In what format?
9. What would it take for you to trust a number from software enough to put it in front of a bank?

**Value anchor & buying (pricing hypothesis inputs — record verbatim)**
10. What do you pay today for an external feasibility opinion? How many analyst-hours does one model cost you?
11. If this saved you most of that time per deal, whose budget would it come from — project budget or IT/software? Who signs?

**Fit for the design-partner structure**
12. Could a named person on your team commit 1 hour/week for 8 weeks? Can your CEO/CFO attend a kickoff and a week-4 checkpoint?

## 3. Demo flow outline (every step gated on QA verification)

Total target length: 27 minutes + Q&A, mirroring the "<30 minutes" promise of the core workflow.

| # | Step | What is shown / said | Readiness label (today) |
|---|---|---|---|
| 0 | **Frame (2 min)** | Their pain, in their words from discovery: "you rebuild an Excel per deal, no versioning, no sensitivity, scenario compare by email." No product claims — problem framing only. | No capability claims — safe now |
| 1 | **Import (5 min)** | Upload their sample CSV/XLSX (Hebrew cp1255 columns), show project created with their real data — the first "wow" moment. Fallback if file quirks: pre-imported copy of *their* file from the dry-run, said openly. | **planned — M2; prototype-demonstrated, unverified** |
| 2 | **Scenario setup (5 min)** | Configure existing vs. proposed units, apartment mix, עלות בנייה, מחיר מכירה, timeline — the inputs they recognize from their own Excel. | **planned — M2** |
| 3 | **Results (6 min)** | Run simulation: IRR, NPV, payback rendering in seconds; sensitivity table (מחיר מכירה ±, עלות בנייה ± — the #1 bank question). If reconciliation against their Excel has been done in the dry-run, show it; otherwise say "reconciliation is week-2 of the pilot" — never imply it. | **planned — M2; prototype-demonstrated, unverified** |
| 4 | **Scenario compare (4 min)** | Second scenario (different mix or cost basis) side by side — "this is the conversation you currently have across two spreadsheets." | **planned — M2** |
| 5 | **Hebrew PDF export (3 min)** | Export the executive-summary PDF, Hebrew RTL, and open it: "this is what goes to the bank/partner/board." | **planned — M2** |
| 6 | **Close (2 min)** | The design-partner offer per `PILOT_OFFER.md`: free 8 weeks, hard end date, their real projects, week-0 data dry-run as the next step. Ask for the sample files. | Offer terms per DL-005 — no capability claims |

**Not in the demo, by decision (PILOT_SCOPE.md §4):** 3D before/after view (demo candy, zero decision
value for the יזם persona), mobile app, GeoJSON import, roles/permissions. If asked: honest "not in the
pilot; on the roadmap" — and if it becomes a deal condition, escalate to atlas-ceo.

**Optional add-ons once (and only if) verified:** cashflow report (planned — Should, pilot week 3),
Leaflet portfolio map (planned — Should).

## 4. Objection-handling notes (outline)

- **"How do I know the numbers are right?"** — Answer with process, not assertion: golden-file testing strategy, the pilot's week-2 line-by-line reconciliation against *their* Excel on real projects, and the internal rule that any wrong financial number blocks release (DL-006). No accuracy percentage is ever quoted without QA evidence.
- **"What happens to our data?"** — The five data-handling commitments in `PILOT_OFFER.md` §6 (deletion at pilot end verified incl. backups, no customer data in logs/fixtures, encryption, single-tenant).
- **"What does it cost after the pilot?"** — "That's exactly the week-6/7 conversation the agreement schedules; pricing is being designed with design partners." No figures quoted externally until owner-approved (DL-005).
- **"Can it do X (out of scope)?"** — Honest "not in the pilot"; logged; escalated if deal-blocking.

## 5. Path from outline to script (ATL-006 gate)

1. atlas-qa verifies each step 1–5 on the production platform against the PILOT_SCOPE.md §9 acceptance criteria groups (AC-IMP, AC-SCN, AC-RES, AC-EXP, AC-E2E); evidence linked on the workboard.
2. ATL-006 capability matrix published (verified / in-progress / planned).
3. atlas-growth writes the full script with exact talk track, upgrades each row's label to its matrix status, and attaches the claims audit (statement → evidence link).
4. Dry-run of the demo on synthetic fixture data (never real customer data in the repo — TESTING_STRATEGY rule), then on the prospect's dry-run file.
5. atlas-product reviews script copy; only then is the demo bookable.
