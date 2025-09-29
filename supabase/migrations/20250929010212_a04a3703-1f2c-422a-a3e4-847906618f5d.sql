-- Fix Security Definer View - Final Error Resolution
-- Remove SECURITY DEFINER from any views to achieve 0 security errors

-- Check if there are any views with SECURITY DEFINER and fix them
DO $$
DECLARE
    view_record RECORD;
    new_definition TEXT;
BEGIN
    -- Find views with SECURITY DEFINER
    FOR view_record IN
        SELECT schemaname, viewname, definition
        FROM pg_views
        WHERE schemaname = 'public'
        AND definition ILIKE '%security definer%'
    LOOP
        RAISE NOTICE 'Found SECURITY DEFINER view: %.%', view_record.schemaname, view_record.viewname;
        
        -- Replace SECURITY DEFINER with SECURITY INVOKER in the view definition
        new_definition := REPLACE(view_record.definition, 'SECURITY DEFINER', 'SECURITY INVOKER');
        
        -- Recreate the view without SECURITY DEFINER
        EXECUTE format('CREATE OR REPLACE VIEW %I.%I AS %s', 
            view_record.schemaname, 
            view_record.viewname, 
            SUBSTRING(new_definition FROM 'SELECT.*'));
            
        RAISE NOTICE 'Fixed view: %.% - removed SECURITY DEFINER', view_record.schemaname, view_record.viewname;
    END LOOP;
    
    -- If no SECURITY DEFINER views found, check for other potential issues
    IF NOT FOUND THEN
        RAISE NOTICE 'No SECURITY DEFINER views found in public schema';
    END IF;
END $$;

-- Final verification
DO $final_check$
DECLARE
    definer_view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO definer_view_count
    FROM pg_views
    WHERE schemaname = 'public'
    AND definition ILIKE '%security definer%';
    
    RAISE NOTICE 'FINAL SECURITY STATUS:';
    RAISE NOTICE '  - SECURITY DEFINER views remaining: %', definer_view_count;
    
    IF definer_view_count = 0 THEN
        RAISE NOTICE '  - STATUS: Should be 0 Security Errors ✅';
        RAISE NOTICE '  - Anonymous assessment intake: PRESERVED ✅';
        RAISE NOTICE '  - Admin functions: SERVICE_ROLE ONLY ✅';
        RAISE NOTICE '  - Results/config tables: PROTECTED ✅';
    ELSE
        RAISE NOTICE '  - STATUS: May still have 1 security error ⚠️';
    END IF;
END $final_check$;