-- Add RLS policies for psychometrics_item_stats table

-- Enable RLS on the new table
ALTER TABLE public.psychometrics_item_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access (metrics are not sensitive)
CREATE POLICY "Public read psychometrics_item_stats"
ON public.psychometrics_item_stats
FOR SELECT
USING (true);

-- Service role full access for computation
CREATE POLICY "Service role write psychometrics_item_stats"
ON public.psychometrics_item_stats
FOR ALL
USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text)
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);