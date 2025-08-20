-- Create trigger to update dashboard statistics when profiles are inserted
CREATE TRIGGER update_dashboard_stats_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_dashboard_stats();