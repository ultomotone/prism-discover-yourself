-- Create trigger to automatically update dashboard statistics when profiles are inserted
CREATE OR REPLACE FUNCTION public.trigger_update_dashboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the update function when a new profile is created
  PERFORM public.update_dashboard_statistics();
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_dashboard_stats();