# ADR-0004: PostgreSQL + PostGIS as system of record; integer agorot for money

**Status:** Accepted · 2026-07-21

## Context
The prototype has **no persistence** — projects live in an in-memory array in the Express process and
vanish on restart. Atlas needs durable multi-user storage for projects, imported plan rows, scenarios,
results, and geographic data (project locations, GeoJSON plan geometries).

## Decision
PostgreSQL 16 with PostGIS is the single system of record. Geometry columns hold project/plan shapes.
Monetary values are stored and transported as **integer agorot** (Decimal in Python); floats appear only
inside numeric algorithms. Raw uploaded files and generated reports go to S3-compatible object storage,
not the database. Migrations are SQL, forward-only.

## Consequences
- Real geo queries (projects within a municipality boundary) come free with PostGIS.
- Financial arithmetic is exact end-to-end; float rounding cannot leak into reports.
- One database technology to operate, back up, and restore at pilot scale.

## Alternatives rejected
- **MongoDB:** the data is relational (projects → scenarios → results) and financial; schemaless storage
  fights both.
- **SQLite:** tempting for a single VM, but PostGIS, concurrent writes, and a managed-Postgres migration
  path (M4) rule it out.
- **Floats for money:** the classic mistake; disqualifying in a product whose output is an investment memo.
