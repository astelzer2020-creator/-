# Atlas — Documentation Strategy

Documentation is part of the product's trust story: a platform that computes bank-grade numbers must be
able to say *why* it is built the way it is. The rule is **few documents, always current** — a stale doc
is worse than no doc.

## The documentation map (what lives where)

| Document | Answers | Owner (agent role) |
|---|---|---|
| `README.md` | What is this repo, how do I run it | CTO |
| `CLAUDE.md` | Constitution: how work happens in this repo | CEO |
| `docs/ARCHITECTURE.md` | How the system fits together | CTO |
| `docs/ROADMAP.md` | What we build, in what order, with exit gates | CEO |
| `docs/FOLDER_STRUCTURE.md` | Where code goes and why | CTO |
| `docs/CODING_STANDARDS.md` | How code is written and reviewed | CTO |
| `docs/TESTING_STRATEGY.md` | How correctness is protected | QA |
| `docs/DEPLOYMENT.md` | How software reaches users and comes back | CTO |
| `docs/SECURITY.md` | How data and access are protected | QA |
| `docs/adr/` | Why each structural decision was made | CEO (log), all (author) |
| `docs/pilot/` | Everything about the first pilot customer | Product/Growth/QA/CTO |
| `docs/coordination/` | Live operating state: workboard, decisions, risks, handoffs | CEO |

## Rules

1. **ADRs are immutable.** A changed decision gets a *new* ADR that supersedes the old one; history is
   never rewritten. Template: Context → Decision → Consequences → Alternatives rejected.
2. **Docs change with the code.** A PR that invalidates a document updates it in the same PR; reviewers
   enforce this like a failing test.
3. **Reference docs are generated, not written:** API surface from OpenAPI (Fastify + FastAPI both emit
   it), TS API from source. Hand-written docs cover intent and architecture only.
4. **Language policy:** engineering docs in English with Hebrew domain terms where they are the real
   vocabulary (תב"ע, פינוי-בינוי, מספר תיק); user-facing docs and UI copy in Hebrew.
5. **One source of truth per fact.** E.g. the taba column mapping lives in `packages/shared` and is
   rendered into docs, not duplicated by hand.
6. **Live coordination docs** (`docs/coordination/`) are append/update-in-place working documents — the
   only docs that are *expected* to change without code.

## Definition of a good doc here

Short enough to read in five minutes, states its decisions and their reasons, names its owner, and links
to deeper material instead of inlining it.
