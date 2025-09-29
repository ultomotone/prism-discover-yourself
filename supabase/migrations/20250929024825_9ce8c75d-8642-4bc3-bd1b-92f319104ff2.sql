-- Create fc_scores table for forced-choice scoring results
CREATE TABLE public.fc_scores (
    session_id uuid NOT NULL,
    version text NOT NULL DEFAULT 'v1.2',
    fc_kind text NOT NULL DEFAULT 'functions',
    scores_json jsonb NOT NULL DEFAULT '{}',
    blocks_answered integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT fc_scores_pkey PRIMARY KEY (session_id, version, fc_kind)
);

-- Enable RLS
ALTER TABLE public.fc_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching other tables)
CREATE POLICY "pub_read_fc_scores" ON public.fc_scores
    FOR SELECT USING (true);

CREATE POLICY "pub_write_fc_scores" ON public.fc_scores
    FOR ALL USING (true)
    WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER fc_scores_updated_at
    BEFORE UPDATE ON public.fc_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();