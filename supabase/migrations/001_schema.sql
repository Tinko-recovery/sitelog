-- SiteLog Schema Migration
-- Run this first in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── TENANTS ────────────────────────────────────────────────────────────────
CREATE TABLE public.tenants (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT        NOT NULL,
  slug                     TEXT        UNIQUE NOT NULL,
  plan                     TEXT        NOT NULL DEFAULT 'trial'
                                       CHECK (plan IN ('trial', 'starter', 'pro')),
  subscription_status      TEXT        CHECK (subscription_status IN
                                         ('active', 'read_only', 'cancelled', 'trial'))
                                       DEFAULT 'trial',
  razorpay_subscription_id TEXT,
  referred_by_code         TEXT,
  trial_ends_at            TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TENANT USERS ───────────────────────────────────────────────────────────
CREATE TABLE public.tenant_users (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID  NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id     UUID  NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,
  role        TEXT  NOT NULL CHECK (role IN ('viewer', 'operator', 'master')),
  name        TEXT,
  phone       TEXT,
  language    TEXT  NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'kn')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)   -- one user belongs to exactly one tenant
);

-- ─── SITES ──────────────────────────────────────────────────────────────────
CREATE TABLE public.sites (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID    NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  location    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BUDGETS ────────────────────────────────────────────────────────────────
CREATE TABLE public.budgets (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID    NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  site_id           UUID    NOT NULL REFERENCES public.sites(id)   ON DELETE CASCADE,
  category          TEXT    NOT NULL CHECK (category IN ('material', 'labour', 'service')),
  item_name         TEXT    NOT NULL,
  expected_qty      NUMERIC,
  expected_unit     TEXT,
  expected_rate     NUMERIC,
  expected_total    NUMERIC,
  quotation_source  TEXT    CHECK (quotation_source IN ('engineer', 'contractor')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ENTRIES ────────────────────────────────────────────────────────────────
CREATE TABLE public.entries (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID    NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  site_id       UUID    NOT NULL REFERENCES public.sites(id)   ON DELETE CASCADE,
  category      TEXT    NOT NULL CHECK (category IN ('material', 'labour', 'service')),
  entry_date    DATE    NOT NULL,
  item_name     TEXT    NOT NULL,
  quantity      NUMERIC,
  unit          TEXT,
  rate          NUMERIC,
  total_amount  NUMERIC NOT NULL,
  vendor_name   TEXT,
  bill_number   TEXT,
  notes         TEXT,
  status        TEXT    NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by  UUID    REFERENCES public.tenant_users(id),
  reviewed_by   UUID    REFERENCES public.tenant_users(id),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LABOUR ENTRIES ─────────────────────────────────────────────────────────
CREATE TABLE public.labour_entries (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID    NOT NULL REFERENCES public.tenants(id)  ON DELETE CASCADE,
  entry_id    UUID    NOT NULL REFERENCES public.entries(id)  ON DELETE CASCADE,
  headcount   INTEGER NOT NULL,
  work_type   TEXT,
  daily_rate  NUMERIC,
  total_days  NUMERIC
);

-- ─── ATTACHMENTS ────────────────────────────────────────────────────────────
CREATE TABLE public.attachments (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID    NOT NULL REFERENCES public.tenants(id)  ON DELETE CASCADE,
  entry_id         UUID    NOT NULL REFERENCES public.entries(id)  ON DELETE CASCADE,
  attachment_type  TEXT    NOT NULL CHECK (attachment_type IN ('bill', 'site_photo', 'other')),
  storage_path     TEXT    NOT NULL,
  ocr_raw_text     TEXT,
  ocr_validated    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AUDIT LOG ──────────────────────────────────────────────────────────────
CREATE TABLE public.audit_log (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID  NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  entry_id      UUID  REFERENCES public.entries(id) ON DELETE SET NULL,
  action        TEXT  NOT NULL CHECK (action IN ('created', 'edited', 'approved', 'rejected')),
  performed_by  UUID  REFERENCES public.tenant_users(id),
  old_values    JSONB,
  new_values    JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PARTNERS ───────────────────────────────────────────────────────────────
CREATE TABLE public.partners (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT    NOT NULL,
  phone            TEXT    NOT NULL,
  referral_code    TEXT    UNIQUE NOT NULL,
  commission_rate  NUMERIC NOT NULL DEFAULT 5.0,
  bank_details     JSONB,
  upi_id           TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PARTNER COMMISSIONS ────────────────────────────────────────────────────
CREATE TABLE public.partner_commissions (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id          UUID    NOT NULL REFERENCES public.partners(id)  ON DELETE CASCADE,
  tenant_id           UUID    NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  month               TEXT    NOT NULL,   -- YYYY-MM
  subscription_amount NUMERIC,
  commission_amount   NUMERIC,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUPER ADMINS ───────────────────────────────────────────────────────────
CREATE TABLE public.super_admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ────────────────────────────────────────────────────────────────
CREATE INDEX idx_tenant_users_user_id    ON public.tenant_users(user_id);
CREATE INDEX idx_tenant_users_tenant_id  ON public.tenant_users(tenant_id);
CREATE INDEX idx_sites_tenant_id         ON public.sites(tenant_id);
CREATE INDEX idx_entries_tenant_id       ON public.entries(tenant_id);
CREATE INDEX idx_entries_site_id         ON public.entries(site_id);
CREATE INDEX idx_entries_status          ON public.entries(status);
CREATE INDEX idx_entries_entry_date      ON public.entries(entry_date);
CREATE INDEX idx_budgets_site_id         ON public.budgets(site_id);
CREATE INDEX idx_attachments_entry_id    ON public.attachments(entry_id);
CREATE INDEX idx_audit_log_tenant_id     ON public.audit_log(tenant_id);
CREATE INDEX idx_audit_log_entry_id      ON public.audit_log(entry_id);
CREATE INDEX idx_labour_entries_entry_id ON public.labour_entries(entry_id);
