-- Ensure tables are in realtime publication for live updates
-- Only add if not already exists to avoid errors

DO $$
BEGIN
    -- Add assessment_responses to realtime publication if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'assessment_responses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_responses;
    END IF;

    -- Add assessment_sessions to realtime publication if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'assessment_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_sessions;
    END IF;

    -- Add dashboard_statistics to realtime publication if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'dashboard_statistics'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_statistics;
    END IF;

    -- Add profiles to realtime publication if not exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;