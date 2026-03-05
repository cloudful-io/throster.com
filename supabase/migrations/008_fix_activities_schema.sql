-- ============================================================================
-- 008_fix_activities_schema.sql
-- Reconcile activities table with the application's expected fields.
-- ============================================================================

-- 1. Add missing columns
ALTER TABLE IF EXISTS public.activities
ADD COLUMN IF NOT EXISTS "date" TEXT,
ADD COLUMN IF NOT EXISTS "time" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT now();

-- 2. Rename max_signups to max_participants if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'max_signups') THEN
    ALTER TABLE public.activities RENAME COLUMN "max_signups" TO "max_participants";
  END IF;
END $$;

-- 3. Cleanup: Remove legacy columns if they are no longer needed
-- (Uncomment these if you are sure you want to remove start_date and end_date)
-- ALTER TABLE public.activities DROP COLUMN IF EXISTS "start_date";
-- ALTER TABLE public.activities DROP COLUMN IF EXISTS "end_date";

-- 4. Add updated_at trigger
DROP TRIGGER IF EXISTS handle_activities_updated_at ON public.activities;
CREATE TRIGGER handle_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
