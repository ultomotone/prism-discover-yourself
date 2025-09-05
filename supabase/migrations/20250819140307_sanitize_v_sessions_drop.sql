-- Skip legacy DROP VIEW on v_sessions when dependents exist
DO $$
BEGIN
  IF to_regclass('public.v_sessions') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM pg_depend d
      WHERE d.refobjid = 'public.v_sessions'::regclass
        AND d.deptype IN ('n','a','i')
    ) THEN
      RAISE NOTICE 'Skipping drop of public.v_sessions: dependent objects present.';
    ELSE
      EXECUTE 'DROP VIEW public.v_sessions';
    END IF;
  ELSE
    RAISE NOTICE 'Skipping drop: public.v_sessions not present.';
  END IF;
END
$$;
