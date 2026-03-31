-- SiteLog JWT Custom Claims Hook
-- Run after 001_schema.sql and 002_rls.sql
--
-- After running this migration, register the hook in Supabase Dashboard:
--   Authentication → Hooks → Custom Access Token Hook
--   Set function to: public.custom_access_token_hook
--
-- This hook fires on every token issue/refresh and injects
-- tenant_id and role into the JWT so RLS policies can use them.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims       jsonb;
  v_tenant_id  uuid;
  v_role       text;
BEGIN
  claims := event -> 'claims';

  -- Look up tenant and role for this user
  SELECT
    tu.tenant_id,
    tu.role
  INTO v_tenant_id, v_role
  FROM public.tenant_users tu
  WHERE tu.user_id = (event ->> 'user_id')::uuid
  LIMIT 1;

  -- Only inject claims if the user has been assigned to a tenant.
  -- New users (mid-onboarding) will not have a tenant yet — their JWT
  -- will lack these claims, and the app routes them to onboarding.
  IF v_tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant_id::text));
    claims := jsonb_set(claims, '{role}',      to_jsonb(v_role));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Required: grant the auth system permission to call this function
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from app-level roles (security hardening)
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- The hook reads tenant_users — grant that access to the auth admin role
GRANT SELECT ON public.tenant_users TO supabase_auth_admin;
