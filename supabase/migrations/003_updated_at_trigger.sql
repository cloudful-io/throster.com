-- ============================================================================
-- AUTOMATIC updated_at TRIGGER
-- ============================================================================

-- 1. Create the function to set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Apply the trigger to all existing tables that have an updated_at column
-- This ensures that even if we forget to provide it in code, or if we use
-- the Supabase JS client/Dashboard, the timestamp is always current.

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
      AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS handle_updated_at ON %I;
      CREATE TRIGGER handle_updated_at
      BEFORE UPDATE OR INSERT ON %I
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    ', t, t);
  END LOOP;
END;
$$;
