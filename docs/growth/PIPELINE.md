# Atlas Pilot Pipeline Plan — Landing Pilot #1, Queuing #2–3

**Owner:** atlas-growth · **Task:** ATL-004 · **Status:** DRAFT — internal plan
**Governing decisions:** DL-004 (ICP), DL-005 (offer) · **Aligned with:** `docs/pilot/PILOT_ONBOARDING.md` §2, `docs/pilot/PILOT_SCOPE.md` §1

> **Honesty gate:** No outbound conversation, deck, or message derived from this plan may claim any
> current capability until ATL-006 (verified capability matrix) exists and the claims audit is done.
> Until then, external conversations describe the *problem*, the *design-partner offer*, and the
> *planned* workflow — explicitly labeled as such. Target counts below are working goals we set for
> ourselves, not market statistics.

---

## 1. ICP (fixed by DL-004)

**Primary:** small/mid developer (יזם), roughly 3–15 active pinui-binui / TAMA 38-successor deals, whose
VP BizDev or in-house analyst builds feasibility models in Excel today.

Qualifying attributes (per PILOT_SCOPE.md §1 and PILOT_ONBOARDING.md §2):
- **Active pipeline:** 3+ pinui-binui projects currently in evaluation — deals being evaluated weekly means natural usage, not staged demos.
- **Champion exists:** a named in-house analyst/VP who owns the Excel today and feels the pain.
- **Economic buyer reachable:** CEO/CFO can attend kickoff and week 4 (multi-threading requirement).
- **Data available:** willing and able to share 1–2 real sample files (taba CSV/XLSX exports, their Excel models) for the week-0 dry-run *before* kickoff.
- **Right size, not biggest logo:** boutique-to-mid firm that can commit champion time for 8 weeks.

**Explicitly deferred (not pilot #1):** municipalities / מנהלות התחדשות עירונית (procurement and budget
cycles kill an 8-week pilot; pursue as pilot #2–3 candidates and land-and-expand via developer
references) and שמאים (credibility partners, not buyers, until the engine is audited).

## 2. Channels, prioritized (per PILOT_ONBOARDING.md §2)

| Priority | Channel | Play | Use for |
|---|---|---|---|
| 1 | **Warm intros** (founder/investor networks) | Ask every contact: "who builds your feasibility Excels?" One intro to a VP BizDev or feasibility analyst beats any outbound. | Pilot #1 — primary path |
| 2 | **Feasibility consultants & שמאים** | Economic consultants and appraisers serve many developers; one convinced consultant is a channel. Source via לשכת שמאי המקרקעין events. Positioned as partners/introducers at this stage, not buyers. | Intros to pilot #1; queue for later partnership |
| 3 | **Municipal urban-renewal administrations** (Tel Aviv, Haifa, Ramat Gan, Bat Yam) | Relationship-building only; explicitly **deferred** as customers. | Pilot #2–3 queue, post-reference |
| 4 | **Conferences & forums** (TheMarker/Globes real-estate events, developer WhatsApp/LinkedIn groups) | Pipeline building and sourcing warm intros — not for closing #1. | Top-of-funnel for #2–4 |

## 3. Stage definitions

| Stage | Entry criteria | Exit criteria | Owner action |
|---|---|---|---|
| **1. Identified** | Named company + named likely champion matching ICP §1 | Intro path found (who introduces us, or direct contact agreed) | Build the intro map; log source |
| **2. Intro** | Warm intro made or direct contact responded | 30-min discovery call booked | Two-line problem framing; no capability claims; no deck |
| **3. Discovery** | Discovery call held (questions in `DEMO_OUTLINE.md` §2) | Qualified: active pipeline confirmed, champion + buyer identified, pain articulated in their words; agrees to hear the design-partner offer | Qualification scorecard filled; disqualify fast if criteria miss |
| **4. Data dry-run scheduled** | Prospect commits to send 1–2 real sample files; NDA/data terms if requested (escalate legal terms to atlas-ceo) | Files received and week-0 internal dry-run **passed** (import works on their actual data) | Coordinate with product/CTO for the dry-run; this is the go/no-go gate per PILOT_ONBOARDING.md §7 |
| **5. Pilot agreed** | Dry-run passed; one-page pilot agreement (per `PILOT_OFFER.md`) signed by champion's sponsor | Kickoff scheduled with hard end date; success criteria drafted | External commitment → **human owner approval required first** (CLAUDE.md rule 9) |

