-- 0001_init.sql — Atlas initial schema (docs/ARCHITECTURE.md, ADR-0004).
-- Forward-only migration. WRITTEN in M1 but NOT EXECUTED anywhere yet: the API
-- runs on in-memory repositories until Postgres is provisioned; the pg
-- repository adapters (repo-pg.ts) throw NOT_IMPLEMENTED until this file is
-- applied by the migration runner introduced with the Postgres task.
--
-- Conventions: money is BIGINT integer agorot (docs/CODING_STANDARDS.md rule
-- 3); rates are decimal fractions; all tenant data carries org_id and every
-- query is org-scoped at the repository layer (docs/SECURITY.md).

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

CREATE TABLE orgs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id         UUID NOT NULL REFERENCES orgs (id),
    email          TEXT NOT NULL,
    -- argon2id (docs/SECURITY.md); hash string carries its own parameters.
    password_hash  TEXT NOT NULL,
    role           TEXT NOT NULL CHECK (role IN ('admin', 'analyst', 'viewer')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_unique ON users (lower(email));
CREATE INDEX users_org_idx ON users (org_id);

CREATE TABLE projects (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                      UUID NOT NULL REFERENCES orgs (id),
    name                        TEXT NOT NULL,
    -- Field names follow the taba glossary (packages/shared/src/taba.ts).
    case_number                 TEXT,
    address                     TEXT,
    city                        TEXT,
    neighborhood                TEXT,
    block                       TEXT,
    parcel                      TEXT,
    building_type               TEXT,
    plan_type                   TEXT,
    status                      TEXT,
    build_year                  INTEGER,
    existing_floors             INTEGER CHECK (existing_floors >= 0),
    proposed_floors             INTEGER CHECK (proposed_floors >= 0),
    existing_units              INTEGER CHECK (existing_units >= 0),
    proposed_units              INTEGER CHECK (proposed_units >= 0),
    lot_area_sqm                NUMERIC(12, 2) CHECK (lot_area_sqm > 0),
    land_value_agorot           BIGINT,
    build_cost_per_sqm_agorot   BIGINT,
    sale_price_per_sqm_agorot   BIGINT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX projects_org_idx ON projects (org_id);
-- Dedup by מספר תיק within an org (PILOT_SCOPE AC-IMP-4).
CREATE UNIQUE INDEX projects_org_case_number_unique
    ON projects (org_id, case_number)
    WHERE case_number IS NOT NULL;

CREATE TABLE scenarios (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id         UUID NOT NULL REFERENCES orgs (id),
    project_id     UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    -- Shapes validated by @atlas/shared zod schemas at the API boundary;
    -- amounts inside are integer agorot.
    apartment_mix  JSONB NOT NULL,
    cost_items     JSONB NOT NULL,
    discount_rate  NUMERIC(7, 6) NOT NULL CHECK (discount_rate >= 0 AND discount_rate <= 1),
    -- Last analytics /v1/simulate response (SimulationResult), null until run.
    result         JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX scenarios_org_idx ON scenarios (org_id);
CREATE INDEX scenarios_project_idx ON scenarios (project_id);
