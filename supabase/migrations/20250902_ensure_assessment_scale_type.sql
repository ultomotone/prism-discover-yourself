-- Ensure enum exists and includes 'META'
DO $$
BEGIN
  -- Create type if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'assessment_scale_type' AND n.nspname = 'public'
  ) THEN
    EXECUTE $ct$
      CREATE TYPE public.assessment_scale_type AS ENUM (
        'LIKERT5',
        'BINARY',
        'RANK',
        'FREE_TEXT',
        'FC',
        'META'
      );
    $ct$;
  END IF;

  -- Add META if type exists but value is missing
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assessment_scale_type') AND
     NOT EXISTS (
       SELECT 1
       FROM pg_enum e
       JOIN pg_type t ON t.oid = e.enumtypid
       WHERE t.typname = 'assessment_scale_type' AND e.enumlabel = 'META'
     )
  THEN
    BEGIN
      ALTER TYPE public.assessment_scale_type ADD VALUE IF NOT EXISTS 'META';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
