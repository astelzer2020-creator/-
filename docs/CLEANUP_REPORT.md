# Atlas — Root Archive / Executable Cleanup Report (ATL-009)

**Status: PROPOSAL — no action taken; decision reserved for the human owner.**

Prepared by: atlas-cto, 2026-07-21, per handoff "ATL-007 + ATL-009" and DL-007 constraints.
Every command used was read-only (`stat`, `sha256sum`, `unzip -l`, `file`, `diff` of listings).
Nothing was extracted into the repo; no legacy file was modified or deleted (see Appendix B).

## 1. Scope

21 candidate files at repository root, all committed before ADR-0008 ("no binaries/archives in
git") took effect. `.gitignore` now blocks new ones; these existing ones remain tracked until the
human owner decides.

| # | File | Size (bytes) | mtime (filesystem) | SHA-256 (first 16) | Group |
|---|---|---:|---|---|---|
| 1 | `urbanrenewalcomplete (1).zip` | 251,662 | 2026-07-20 14:51 | `fecff00a63ab4e43` | **A** (unique) |
| 2 | `urbanrenewalcomplete.zip` | 125,765 | 2026-07-20 14:51 | `0d6b8994f911ff86` | **B** |
| 3–14 | `urbanrenewalcomplete (2).zip` … `(13).zip` (12 files) | 125,765 each | 2026-07-20 14:51 | `0d6b8994f911ff86` | **B** (exact duplicates) |
| 15 | `urbanrenewalisrael.zip` | 68,751 | 2026-07-20 14:51 | `b0ee11606da774ee` | **C** |
| 16–20 | `urbanrenewalisrael (1).zip` … `(5).zip` (5 files) | 68,751 each | 2026-07-20 14:51 | `b0ee11606da774ee` | **C** (exact duplicates) |
| 21 | `Codex Installer (7).exe` | 1,315,384 | 2026-07-20 14:51 | `af718c66f9028d51` | **D** |

Full hashes:

- Group A: `fecff00a63ab4e43b2a74300680e8cc96b606148c8667b8dce1106ee159864db`
- Group B: `0d6b8994f911ff86751cbd30b100095bcb712141fff9de7152a1c48731a1084a`
- Group C: `b0ee11606da774ee406ba41568c7c961047830e8ae100a9c4bb86defce62de2f`
- Group D: `af718c66f9028d51a89612def34b08896a45c4de698f8321b385903a77f13bf8`

Duplicate detection: **14 `urbanrenewalcomplete*` zips contain only 2 unique payloads** (B ×13
exact copies, A ×1); **6 `urbanrenewalisrael*` zips are 6 exact copies of one payload** (C).
All filesystem mtimes are the repo-clone time (2026-07-20); internal zip entry dates are the true
snapshot dates (below).

## 2. Content summaries (read-only `unzip -l`)

### Group B — `urbanrenewalcomplete.zip` (and 12 identical copies)

- 96 entries, 362,913 bytes uncompressed; internal dates 2026-06-26 → 2026-06-29.
- Paths rooted at `home/user/-/` — i.e. a zip of this very working directory.
- Top-level content: `frontend/` (26 entries), `backend/` (24), `mobile/` (37), `data/` (3,
  incl. `data/sample/sample-taba-projects.csv`, 1,411 B), plus root files.
- This is a **snapshot of the legacy prototype tree** (`frontend/`, `backend/`, `mobile/`,
  `data/`) taken 2026-06-29.

### Group A — `urbanrenewalcomplete (1).zip` (unique, 251,662 B)

- 97 entries, 488,678 bytes uncompressed. Listing is **byte-for-byte the same file list as
  Group B plus exactly one extra entry**: a nested `urbanrenewalcomplete (2).zip` (125,765 B —
  the exact size of the Group B payload). I.e. Group A = the Group B snapshot **with a copy of
  the same zip accidentally zipped inside itself**. No unique source content beyond Group B.

### Group C — `urbanrenewalisrael.zip` (and 5 identical copies)

- 94 entries, 145,806 bytes uncompressed; internal dates 2026-06-25 → 2026-06-29; paths rooted
  at `-/` instead of `home/user/-/`.
- Name-normalized listing diff vs Group B: **identical file set except Group B adds
  `frontend/package-lock.json` and `backend/node/package-lock.json`**, and one file differs
  slightly in size (`ROICalculator.jsx` 10,386 B vs 10,390 B). Group C is an **earlier snapshot
  of the same prototype**, fully superseded by Group B.

### Group D — `Codex Installer (7).exe`

- `file`: "PE32 executable (GUI) Intel 80386 Mono/.Net assembly, for MS Windows, 3 sections".
- A Windows installer for a third-party tool ("Codex"). **Not project source at all**; no
  relationship to the Atlas codebase. Unverifiable provenance; executables in a repo are also a
  supply-chain/security smell (docs/SECURITY.md).

## 3. Are the zips snapshots of this project?

**Yes.** Evidence:

- All zip payload paths mirror this repo's legacy layout (`frontend/`, `backend/node/`,
  `backend/python/`-era files, `mobile/`, `data/sample/`).
