# Atlas — Risk Register (live)

Severity/Probability: Low / Medium / High. Reviewed by atlas-ceo at every executive status.

| ID | Description | Severity | Probability | Impact | Owner | Mitigation | Status |
|---|---|---|---|---|---|---|---|
| R-01 | Toolchain bootstrap (ATL-007) stalls M0; docs exist but repo can't build | Medium | Medium | All engineering blocked | atlas-cto | ATL-007 is P0, first in queue; exit gate is timed | Open |
| R-02 | Porting the financial engine introduces silent numeric regressions | High | Medium | Product's core trust broken | atlas-cto | Golden fixtures built from prototype outputs BEFORE porting (ADR-0006); QA reconciliation gate | Open |
| R-03 | Auth/tenancy built wrong forces rework before multi-tenant future | Medium | Medium | M4 rewrite | atlas-cto | Org-ID scoping at repository layer from day one (SECURITY.md); QA cross-tenant probes | Open |
| R-04 | Real customer taba files too messy for the importer (encoding, layout drift) | High | High | Pilot's week-0 dry-run fails; first-value never reached | atlas-cto | Week-0 data dry-run gates kickoff (PILOT_ONBOARDING.md); import validation report; fixture library grown from every failure | Open |
| R-05 | Pilot goes quiet / champion leaves | Medium | Medium | No conversion signal; 8 weeks lost | atlas-growth | Contractual weekly cadence + week-4 go/adjust checkpoint; second contact at customer | Open |
| R-06 | Pilot customer data mishandled (privacy law, leak) | High | Low | Legal exposure + fatal reputation damage at market entry | atlas-qa | SECURITY.md controls; no customer data in repo/fixtures; deletion commitments; incident playbook | Open |
| R-07 | Agent collisions corrupt shared files or duplicate work | Medium | Medium | Rework, inconsistent docs | atlas-ceo | OPERATING_PROTOCOL collision rules; file-group ownership; git diff before edit | Open |
| R-08 | Repo bloat/confusion from legacy prototype + committed archives | Low | High (already true) | Slow clones, contributor confusion | atlas-cto | ADR-0007 freeze + M2 deletion; ATL-008 archive cleanup (awaiting owner confirmation) | Open |
