-- up
DO $$
DECLARE
  has_q         boolean;
  has_q_section boolean;
  has_q_meta    boolean;
  ddl           text;
BEGIN
  -- Does assessment_questions exist?
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='assessment_questions'
  ) INTO has_q;

  IF has_q THEN
    -- Does it have a plain 'section' text column?
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='assessment_questions' AND column_name='section'
    ) INTO has_q_section;

    -- Or a JSON/JSONB 'meta' with a section field?
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='assessment_questions' AND column_name='meta'
    ) INTO has_q_meta;
  END IF;

  IF has_q AND has_q_section THEN
    ddl := $SQL$
      CREATE OR REPLACE VIEW public.v_section_times AS
      SELECT
        r.session_id,
        COALESCE(q.section, 'Unknown') AS section,
        MIN(r.created_at)                           AS started_at,
        MAX(r.created_at)                           AS ended_at,
        EXTRACT(epoch FROM (MAX(r.created_at) - MIN(r.created_at)))::int AS duration_sec,
        COUNT(*)                                    AS answers
      FROM public.assessment_responses r
      JOIN public.assessment_questions q ON q.id = r.question_id
      GROUP BY r.session_id, COALESCE(q.section,'Unknown');
    $SQL$;
  ELSIF has_q AND has_q_meta THEN
    ddl := $SQL$
      CREATE OR REPLACE VIEW public.v_section_times AS
      SELECT
        r.session_id,
        COALESCE(q.meta->>'section', 'Unknown') AS section,
        MIN(r.created_at)                           AS started_at,
        MAX(r.created_at)                           AS ended_at,
        EXTRACT(epoch FROM (MAX(r.created_at) - MIN(r.created_at)))::int AS duration_sec,
        COUNT(*)                                    AS answers
      FROM public.assessment_responses r
      JOIN public.assessment_questions q ON q.id = r.question_id
      GROUP BY r.session_id, COALESCE(q.meta->>'section','Unknown');
    $SQL$;
  ELSE
    -- Fallback: build without a section source (keeps migrations green)
    ddl := $SQL$
      CREATE OR REPLACE VIEW public.v_section_times AS
      SELECT
        r.session_id,
        'Unknown'                                   AS section,
        MIN(r.created_at)                           AS started_at,
        MAX(r.created_at)                           AS ended_at,
        EXTRACT(epoch FROM (MAX(r.created_at) - MIN(r.created_at)))::int AS duration_sec,
        COUNT(*)                                    AS answers
      FROM public.assessment_responses r
      GROUP BY r.session_id, 'Unknown';
    $SQL$;
  END IF;

  EXECUTE ddl;
END$$;

-- down
DROP VIEW IF EXISTS public.v_section_times;
