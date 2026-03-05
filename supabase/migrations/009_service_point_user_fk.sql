-- ============================================================================
-- 009_service_point_user_fk.sql
-- Add missing foreign key relationship between service_point_logs and user_profiles.
-- This enables PostgREST (Supabase) to perform automatic joins for participants.
-- ============================================================================

-- Add the foreign key constraint
-- participant_id in service_point_logs references id in user_profiles
ALTER TABLE IF EXISTS public.service_point_logs
ADD CONSTRAINT service_point_logs_participant_id_fkey
FOREIGN KEY (participant_id)
REFERENCES public.user_profiles(id)
ON DELETE CASCADE;

-- Note: No RLS changes needed as both tables already have tenant-scoped policies.
-- The join will naturally respect the RLS on both sides.
