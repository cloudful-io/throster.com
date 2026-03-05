-- ============================================================================
-- Throster Multi-Tenant RLS Policies
-- Run AFTER Prisma migrations have created the tables.
-- ============================================================================

-- Helper: get the current authenticated Supabase Auth user ID
-- auth.uid() is a built-in Supabase function that returns the UUID of the
-- currently authenticated user from the JWT.

-- ─── Enable RLS on all tenant-scoped tables ─────────────────────────────────

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_point_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_point_logs ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: get tenant IDs for the current user ───────────────────

CREATE OR REPLACE FUNCTION public.get_user_tenant_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT tenant_id FROM public.user_profiles
  WHERE auth_user_id = auth.uid();
$$;

-- Helper: get user role for a specific tenant
CREATE OR REPLACE FUNCTION public.get_user_role(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.user_profiles
  WHERE auth_user_id = auth.uid() AND tenant_id = p_tenant_id
  LIMIT 1;
$$;

-- ─── Plans (publicly readable, admin-only write) ────────────────────────────

CREATE POLICY "Plans are publicly readable"
  ON plans FOR SELECT
  USING (true);

-- Plans are managed via seed data / admin API only (service role key).
-- No INSERT/UPDATE/DELETE policies for regular users.

-- ─── Tenants ────────────────────────────────────────────────────────────────

CREATE POLICY "Tenants are publicly readable"
  ON tenants FOR SELECT
  USING (true);

CREATE POLICY "Owners can update their tenant"
  ON tenants FOR UPDATE
  USING (public.get_user_role(id) IN ('owner'))
  WITH CHECK (public.get_user_role(id) IN ('owner'));

-- Tenant creation is done via server action with service role key.

-- ─── User Profiles ──────────────────────────────────────────────────────────

CREATE POLICY "Users can view profiles in their tenants"
  ON user_profiles FOR SELECT
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage profiles in their tenant"
  ON user_profiles FOR INSERT
  WITH CHECK (
    public.get_user_role(tenant_id) IN ('owner', 'admin')
  );

CREATE POLICY "Admins can delete profiles in their tenant"
  ON user_profiles FOR DELETE
  USING (
    public.get_user_role(tenant_id) IN ('owner', 'admin')
  );

-- ─── Academic Years ─────────────────────────────────────────────────────────

CREATE POLICY "Users can view academic years in their tenants"
  ON academic_years FOR SELECT
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "Admins can manage academic years"
  ON academic_years FOR ALL
  USING (public.get_user_role(tenant_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_role(tenant_id) IN ('owner', 'admin'));

-- ─── Students ───────────────────────────────────────────────────────────────

CREATE POLICY "Users can view students in their tenants"
  ON students FOR SELECT
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "Parents can insert their own students"
  ON students FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT public.get_user_tenant_ids())
    AND parent_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update their own students"
  ON students FOR UPDATE
  USING (
    parent_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
    OR public.get_user_role(tenant_id) IN ('owner', 'admin')
  );

CREATE POLICY "Admins can manage all students in their tenant"
  ON students FOR DELETE
  USING (public.get_user_role(tenant_id) IN ('owner', 'admin'));

-- ─── School Classes ─────────────────────────────────────────────────────────

CREATE POLICY "Users can view classes in their tenants"
  ON school_classes FOR SELECT
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "Admins can manage classes"
  ON school_classes FOR ALL
  USING (public.get_user_role(tenant_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_role(tenant_id) IN ('owner', 'admin'));

-- ─── Enrollments ────────────────────────────────────────────────────────────

-- Enrollments inherit tenant scope through the student → tenant relationship.
-- We ALSO need to verify the student belongs to the user's tenant.

CREATE POLICY "Users can view enrollments for their tenant's students"
  ON enrollments FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE tenant_id IN (SELECT public.get_user_tenant_ids())
    )
  );

