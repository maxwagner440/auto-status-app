-- =============================================================================
-- Deployment script: auto-status
-- =============================================================================
-- Run when you need to apply schema/data changes (especially those that
-- require backfills or multi-step alters). Append new changes below in order.
--
-- Convention: add a dated section (e.g. "YYYY-MM-DD: description"), then
-- your SQL. Prefer idempotent statements (IF NOT EXISTS, etc.) where possible.
--
-- Run locally (Docker):
--   docker exec -i auto_status_db psql -U auto_status -d auto_status < scripts/deploy.sql
--
-- Or with connection string:
--   psql "postgresql://auto_status:auto_status_pw@localhost:5432/auto_status" -f scripts/deploy.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Create all tables (IF NOT EXISTS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shops (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "shopKey" text NOT NULL DEFAULT gen_random_uuid()::text,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "hours" text NOT NULL,
  "primaryContactName" text NULL,
  "passwordHash" text NOT NULL,
  "requiresVerification" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "deletedAt" timestamptz NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_shops_shopKey" ON shops ("shopKey");

CREATE TABLE IF NOT EXISTS jobs (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "token" text NOT NULL,
  "customerContact" text NOT NULL,
  "customerPhoneLast4" text NULL,
  "vehicleLabel" text NOT NULL,
  "stateKey" text NOT NULL,
  "flagKey" text NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "shopId" uuid NOT NULL REFERENCES shops ("id"),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_jobs_token" ON jobs ("token");

CREATE TABLE IF NOT EXISTS users (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL,
  "passwordHash" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_username" ON users ("username");

-- -----------------------------------------------------------------------------
-- 2026-01-29: Add shops.shopKey (NOT NULL, unique) — no-op if tables created above
-- -----------------------------------------------------------------------------
ALTER TABLE shops ADD COLUMN IF NOT EXISTS "shopKey" text NOT NULL DEFAULT gen_random_uuid()::text;
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_shops_shopKey" ON shops ("shopKey");

-- -----------------------------------------------------------------------------
-- 2026-01-29: Soft-delete for shops ("deletedAt")
-- -----------------------------------------------------------------------------
ALTER TABLE shops ADD COLUMN IF NOT EXISTS "deletedAt" timestamptz NULL;

-- -----------------------------------------------------------------------------
-- 2026-01-29: Backfill NULL shops.passwordHash (legacy rows)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'shops' AND column_name = 'passwordHash'
  ) THEN
    UPDATE shops
    SET "passwordHash" = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    WHERE "passwordHash" IS NULL;
  END IF;
END $$;
