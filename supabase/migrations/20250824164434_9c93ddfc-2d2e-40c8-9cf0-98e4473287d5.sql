-- Add updated_at triggers for proper ordering
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers to key tables
DROP TRIGGER IF EXISTS trg_touch_profiles ON public.profiles;
CREATE TRIGGER trg_touch_profiles 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_sessions ON public.assessment_sessions;
CREATE TRIGGER trg_touch_sessions 
  BEFORE UPDATE ON public.assessment_sessions
  FOR EACH ROW 
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_stats ON public.dashboard_statistics;
CREATE TRIGGER trg_touch_stats 
  BEFORE UPDATE ON public.dashboard_statistics
  FOR EACH ROW 
  EXECUTE FUNCTION public.touch_updated_at();

-- Add trigger for assessment_responses
DROP TRIGGER IF EXISTS trg_touch_responses ON public.assessment_responses;
CREATE TRIGGER trg_touch_responses 
  BEFORE UPDATE ON public.assessment_responses
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure realtime is enabled for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_statistics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scoring_config;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_responses;