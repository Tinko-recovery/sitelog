-- SiteLog RLS Policies
-- Run after 001_schema.sql

-- ─── ENABLE RLS ON ALL TABLES ───────────────────────────────────────────────
ALTER TABLE public.tenants           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins      ENABLE ROW LEVEL SECURITY;

-- ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────

-- Returns the tenant_id from the JWT (set by custom_access_token_hook)
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::uuid
$$;

-- Returns the role from the JWT
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt() ->> 'role'
$$;

-- ─── TENANTS ────────────────────────────────────────────────────────────────
-- Users can only see their own tenant record

CREATE POLICY "tenants_select_own" ON public.tenants
  FOR SELECT TO authenticated
  USING (id = public.current_tenant_id());

-- Tenants are created via service role (signup API) — no INSERT policy for authenticated

-- ─── TENANT USERS ───────────────────────────────────────────────────────────
-- All roles can read members of their tenant
-- Only master can invite/update/remove members

CREATE POLICY "tenant_users_select" ON public.tenant_users
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "tenant_users_insert" ON public.tenant_users
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() = 'master'
  );

CREATE POLICY "tenant_users_update" ON public.tenant_users
  FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id() AND public.current_user_role() = 'master')
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "tenant_users_delete" ON public.tenant_users
  FOR DELETE TO authenticated
  USING (tenant_id = public.current_tenant_id() AND public.current_user_role() = 'master');

-- ─── SITES ──────────────────────────────────────────────────────────────────
-- All roles can read sites; only master can create/update/delete

CREATE POLICY "sites_select" ON public.sites
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "sites_insert" ON public.sites
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() = 'master'
  );

CREATE POLICY "sites_update" ON public.sites
  FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id() AND public.current_user_role() = 'master')
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "sites_delete" ON public.sites
  FOR DELETE TO authenticated
  USING (tenant_id = public.current_tenant_id() AND public.current_user_role() = 'master');

-- ─── BUDGETS ────────────────────────────────────────────────────────────────
-- All roles can read; only master can write

CREATE POLICY "budgets_select" ON public.budgets
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "budgets_insert" ON public.budgets
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() = 'master'
  );

CREATE POLICY "budgets_update" ON public.budgets
  FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id() AND public.current_user_role() = 'master')
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "budgets_delete" ON public.budgets
  FOR DELETE TO authenticated
  USING (tenant_id = public.current_tenant_id() AND public.current_user_role() = 'master');

-- ─── ENTRIES ────────────────────────────────────────────────────────────────
-- All roles can read
-- Operators and masters can insert
-- Operators and masters can update (masters can also approve/reject)
-- Only masters can delete

CREATE POLICY "entries_select" ON public.entries
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "entries_insert" ON public.entries
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('operator', 'master')
  );

CREATE POLICY "entries_update" ON public.entries
  FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('operator', 'master')
  );

CREATE POLICY "entries_delete" ON public.entries
  FOR DELETE TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() = 'master'
  );

-- ─── LABOUR ENTRIES ─────────────────────────────────────────────────────────

CREATE POLICY "labour_entries_select" ON public.labour_entries
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "labour_entries_insert" ON public.labour_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('operator', 'master')
  );

CREATE POLICY "labour_entries_update" ON public.labour_entries
  FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('operator', 'master')
  );

CREATE POLICY "labour_entries_delete" ON public.labour_entries
  FOR DELETE TO authenticated
  USING (tenant_id = public.current_tenant_id() AND public.current_user_role() = 'master');

-- ─── ATTACHMENTS ────────────────────────────────────────────────────────────

CREATE POLICY "attachments_select" ON public.attachments
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "attachments_insert" ON public.attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() IN ('operator', 'master')
  );

-- No UPDATE on attachments — immutable once uploaded

CREATE POLICY "attachments_delete" ON public.attachments
  FOR DELETE TO authenticated
  USING (tenant_id = public.current_tenant_id() AND public.current_user_role() = 'master');

-- ─── AUDIT LOG ──────────────────────────────────────────────────────────────
-- Only masters can read the audit trail
-- All authenticated users can insert (actions are recorded, not user-initiated)
-- No updates or deletes — audit trail is immutable

CREATE POLICY "audit_log_select" ON public.audit_log
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND public.current_user_role() = 'master'
  );

CREATE POLICY "audit_log_insert" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ─── PARTNERS / COMMISSIONS / SUPER ADMINS ──────────────────────────────────
-- No app-level access — these tables are accessed only via the service role key
-- from the Next.js backend super admin endpoints.
-- No policies created for 'authenticated' role intentionally.
