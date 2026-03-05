-- ============================================================================
-- 004_billing_table.sql
-- Separate sensitive billing IDs from the public tenants table.
-- ============================================================================

-- 1. Create the tenant_billing table
CREATE TABLE IF NOT EXISTS public.tenant_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID UNIQUE NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 1b. Cleanup: Remove legacy sensitive columns from the tenants table
-- (Run this AFTER verifying the new table is working)
ALTER TABLE public.tenants DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.tenants DROP COLUMN IF EXISTS subscription_id;

-- 2. Add updated_at trigger for automatic management
-- (Assumes set_updated_at() function from 003 already exists)
DROP TRIGGER IF EXISTS handle_billing_updated_at ON public.tenant_billing;
CREATE TRIGGER handle_billing_updated_at
BEFORE UPDATE OR INSERT ON public.tenant_billing
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 3. Enable Row-Level Security
ALTER TABLE public.tenant_billing ENABLE ROW LEVEL SECURITY;

-- 4. Set up RLS Policies
-- ONLY THE OWNER of the tenant or the SERVICE ROLE can see their own billing data.
-- Anon and generic authenticated users (parents/students) CANNOT see this.

CREATE POLICY "Owners can view their own tenant billing"
  ON tenant_billing FOR SELECT
  USING (public.get_user_role(tenant_id) IN ('owner'));

CREATE POLICY "Owners can update their own tenant billing"
  ON tenant_billing FOR UPDATE
  USING (public.get_user_role(tenant_id) IN ('owner'))
  WITH CHECK (public.get_user_role(tenant_id) IN ('owner'));

-- 5. Revoke sensitive column access from PUBLIC roles even if RLS is disabled
REVOKE ALL ON public.tenant_billing FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.tenant_billing TO authenticated; 
-- (Policy still restricts the rows, but GRANT is needed for the user role to try)