**Regression rule:** a prospect who stalls >2 weeks at any stage without a scheduled next step drops one
stage and is flagged; two flags = recycle to nurture. Champion-goes-quiet during an active pilot
escalates to atlas-ceo (risk R-05 / PILOT_ONBOARDING.md §7).

## 4. Target counts per stage (working goals for MISSION-1)

Sized backward from needing **1 primary pilot + 2–3 queued design partners** (PILOT_SCOPE.md targets
2–3 design partners, one primary). These are internal planning targets, not conversion statistics —
we have no historical funnel data yet.

| Stage | Target count | Rationale |
|---|---|---|
| Identified | 20 | Enough ICP-fit names to survive attrition without loosening the ICP |
| Intro | 10 | Half of identified reachable through a genuinely warm path |
| Discovery | 6 | Calls actually held with qualified attendees |
| Data dry-run scheduled | 3 | Only prospects willing to share real data — the strongest intent signal we have |
| Pilot agreed | 1 primary + 2 queued | Primary starts; #2–3 queued with agreed start windows (post-#1 learnings or staggered) |

Weekly pipeline review: counts per stage + next-step date per prospect reported in the growth section
of the CEO's status.

## 5. Disqualification criteria (disqualify politely, log the lesson)

1. **No active pipeline** — fewer than ~3 pinui-binui deals in evaluation; no natural weekly usage.
2. **No champion** — feasibility fully outsourced with no in-house owner of the model (revisit via the consultant channel instead).
3. **Buyer unreachable** — economic buyer will not commit to kickoff + week-4 checkpoint (single-threaded pilots die per PILOT_ONBOARDING.md §7).
4. **Data fails the dry-run fundamentally** — data unusable beyond one custom mapping's worth of effort; take the lesson to product (risk R-04).
5. **Won't sign the design-partner terms** — refuses hard end date, feedback cadence, or the week-7 conversion conversation (predicts a never-ending free pilot).
6. **Demands out-of-scope commitments** — mobile, 3D-as-decision-tool, SSO/SLA, custom features, or full דו"ח אפס / תקן 21 compliance as a pilot condition (PILOT_SCOPE.md §3). Requests for unbuilt capabilities as deal conditions escalate to atlas-ceo.
7. **Wrong segment for #1** — municipality or שמאי as buyer (queue for #2–3 / partnership instead, per DL-004).
8. **Confidentiality blocker** — cannot share any real data even under the SECURITY.md commitments; a data-free pilot can't hit the success metrics.

## 6. Queue plan for pilots #2–3

- Every discovery call ends with an intro ask ("who else lives in this Excel?") — the Israeli urban-renewal world is intro-driven; pilot #1's real output is pilots #2–4 (PILOT_ONBOARDING.md §6).
- Qualified prospects who lose the #1 slot are told transparently: design-partner cohort of 2–3, staggered starts; they keep priority.
- Municipal contacts nurtured with the (approved, post-audit) case study from pilot #1 — no active sale before that.
- Post-pilot #1: case-study distribution per PILOT_ONBOARDING.md §6 becomes the top-of-funnel engine for the next 10 conversations.

## 7. Dependencies and escalations

- **Blocking for external outreach material:** ATL-006 capability matrix + claims audit; human owner approval for any external commitment or published pricing.
- **Escalate to atlas-ceo:** prospect requires an unbuilt capability; pricing feedback materially contradicts the DL-005 hypothesis; legal/contract terms requested; champion goes quiet.
