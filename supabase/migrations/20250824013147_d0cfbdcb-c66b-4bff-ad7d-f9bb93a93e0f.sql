-- Create authoritative assessment_questions table and view + integrity checks
-- 1) Table
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id               integer PRIMARY KEY,
  order_index      integer,
  type             text NOT NULL,                 -- e.g., likert-1-5 | likert-1-7 | forced-choice-2/4/5 | state-1-7 | text | matrix | demographic
  tag              text,                          -- e.g., Ti_S, Fe_S, N, N_R, INC_XYZ_A, SD, AC_*
  scale_type       text,                          -- kept as text for flexibility; mirrors "type" when applicable
  pair_group       text,                          -- for INC_* pairs, e.g., INC_XYZ
  fc_map           jsonb,                         -- forced-choice mapping payload when applicable (e.g., { group: "FC_01", options: [...] })
  reverse_scored   boolean DEFAULT false,
  section          text NOT NULL,                 -- e.g., Core PRISM Functions | Neuroticism Index | Validity & Quality Control | Situational/Work Style
  required         boolean DEFAULT false,
  meta             jsonb DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public._set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assessment_questions_updated_at ON public.assessment_questions;
CREATE TRIGGER trg_assessment_questions_updated_at
BEFORE UPDATE ON public.assessment_questions
FOR EACH ROW EXECUTE FUNCTION public._set_updated_at();

-- 2) RLS: public read, service role manage
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='assessment_questions' AND policyname='Assessment questions are publicly readable'
  ) THEN
    CREATE POLICY "Assessment questions are publicly readable"
    ON public.assessment_questions
    FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='assessment_questions' AND policyname='Only service role can manage assessment questions'
  ) THEN
    CREATE POLICY "Only service role can manage assessment questions"
    ON public.assessment_questions
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- 3) View (authoritative, ordered)
CREATE OR REPLACE VIEW public.assessment_questions_view AS
SELECT 
  q.id,
  q.order_index,
  q.type,
  q.tag,
  q.scale_type,
  q.pair_group,
  q.fc_map,
  q.reverse_scored,
  q.section,
  q.required,
  q.meta,
  q.created_at,
  q.updated_at
FROM public.assessment_questions q
ORDER BY COALESCE(q.order_index, q.id);

-- 4) Helper to get numeric config values out of scoring_config
CREATE OR REPLACE FUNCTION public.get_config_number(p_key text, p_default numeric)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v jsonb;
  n numeric;
BEGIN
  SELECT value INTO v FROM public.scoring_config WHERE key = p_key;
  IF v IS NULL THEN
    RETURN p_default;
  END IF;
  -- value may be a JSON number, cast via text
  BEGIN
    n := (v::text)::numeric;
    RETURN COALESCE(n, p_default);
  EXCEPTION WHEN others THEN
    RETURN p_default;
  END;
END;$$;

-- 5) Integrity check function
CREATE OR REPLACE FUNCTION public.check_question_library_integrity(p_fc_expected_min integer DEFAULT NULL)
RETURNS TABLE(
  ok boolean,
  errors text[],
  warnings text[]
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  errs text[] := ARRAY[]::text[];
  warns text[] := ARRAY[]::text[];
  fc_expected_min integer;
  cnt_fc integer;
  cnt_sd integer;
  cnt_ac integer;
  inc_missing integer;
  required_tags jsonb;
  missing_tags text[] := ARRAY[]::text[];
BEGIN
  -- Load expected min from config if not provided
  fc_expected_min := COALESCE(p_fc_expected_min, public.get_config_number('fc_expected_min', 24)::int);

  -- FC coverage
  SELECT COUNT(*) INTO cnt_fc 
  FROM public.assessment_questions 
  WHERE type LIKE 'forced-choice-%' AND section ILIKE '%Work Style%';
  IF cnt_fc < fc_expected_min THEN
    errs := array_append(errs, format('Insufficient forced-choice coverage: %s < %s', cnt_fc, fc_expected_min));
  END IF;

  -- SD presence (Validity & QC)
  SELECT COUNT(*) INTO cnt_sd
  FROM public.assessment_questions
  WHERE section ILIKE '%Validity%' AND (tag ILIKE 'SD%' OR tag = 'SD');
  IF COALESCE(cnt_sd,0) = 0 THEN
    errs := array_append(errs, 'No Social Desirability (SD) item present');
  END IF;

  -- AC presence (not correctness at library time)
  SELECT COUNT(*) INTO cnt_ac
  FROM public.assessment_questions
  WHERE section ILIKE '%Validity%' AND tag ILIKE 'AC_%';
  IF COALESCE(cnt_ac,0) = 0 THEN
    warns := array_append(warns, 'No Attention Check (AC_*) items present');
  END IF;

  -- Inconsistency pair completeness: every pair_group must have A and B
  SELECT COUNT(*) INTO inc_missing
  FROM (
    SELECT pair_group
    FROM public.assessment_questions
    WHERE section ILIKE '%Validity%' AND tag ILIKE 'INC_%'
      AND pair_group IS NOT NULL
    GROUP BY pair_group
    HAVING COUNT(*) FILTER (WHERE tag ILIKE '%\_A') = 0
        OR COUNT(*) FILTER (WHERE tag ILIKE '%\_B') = 0
  ) t;
  IF COALESCE(inc_missing,0) > 0 THEN
    errs := array_append(errs, format('Missing INC A/B items in %s pair group(s)', inc_missing));
  END IF;

  -- Optional: required tag list from config (array of text)
  SELECT value INTO required_tags FROM public.scoring_config WHERE key = 'required_question_tags';
  IF required_tags IS NOT NULL AND jsonb_typeof(required_tags) = 'array' THEN
    FOR 
      -- iterate over required tag array
      SELECT (jsonb_array_elements_text(required_tags)) AS t
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.assessment_questions WHERE tag = t.t
      ) THEN
        missing_tags := array_append(missing_tags, t.t);
      END IF;
    END LOOP;
    IF array_length(missing_tags,1) IS NOT NULL THEN
      errs := array_cat(errs, ARRAY[format('Missing required tags: %s', array_to_string(missing_tags, ', '))]);
    END IF;
  END IF;

  RETURN QUERY SELECT (array_length(errs,1) IS NULL), errs, warns;
END;$$;

-- 6) Seed: ensure Q1 Email placeholder exists with required=true (id=1)
INSERT INTO public.assessment_questions (id, order_index, type, tag, scale_type, section, required, meta)
VALUES (1, 1, 'text', 'EMAIL', 'text', 'Demographics', true, '{"field":"email"}')
ON CONFLICT (id) DO UPDATE SET required = EXCLUDED.required, section = EXCLUDED.section;

-- Ensure questions 2..16 marked required=false if present
UPDATE public.assessment_questions SET required = false WHERE id BETWEEN 2 AND 16;
