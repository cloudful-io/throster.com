-- ============================================================================
-- 006_class_teacher_fk.sql
-- Add missing foreign key relationship between school_classes and user_profiles.
-- This enables PostgREST (Supabase) to perform automatic joins for teachers.
-- ============================================================================

-- Add the foreign key constraint
-- teacher_id in school_classes references id in user_profiles
ALTER TABLE IF EXISTS public.school_classes
ADD CONSTRAINT school_classes_teacher_id_fkey
FOREIGN KEY (teacher_id)
REFERENCES public.user_profiles(id)
ON DELETE SET NULL;

-- Note: No RLS changes needed as both tables already have tenant-scoped policies.
-- The join will naturally respect the RLS on both sides.
