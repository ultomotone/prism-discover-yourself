-- Update scoring_results table schema for unified approach
-- First drop existing table and recreate with proper structure
DROP TABLE IF EXISTS public.scoring_results CASCADE;

CREATE TABLE public.scoring_results (
  session_id uuid PRIMARY KEY REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  user_id uuid NULL,
  scoring_version text NOT NULL DEFAULT 'v1.2.1',
  computed_at timestamptz NOT NULL DEFAULT now(),
  -- canonical stateless payload (what the UI should consume)
  payload jsonb NOT NULL,
  -- convenience columns for quick filters
  type_code text NULL,
  confidence numeric NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS scoring_results_user_id_idx ON public.scoring_results(user_id);
CREATE INDEX IF NOT EXISTS scoring_results_scoring_version_idx ON public.scoring_results(scoring_version);
CREATE INDEX IF NOT EXISTS scoring_results_computed_at_idx ON public.scoring_results(computed_at);
CREATE INDEX IF NOT EXISTS scoring_results_type_code_idx ON public.scoring_results(type_code);

-- Enable RLS (keep permissive for now)
ALTER TABLE public.scoring_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policy allowing all operations (same as other scoring tables)
CREATE POLICY "allow_all_scoring_results" ON public.scoring_results
  FOR ALL USING (true) WITH CHECK (true);