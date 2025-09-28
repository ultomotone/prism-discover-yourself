-- Clean reboot migration: Remove analytics sprawl, keep foundation tables

-- Drop analytics views (no longer needed with stateless approach)
DROP VIEW IF EXISTS public.v_dim_coverage CASCADE;
DROP VIEW IF EXISTS public.v_fc_coverage CASCADE;
DROP VIEW IF EXISTS public.v_incomplete_sessions CASCADE;
DROP VIEW IF EXISTS public.v_item_stats CASCADE;
DROP VIEW IF EXISTS public.v_method_agreement_prep CASCADE;
DROP VIEW IF EXISTS public.v_recent_assessments_safe CASCADE;
DROP VIEW IF EXISTS public.v_section_progress CASCADE;
DROP VIEW IF EXISTS public.v_section_time CASCADE;
DROP VIEW IF EXISTS public.v_section_times CASCADE;
DROP VIEW IF EXISTS public.v_state_index CASCADE;
DROP VIEW IF EXISTS public.v_user_sessions_chrono CASCADE;

-- Drop unnecessary operational tables
DROP TABLE IF EXISTS public.rate_limits CASCADE;
DROP TABLE IF EXISTS public._write_probe CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Keep scoring_config table as-is since it has different structure than scoring_configs
-- (scoring_config has key/value pairs, scoring_configs has versioned JSON configs)

-- Add status constraint to assessment_sessions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'valid_status' 
        AND conrelid = 'public.assessment_sessions'::regclass
    ) THEN
        ALTER TABLE public.assessment_sessions 
        ADD CONSTRAINT valid_status 
        CHECK (status IN ('in_progress', 'completed', 'abandoned'));
    END IF;
END $$;

-- Ensure assessment_responses has proper foreign key constraints
ALTER TABLE public.assessment_responses
DROP CONSTRAINT IF EXISTS assessment_responses_session_id_fkey;

ALTER TABLE public.assessment_responses
ADD CONSTRAINT assessment_responses_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(id) ON DELETE CASCADE;

-- Ensure fc_responses has proper foreign key constraints  
ALTER TABLE public.fc_responses
DROP CONSTRAINT IF EXISTS fc_responses_session_id_fkey,
DROP CONSTRAINT IF EXISTS fc_responses_block_id_fkey,
DROP CONSTRAINT IF EXISTS fc_responses_option_id_fkey;

ALTER TABLE public.fc_responses
ADD CONSTRAINT fc_responses_session_id_fkey
FOREIGN KEY (session_id) REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
ADD CONSTRAINT fc_responses_block_id_fkey
FOREIGN KEY (block_id) REFERENCES public.fc_blocks(id) ON DELETE CASCADE,
ADD CONSTRAINT fc_responses_option_id_fkey
FOREIGN KEY (option_id) REFERENCES public.fc_options(id) ON DELETE CASCADE;

-- Ensure fc_options has proper foreign key constraint
ALTER TABLE public.fc_options
DROP CONSTRAINT IF EXISTS fc_options_block_id_fkey;

ALTER TABLE public.fc_options
ADD CONSTRAINT fc_options_block_id_fkey
FOREIGN KEY (block_id) REFERENCES public.fc_blocks(id) ON DELETE CASCADE;

-- Add indexes for performance on key lookup patterns
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session_question 
ON public.assessment_responses(session_id, question_id);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status 
ON public.assessment_sessions(status);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_share_token 
ON public.assessment_sessions(share_token) WHERE share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fc_responses_session 
ON public.fc_responses(session_id);

-- Optimize fn_logs structure for better performance
ALTER TABLE public.fn_logs 
ADD COLUMN IF NOT EXISTS level text DEFAULT 'info',
ADD COLUMN IF NOT EXISTS msg text;

-- Create index on fn_logs for queries
CREATE INDEX IF NOT EXISTS idx_fn_logs_evt_at ON public.fn_logs(evt, at DESC);

-- Success message
INSERT INTO public.fn_logs (evt, payload) 
VALUES ('schema_reboot', jsonb_build_object(
    'action', 'clean_reboot_complete',
    'removed_tables', ARRAY['rate_limits', '_write_probe', 'users'],
    'removed_views', ARRAY['v_dim_coverage', 'v_fc_coverage', 'v_incomplete_sessions', 'v_item_stats', 'v_method_agreement_prep', 'v_recent_assessments_safe', 'v_section_progress', 'v_section_time', 'v_section_times', 'v_state_index', 'v_user_sessions_chrono'],
    'approach', 'stateless_scoring',
    'foundation_tables', ARRAY['assessment_sessions', 'assessment_responses', 'fc_responses', 'assessment_questions', 'assessment_scoring_key', 'fc_blocks', 'fc_options', 'scoring_configs', 'scoring_config', 'type_prototypes', 'calibration_model', 'kb_definitions', 'kb_types', 'country_mapping', 'fn_logs'],
    'timestamp', now()
));