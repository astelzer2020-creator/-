# Week-0 Customer Data Dry-Run Runbook (ATL-013)

**Owner:** atlas-product · **Reviewer:** atlas-cto · **Approver:** atlas-ceo · **Status:** delivered for review
**Last updated:** 2026-07-23 · **Mitigates:** R-04 (RISK_REGISTER.md — "real customer taba files too messy")
**Gate it implements:** PILOT_ONBOARDING.md §4 week 0 + §7 ("Week 0 audit *before* kickoff is the gate — never
discover this live") and FIRST_VALUE_JOURNEY.md §1 step 0.

**Rule of the gate:** the pilot kickoff (week 1) is **not scheduled** until this runbook produces a written
GO verdict. No exceptions, including "the prospect is excited."

---

## 1. Roles and time budget

| Role | Who | Responsibility | Budget |
|---|---|---|---|
| **Runbook operator** | atlas-product (pilot lead) | Runs this runbook end-to-end, owns the verdict record, keeps the clock | ≤ 4h wall per prospect |
| Customer relationship | atlas-growth | All prospect communication: the request (§3), chasing files, delivering the verdict message | ≤ 1h |
| Technical execution | atlas-cto | Executes checks C1–C7 (§5) until the M2 staging import UI exists; after that, on-call for triage only | ≤ 2h execution; **custom-mapping budget ≤ 1 CTO-day per pilot, once** (§7) |
| Decision (GO / ADJUST) | atlas-product + atlas-cto jointly | Recorded in the verdict record | — |
| Decision (NO-GO) | atlas-ceo | Disqualification is a pipeline/business decision — escalated with the verdict record, logged in DECISION_LOG | — |
| External commitments | Human owner (Founder) | Any promise of dates or custom work to the prospect (CLAUDE.md rule 9) | — |

**CTO involvement trigger:** any check failure that is not a pure re-request (§6 classes F1-convert, F2, F4,
F5), plus optional support on the Excel-model review (C8). Everything else the operator handles alone.

**Turnaround target:** receipt → written verdict within **2 business days** (Israel business days, Sun–Thu).

## 2. Preconditions (before any file is received)

1. **Data-handling commitment in place.** Signed pilot agreement (ATL-019 draft) or, before signature, a
   short written commitment sent by atlas-growth covering, per SECURITY.md and the Privacy Protection Law
   (חוק הגנת הפרטיות) incl. Amendment 13: purpose limitation (pilot feasibility evaluation only), data
   region EU/Israel, deletion at pilot end incl. backup expiry, and **no customer data in the repo, logs,
   analytics events, or test fixtures — ever**. No file is accepted before this exists in writing.
2. **Secure receiving channel agreed.** An agreed file share, or a password-protected archive with the
   password sent over a separate channel. **WhatsApp is for questions, never for data files**
   (PILOT_ONBOARDING §4 uses WhatsApp for async Q&A only).
3. **Storage location ready.** A designated directory on an encrypted disk, **outside any git working
   tree**. Customer files must never be placed anywhere `git add` could reach them, and never uploaded to
   third-party tools (online converters, spreadsheet viewers, LLM services) — the dry run happens on our
   machines only.

## 3. What we request from the prospect

Sent by atlas-growth, in Hebrew, before kickoff scheduling. Request all four items:

1. **1–2 real taba/project exports** (CSV or XLSX) from their current system or master Excel — the files
   they actually work from, for projects currently in evaluation.
2. **Their current feasibility Excel model** for at least one of those projects (the workbook with
   IRR/NPV/cashflow). Needed to prepare the week-2 reconciliation (RECONCILIATION_WORKSHEET.md §4 prep).
3. **A one-line answer:** "מאיזו מערכת יוצא הקובץ, ומי מפיק אותו?" (which system produces the export, and
   who runs it) — tells us whether re-exports are cheap or need their IT.
4. **Row-count claim:** roughly how many project rows the file should contain (used in check C6).

### 3.1 Expected columns (the standard taba shape)

The importer maps columns **by Hebrew header name, not position** (QA_PLAN.md §5.3; canonical map:
`packages/shared/src/taba.ts` `TABA_COLUMN_MAP`). The standard 17 columns, as in our synthetic reference
file `data/sample/sample-taba-projects.csv`:

> מספר תיק · כתובת · עיר · גוש · חלקה · סוג בניין · שנת בנייה · קומות קיים · קומות מוצע · יח"ד קיים ·
> יח"ד מוצע · שטח קרקע · שווי קרקע · עלות בנייה · מחיר מכירה · סוג תוכנית · סטטוס

Also recognized: שכונה (neighborhood) and שטח מגרש (synonym of שטח קרקע). Gershayim/geresh variants
(`יח"ד` with ASCII quote or U+05F4) are normalized automatically — the prospect does **not** need to fix
quote characters (QA_PLAN §4 E6).

**Hard-required column: מספר תיק** (dedup/idempotency key — QA_PLAN §5.2, §5.5). Everything else imports
with nulls if missing; unit/cost/price columns are workflow-important but can be completed in the
scenario builder (see F3).

### 3.2 Export instructions to send the prospect (safe export)

- **Best: send the XLSX as-is**, exactly as their system exports it (no re-save, no cleanup).
- If CSV: Excel → שמירה בשם → **"CSV UTF-8 (מופרד באמצעות פסיקים)"**, or the legacy
  **"CSV (מופרד באמצעות פסיקים)"** — on Hebrew Windows this produces Windows-1255. **Both are accepted**
  (QA_PLAN §4 E1–E3: cp1255, UTF-8 with BOM, UTF-8 without BOM must all import identically).
- **Do NOT** hand-clean rows, translate headers, retype data into a new sheet, or send PDFs/screenshots.
  We want the raw reality — a "messy" file that fails is a *successful* dry run (it fails here, not at
  kickoff).
- If the workbook has several sheets, tell us which sheet is the project table.

## 4. Receipt and storage procedure

1. Save the files to the designated non-repo location (§2.3). Never open them from Downloads and never
   copy into the repo, fixtures, or a scratch directory inside a git tree.
2. Compute and record `sha256sum` of each file, with filename, receipt date, sender, and channel, in the
   **private dry-run record** (a text/spreadsheet file living next to the data, outside the repo).
3. Confirm receipt to the prospect (atlas-growth) without commenting on content yet.
4. From this point the files are pilot customer data under the §2.1 commitment: no values from them are
   ever pasted into the repo, workboard, handoffs, chat logs, or issue trackers. Sanitized references
   only ("row 14: non-numeric value in a numeric column" — never the value itself).

## 5. Technical checks C1–C8

**Tooling note (honest, as of 2026-07-23):** the M2 import UI does not exist yet (ROADMAP M2; the verified
ATL-003 slice contains no import pipeline). Until it ships, atlas-cto executes C1–C7 with a local script
built on `@atlas/shared` (`normalizeTabaHeader` / `mapTabaHeader`) plus standard encoding detection —
same logic the product will use, so results carry over. Once the M2 staging import page exists, C1–C7 are
executed through it (QA_PLAN §2.1–§2.2) and the dry run doubles as a staging smoke. Either way the checks
below are the contract; the tool is interchangeable.

| # | Check | Pass condition |
|---|---|---|
| C1 | **Encoding** | File decodes as cp1255 or UTF-8 (±BOM) with all Hebrew intact — zero mojibake; no ambiguous detection left silent (QA_PLAN §4 E1–E4) |
| C2 | **Header mapping** | Every header either maps via `TABA_COLUMN_MAP` or is listed as an explicit unknown; unknowns are surfaced, never silently dropped |
| C3 | **Required columns** | מספר תיק present and non-empty on every data row; workflow columns (יח"ד קיים/מוצע, עלות בנייה, מחיר מכירה) present or their absence noted (F3) |
| C4 | **Row parse** | Numeric columns numeric; empty/garbage/summary rows counted with row numbers; unclosed quotes / extra delimiters detected (QA_PLAN §5.1) |
| C5 | **Duplicates** | In-file duplicate מספר תיק values listed (QA_PLAN §5.5) |
| C6 | **Row-count sanity** | Parsed data-row count matches the prospect's row-count claim (§3 item 4) (± header/summary rows, explained) |
| C7 | **Size limits** | ≤ 20 MB and ≤ 50k rows (QA_PLAN §5.4); larger → F9 |
| C8 | **Excel model review** (operator, not scripted) | Their feasibility workbook located and readable; IRR/NPV/payback cells identified; cost/revenue line items listed; **definitional-gap scan** done (financing interest, מע"מ treatment, הצמדה/indexation, fees) — feeds RECONCILIATION_WORKSHEET.md §4 prep and its ASSUMPTION R2 |

Record each check PASS/FAIL with sanitized evidence in the verdict record (§8).

## 6. Failure triage matrix

Every failure class has exactly one next action. "Re-request" actions go through atlas-growth using the
§3.2 wording; the prospect's effort for a re-export should be ≤ 15 minutes.

| # | Failure class | Symptom | Next action |
|---|---|---|---|
| F1 | **Encoding** | Mojibake in every supported decode, or an unsupported encoding (UTF-16, cp862) | Try the full accepted set first. Still failing → **ADJUST**: re-request per §3.2. Prospect can't re-export → atlas-cto converts once locally (≤ 1h, counts against the mapping budget) and files a synthetic repro fixture + backlog item so the importer learns the encoding |
| F2 | **מספר תיק missing** | No case-number column | Look for a synonym header (e.g., "מס' תיק") → **ADJUST**, custom-mapping candidate (§7). No case identifier exists in their data at all and they can't add one → **NO-GO candidate** (dedup/idempotency impossible — QA_PLAN §5.5) |
| F3 | **Workflow columns missing** (units/costs/prices) | Columns absent or empty | Ask if the data lives in a second file/sheet → **ADJUST** (white-glove merge). Data genuinely doesn't exist per-project → **GO with note**: values are entered in the scenario builder (FIRST_VALUE_JOURNEY step 4); note it in the verdict so kickoff plans the extra minutes |
| F4 | **Reordered columns** | Import tool fails on column order | This is an **Atlas defect**, not a customer problem — mapping is by header name (QA_PLAN §5.3). File S2 against the importer; the file itself passes triage |
| F5 | **Header variants** | Headers don't map: unrecognized synonyms, merged/renamed headers | Gershayim/geresh/whitespace variants must already normalize (E6) — if not, Atlas defect (as F4). True synonyms → **ADJUST**: custom-mapping candidate (§7): atlas-cto adds the synonym to `TABA_COLUMN_MAP` with a synthetic test — configuration, not a custom feature (allowed under PILOT_SCOPE §3) |
| F6 | **Duplicate מספר תיק in-file** | Same case number on 2+ rows | Ask the prospect which row is current. Import behavior is defined — flag + skip second occurrence (QA_PLAN §5.5) → **GO with note** |
| F7 | **Garbage rows** | Non-numeric values, empty mid-file rows, embedded totals/summary rows | < 10% of data rows → **GO with note** (the M2 per-row Hebrew validation report is designed for exactly this — QA_PLAN §5.1). ≥ 10% or systematic → **ADJUST**: re-request a raw table export without summary rows; failing that, white-glove cleanup of the first 2 projects (§7) |
| F8 | **Wrong file entirely** | PDF renamed .csv, a different report, empty/binary file | **Re-request** with §3.2 instructions; second wrong file in a row → operator gets on a 10-min screen-share with the person who exports |
| F9 | **Oversized** | > 20 MB / > 50k rows | **Re-request** filtered to active/in-evaluation projects only |
| F10 | **XLSX quirks** | Merged header cells, multi-sheet ambiguity, values needed from formula cells | Ask which sheet + a values-only save ("הדבקה כערכים") → **ADJUST** if their system can't; ≤ 1h CTO handling counts against the mapping budget |

## 7. Decision rule: GO / ADJUST / NO-GO

Per PILOT_ONBOARDING §7 (mitigation row "Data too messy to import").

- **GO** — C1–C7 pass on at least one real file with at most F3/F6/F7-minor notes, and C8 is complete
  (their Excel model in hand). *Effect:* atlas-growth may schedule kickoff; the verified file format
  becomes the reference for AC-E2E-1's "week-0-validated file format" (PILOT_SCOPE §9).
- **ADJUST** — failures are fixable within the **adjust budget**, which is exactly two levers and nothing
  else: (a) **one custom mapping**, ≤ 1 CTO-day total per pilot — synonym/encoding/config work only, never
  a custom feature (PILOT_SCOPE §3: "configuration only"); (b) **white-glove manual import of the first
  2 projects** by us, so the pilot never stalls on plumbing. *Effect:* kickoff is NOT scheduled; the
  dry run re-runs after the adjustment and must reach GO. Exceeding the budget converts ADJUST to NO-GO
  escalation. Any promise to the prospect of custom work or dates is an external commitment → human owner
  approval first (CLAUDE.md rule 9).
- **NO-GO** — data is fundamentally unusable: no case identifier and none can be added (F2 terminal),
  unrecoverable encoding with no re-export path, the data doesn't describe projects, or the adjust budget
  is exhausted. *Effect:* escalate to atlas-ceo with the verdict record; CEO decides and logs in
  DECISION_LOG; atlas-growth disqualifies politely and the lesson (which failure class, which system
  produced the file) is recorded for product — "disqualify politely and take the lesson to product"
  (PILOT_ONBOARDING §7).

**Who decides:** GO/ADJUST — atlas-product + atlas-cto jointly, recorded in the verdict record.
NO-GO — atlas-ceo only. Prospect-facing communication — atlas-growth only.

## 8. Verdict record (output)

One record per dry run, stored **with the data outside the repo**. Contents: prospect name, files +
sha256 hashes, per-check C1–C8 PASS/FAIL with sanitized evidence, triage classes hit with actions taken,
decision (GO/ADJUST/NO-GO) with decider names and date, and — on ADJUST — the budget consumed.

A **sanitized summary** (checks passed/failed, failure classes, decision — zero customer values) is
posted as evidence on the workboard/HANDOFFS entry, because "evidence or it didn't happen" (CLAUDE.md
rule 2) must coexist with "no customer data in the repo" (SECURITY.md, TESTING_STRATEGY).

Every failure class encountered also produces a **synthetic fixture proposal** for atlas-cto (structure
reproduced with invented values) — the R-04 mitigation "fixture library grown from every failure."

## 9. Assumptions (labeled; not validated with real users)

- **ASSUMPTION D1:** the prospect's analyst can export CSV/XLSX without involving their IT. *Cheapest
  test:* the which-system question (§3 item 3) in the request itself — one line in the qualification call.
- **ASSUMPTION D2:** prospect exports resemble the 17-column shape (= FIRST_VALUE_JOURNEY ASSUMPTION A4).
  *Cheapest test:* this dry run — that is why it is a gate.
- **ASSUMPTION D3:** real files are well under 20 MB / 50k rows (a mid-size developer has tens of
  projects, not thousands). *Cheapest test:* the row-count claim (§3 item 4) before the file arrives.
- **ASSUMPTION D4:** a secure channel acceptable to the prospect exists without procurement (file share
  or password-protected archive). *Cheapest test:* propose it in the §3 request; if they push back, the
  fallback is agreed at the same moment.

## 10. Acceptance criteria for this runbook (executable by the reviewer)

- **AC-RB-1 (runnable by a non-author):** Given `data/sample/sample-taba-projects.csv` plus two seeded
  variants (one re-saved as Windows-1255, one with 3 seeded defects: a non-numeric value in a numeric
  column, an empty mid-file row, a duplicate מספר תיק), When a person who is not the author follows §4–§8
  end-to-end, Then they produce a complete verdict record with a per-check PASS/FAIL, the correct triage
  classes (F7, F6), and a decision — without asking the author any question. Expected-value source: the
  synthetic sample file itself (source (b), PILOT_SCOPE §9).
- **AC-RB-2 (decision determinism):** Given the same verdict-record inputs, When two people apply §7
  independently, Then they reach the same GO/ADJUST/NO-GO decision.
- **AC-RB-3 (data hygiene):** Given a completed dry run, When the repo is searched, Then zero customer
  values, filenames, or file contents appear anywhere in git — only the sanitized summary exists on the
  workboard.
- **AC-RB-4 (CTO executability — the ATL-013 workboard criterion):** atlas-cto confirms in review that
  every technical step (C1–C7, F1/F5/F10 actions) is executable as written with current or planned-M2
  tooling, and flags any step that is not.

---

*Change control: atlas-product owns this runbook; technical steps change only with atlas-cto review.
Scope changes reflect into PILOT_SCOPE.md in the same change. Companion document:
[RECONCILIATION_WORKSHEET.md](RECONCILIATION_WORKSHEET.md) (C8 feeds its session prep).*