CREATE POLICY "Parents can enroll their own students"
  ON enrollments FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT s.id FROM students s
      JOIN user_profiles up ON up.id = s.parent_id
      WHERE up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage enrollments"
  ON enrollments FOR ALL
  USING (
    student_id IN (
      SELECT id FROM students
      WHERE public.get_user_role(tenant_id) IN ('owner', 'admin')
    )
  );

-- ─── Activities ─────────────────────────────────────────────────────────────

CREATE POLICY "Users can view activities in their tenants"
  ON activities FOR SELECT
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "Admins can manage activities"
  ON activities FOR ALL
  USING (public.get_user_role(tenant_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_role(tenant_id) IN ('owner', 'admin'));

-- ─── Activity Signups ───────────────────────────────────────────────────────

CREATE POLICY "Users can view activity signups in their tenant"
  ON activity_signups FOR SELECT
  USING (
    activity_id IN (
      SELECT id FROM activities WHERE tenant_id IN (SELECT public.get_user_tenant_ids())
    )
  );

CREATE POLICY "Parents can sign up their students"
  ON activity_signups FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT s.id FROM students s
      JOIN user_profiles up ON up.id = s.parent_id
      WHERE up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage activity signups"
  ON activity_signups FOR ALL
  USING (
    activity_id IN (
      SELECT id FROM activities
      WHERE public.get_user_role(tenant_id) IN ('owner', 'admin')
    )
  );

-- ─── Fundraisers ────────────────────────────────────────────────────────────

CREATE POLICY "Users can view fundraisers in their tenants"
  ON fundraisers FOR SELECT
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "Admins can manage fundraisers"
  ON fundraisers FOR ALL
  USING (public.get_user_role(tenant_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_role(tenant_id) IN ('owner', 'admin'));

-- ─── Donations ──────────────────────────────────────────────────────────────

CREATE POLICY "Users can view donations in their tenant's fundraisers"
  ON donations FOR SELECT
  USING (
    fundraiser_id IN (
      SELECT id FROM fundraisers WHERE tenant_id IN (SELECT public.get_user_tenant_ids())
    )
  );

CREATE POLICY "Authenticated users can donate"
  ON donations FOR INSERT
  WITH CHECK (
    fundraiser_id IN (
      SELECT id FROM fundraisers WHERE tenant_id IN (SELECT public.get_user_tenant_ids())
    )
  );

-- ─── Service Point Definitions ──────────────────────────────────────────────

CREATE POLICY "Users can view service point definitions in their tenants"
  ON service_point_definitions FOR SELECT
  USING (tenant_id IN (SELECT public.get_user_tenant_ids()));

CREATE POLICY "Admins can manage service point definitions"
  ON service_point_definitions FOR ALL
  USING (public.get_user_role(tenant_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_role(tenant_id) IN ('owner', 'admin'));

-- ─── Service Point Logs ─────────────────────────────────────────────────────

CREATE POLICY "Users can view service point logs in their tenant"
  ON service_point_logs FOR SELECT
  USING (
    definition_id IN (
      SELECT id FROM service_point_definitions
      WHERE tenant_id IN (SELECT public.get_user_tenant_ids())
    )
  );

CREATE POLICY "Admins can log service points"
  ON service_point_logs FOR INSERT
  WITH CHECK (
    definition_id IN (
      SELECT id FROM service_point_definitions
      WHERE public.get_user_role(tenant_id) IN ('owner', 'admin')
    )
  );

CREATE POLICY "Parents can sign up via service points"
  ON service_point_logs FOR INSERT
  WITH CHECK (
    (
      -- Parent can sign up themselves (participant_id matches their profile)
      participant_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
      )
      OR
      -- Parent can sign up their student
      student_id IN (
        SELECT s.id FROM students s
        JOIN user_profiles up ON up.id = s.parent_id
        WHERE up.auth_user_id = auth.uid()
      )
    )
    AND definition_id IN (
      SELECT id FROM service_point_definitions
      WHERE tenant_id IN (SELECT public.get_user_tenant_ids())
    )
  );
