-- migrate:up
CREATE OR REPLACE FUNCTION public.tg_sessions_autocomplete_148()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cnt int;
BEGIN
  SELECT count(*) INTO cnt
  FROM public.assessment_responses
  WHERE session_id = COALESCE(NEW.session_id, OLD.session_id);

  IF cnt >= 148 THEN
    UPDATE public.assessment_sessions
       SET status = 'completed',
           completed_at = COALESCE(completed_at, now()),
           updated_at = now()
     WHERE id = COALESCE(NEW.session_id, OLD.session_id)
       AND status IS DISTINCT FROM 'completed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sessions_autocomplete_148_ins ON public.assessment_responses;
DROP TRIGGER IF EXISTS trg_sessions_autocomplete_148_upd ON public.assessment_responses;

CREATE TRIGGER trg_sessions_autocomplete_148_ins
AFTER INSERT ON public.assessment_responses
FOR EACH ROW EXECUTE FUNCTION public.tg_sessions_autocomplete_148();

CREATE TRIGGER trg_sessions_autocomplete_148_upd
AFTER UPDATE ON public.assessment_responses
FOR EACH ROW EXECUTE FUNCTION public.tg_sessions_autocomplete_148();

UPDATE public.assessment_sessions s
SET status = 'completed',
    completed_at = COALESCE(s.completed_at, now())
WHERE s.status IS DISTINCT FROM 'completed'
  AND (
    SELECT count(*)
    FROM public.assessment_responses r
    WHERE r.session_id = s.id
  ) >= 148;

-- migrate:down
DROP TRIGGER IF EXISTS trg_sessions_autocomplete_148_ins ON public.assessment_responses;
DROP TRIGGER IF EXISTS trg_sessions_autocomplete_148_upd ON public.assessment_responses;
DROP FUNCTION IF EXISTS public.tg_sessions_autocomplete_148();

UPDATE public.assessment_sessions s
SET status = 'in_progress',
    completed_at = NULL
WHERE s.status = 'completed'
  AND (
    SELECT count(*)
    FROM public.assessment_responses r
    WHERE r.session_id = s.id
  ) >= 148;
