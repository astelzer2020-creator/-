# ADR-0008: No binaries or archives in git

**Status:** Accepted · 2026-07-21

## Context
The repository root currently contains ~20 zip archives (`urbanrenewalcomplete*.zip`,
`urbanrenewalisrael*.zip`) and a 1.3 MB Windows installer (`Codex Installer (7).exe`) — roughly 3 MB of
opaque, unversionable content that every clone downloads forever. Some archives may predate the current
code; none are part of the build.

## Decision
Binaries, archives, and installers do not belong in git. `.gitignore` now blocks `*.zip` and `*.exe`.
The existing files are **flagged for removal but not deleted unilaterally** — the owner must confirm
none contain unique work (they appear to be snapshots of this same project), then they are removed in
one commit. Anything worth keeping goes to object storage or a release artifact.

## Consequences
- Repo stays clonable in seconds; diffs stay reviewable; no accidental shipping of stale snapshots.
- Requires a one-time confirmation + cleanup commit (tracked on the workboard as ATL-008).

## Alternatives rejected
- **Git LFS:** solves storing large files we do not actually want at all.
- **Delete immediately:** they might contain un-pushed work; destructive actions need owner confirmation.