- Several files are byte-size-identical between the 2026-06-29 snapshot and today's working
  tree: `backend/node/index.js` (615 B), `backend/node/routes/import.js` (2,347 B),
  `data/sample/sample-taba-projects.csv` (1,411 B).
- Files that differ are simply **newer in the repo** (e.g. `frontend/src/pages/ROICalculator.jsx`
  is 10,390 B in the zip vs 24,042 B in the tree — git history shows the later "complete rewrite"
  commit `f91e18e`). The zips are older states of code whose full evolution is already in git
  history. They carry **zero information not recoverable from git**.

## 4. Recommendation table

**PROPOSAL — no action taken; decision reserved for the human owner.**

| File(s) | Contents | Recommendation | Rationale |
|---|---|---|---|
| Group B (13 files): `urbanrenewalcomplete.zip`, `(2)`–`(13)` | 2026-06-29 prototype snapshot | **Delete** (optionally archive ONE copy outside the repo first) | 13 identical copies; content is an older state of code fully tracked in git; ADR-0008 |
| Group A (1 file): `urbanrenewalcomplete (1).zip` | Same snapshot + the same zip nested inside | **Delete** | Strict superset-by-accident of Group B; no unique source content |
| Group C (6 files): `urbanrenewalisrael.zip`, `(1)`–`(5)` | Earlier (≤2026-06-29) prototype snapshot | **Delete** (optionally archive ONE copy outside the repo first) | 6 identical copies; superseded by Group B and by git history |
| Group D: `Codex Installer (7).exe` | Third-party Windows installer | **Delete** | Not project content; unverifiable binary; security hygiene (docs/SECURITY.md) |

Notes for the decision:

- "Extract-elsewhere" is **not needed for any file**: the zips contain no content absent from git
  history. If maximum caution is desired, copying one exemplar of B and C to storage outside the
  repo before deletion costs ~190 KB.
- Executing any deletion is **ATL-008**, which stays blocked until the human owner approves this
  report (DL-007). Deletion removes the files from the working tree/future commits only; history
  rewriting is a separate, riskier decision not proposed here.
- Total reclaimable working-tree size: ~3.2 MB across 21 files.

## Appendix A — Evidence commands

```
sha256sum *.zip "Codex Installer (7).exe"
stat -c "%n | %s bytes | mtime %y" *.zip "Codex Installer (7).exe"
unzip -l "urbanrenewalcomplete (1).zip"      # 97 files, 488,678 B
unzip -l "urbanrenewalcomplete.zip"          # 96 files, 362,913 B
unzip -l "urbanrenewalisrael.zip"            # 94 files, 145,806 B
file "Codex Installer (7).exe"
# listing-only duplicate/diff analysis (no extraction):
unzip -l <zip> | awk 'NR>3 {print $4}' | sort > /tmp/.../<name>.txt ; diff <a> <b>
stat -c %s frontend/src/pages/ROICalculator.jsx backend/node/index.js  # repo-vs-zip size compare
git log --oneline --all -- frontend/src/pages/ROICalculator.jsx
```

## Appendix B — Proof no legacy file was touched

`git status --porcelain` at report time shows only: modifications under `docs/coordination/*`
(pre-existing, made by the CEO session — not by this task) and new/modified toolchain files from
ATL-007 (`package.json` additive, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `apps/*`, `packages/*`,
`services/analytics/*`, `.github/workflows/ci.yml`, this report). **No entry for `frontend/`,
`backend/`, `mobile/`, `data/`, any `*.zip`, `*.exe`, or `README.md`.** The verbatim output is
recorded in the ATL-007/ATL-009 delivery handoff for QA (ATL-010) to re-verify.
