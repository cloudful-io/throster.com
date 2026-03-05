-- ============================================================================
-- 007_student_parent_fk.sql
-- Add missing foreign key relationship between students and user_profiles.
-- This enables PostgREST (Supabase) to perform automatic joins for parents.
-- ============================================================================

-- Add the foreign key constraint
-- parent_id in students references id in user_profiles
ALTER TABLE IF EXISTS public.students
ADD CONSTRAINT students_parent_id_fkey
FOREIGN KEY (parent_id)
REFERENCES public.user_profiles(id)
ON DELETE CASCADE;

-- Note: No RLS changes needed as both tables already have tenant-scoped policies.
-- The join will naturally respect the RLS on both sides.
