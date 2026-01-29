-- =============================================================================
-- Seed script: demo data for local testing
-- =============================================================================
-- Run after deploy.sql (or ensure schema exists). Idempotent: removes existing
-- demo data then re-inserts.
--
-- Demo password for all users and shop logins: demo
--
-- Manage portal (/manage/login):  admin / demo   or   demo / demo
-- Shop admin (e.g. /demo/login):  shopKey demo, acme, or bob-auto  |  password demo
-- Customer status:  /demo/status/demo-job-1  etc.
--
-- Run locally (Docker):
--   docker exec -i auto_status_db psql -U auto_status -d auto_status < scripts/seed.sql
--
-- Or with connection string:
--   psql "postgresql://auto_status:auto_status_pw@localhost:5432/auto_status" -f scripts/seed.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- Clean existing demo data
-- -----------------------------------------------------------------------------
DELETE FROM jobs
WHERE "shopId" IN (SELECT id FROM shops WHERE "shopKey" IN ('demo', 'acme', 'bob-auto'));

DELETE FROM shops WHERE "shopKey" IN ('demo', 'acme', 'bob-auto');
DELETE FROM users WHERE username IN ('admin', 'demo');

-- -----------------------------------------------------------------------------
-- Users (super-admin / manage portal). Password: demo
-- -----------------------------------------------------------------------------
INSERT INTO users (id, username, "passwordHash", "createdAt", "updatedAt")
VALUES
  ('b0000000-0000-4000-8000-000000000001'::uuid, 'admin', crypt('demo', gen_salt('bf')), now(), now()),
  ('b0000000-0000-4000-8000-000000000002'::uuid, 'demo', crypt('demo', gen_salt('bf')), now(), now());

-- -----------------------------------------------------------------------------
-- Shops. Shop login password: demo
-- -----------------------------------------------------------------------------
INSERT INTO shops (
  id, "shopKey", name, phone, hours, "primaryContactName", "passwordHash",
  "requiresVerification", "createdAt", "updatedAt", "deletedAt"
)
VALUES
  (
    'a0000000-0000-4000-8000-000000000001'::uuid,
    'demo',
    'Demo Auto Shop',
    '(555) 123-4567',
    'Mon–Fri 8am–6pm, Sat 9am–2pm',
    'Service Manager',
    crypt('demo', gen_salt('bf')),
    false,
    now(),
    now(),
    NULL
  ),
  (
    'a0000000-0000-4000-8000-000000000002'::uuid,
    'acme',
    'Acme Auto Service',
    '(555) 987-6543',
    'Mon–Fri 7am–5pm',
    'Mike',
    crypt('demo', gen_salt('bf')),
    false,
    now(),
    now(),
    NULL
  ),
  (
    'a0000000-0000-4000-8000-000000000003'::uuid,
    'bob-auto',
    'Bob''s Auto Repair',
    '(555) 246-8135',
    'Mon–Sat 8am–5pm',
    'Bob',
    crypt('demo', gen_salt('bf')),
    true,
    now(),
    now(),
    NULL
  );

-- -----------------------------------------------------------------------------
-- Jobs (per shop). Tokens are unique.
-- -----------------------------------------------------------------------------
INSERT INTO jobs (
  id, token, "customerContact", "customerPhoneLast4", "vehicleLabel",
  "stateKey", "flagKey", active, "shopId", "createdAt", "updatedAt"
)
VALUES
  -- Demo shop
  (gen_random_uuid(), 'demo-job-1', '+1 555-111-1001', '1001', '2022 Honda Civic', 'CHECKED_IN', 'NONE', true, 'a0000000-0000-4000-8000-000000000001'::uuid, now(), now()),
  (gen_random_uuid(), 'demo-job-2', '+1 555-111-1002', '1002', '2019 Toyota Camry', 'DIAGNOSIS', 'NONE', true, 'a0000000-0000-4000-8000-000000000001'::uuid, now(), now()),
  (gen_random_uuid(), 'demo-job-3', 'customer3@example.com', NULL, '2020 Ford F-150', 'AWAITING_APPROVAL', 'CALL_US', true, 'a0000000-0000-4000-8000-000000000001'::uuid, now(), now()),
  (gen_random_uuid(), 'demo-job-4', '+1 555-111-1004', '1004', '2018 Chevy Malibu', 'REPAIR', 'NONE', true, 'a0000000-0000-4000-8000-000000000001'::uuid, now(), now()),
  (gen_random_uuid(), 'demo-job-5', '+1 555-111-1005', '1005', '2021 Nissan Rogue', 'READY', 'NONE', true, 'a0000000-0000-4000-8000-000000000001'::uuid, now(), now()),
  (gen_random_uuid(), 'demo-job-6', '+1 555-111-1006', '1006', '2017 Hyundai Elantra', 'QC', 'NONE', false, 'a0000000-0000-4000-8000-000000000001'::uuid, now(), now()),
  -- Acme
  (gen_random_uuid(), 'acme-job-1', '+1 555-222-2001', '2001', '2023 Tesla Model 3', 'CHECKED_IN', 'NONE', true, 'a0000000-0000-4000-8000-000000000002'::uuid, now(), now()),
  (gen_random_uuid(), 'acme-job-3', 'acme3@example.com', NULL, '2019 VW Golf', 'READY', 'NONE', true, 'a0000000-0000-4000-8000-000000000002'::uuid, now(), now()),
  -- Bob's
  (gen_random_uuid(), 'bob-job-1', '+1 555-333-3001', '3001', '2022 Mazda CX-5', 'DIAGNOSIS', 'NONE', true, 'a0000000-0000-4000-8000-000000000003'::uuid, now(), now()),
  (gen_random_uuid(), 'bob-job-2', '+1 555-333-3002', '3002', '2021 Kia Sportage', 'AWAITING_APPROVAL', 'WAITING_ON_CUSTOMER', true, 'a0000000-0000-4000-8000-000000000003'::uuid, now(), now());
