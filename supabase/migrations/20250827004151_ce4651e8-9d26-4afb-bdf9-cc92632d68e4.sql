-- Enable RLS and add policies for FC module + helper views

-- Enable RLS
ALTER TABLE public.fc_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_scores ENABLE ROW LEVEL SECURITY;

-- fc_blocks: public read, service manage
CREATE POLICY "FC blocks are publicly readable" ON public.fc_blocks FOR SELECT USING (true);
CREATE POLICY "Service role can manage fc_blocks" ON public.fc_blocks FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- fc_options: public read, service manage
CREATE POLICY "FC options are publicly readable" ON public.fc_options FOR SELECT USING (true);
CREATE POLICY "Service role can manage fc_options" ON public.fc_options FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- fc_scores: public read, service manage
CREATE POLICY "FC scores are publicly readable" ON public.fc_scores FOR SELECT USING (true);
CREATE POLICY "Service role can manage fc_scores" ON public.fc_scores FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- fc_responses: insert for anyone; update for owner/anonymous; select for owner; service manage
CREATE POLICY "Anyone can insert fc_responses" ON public.fc_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for session owner or anonymous (fc_responses)" ON public.fc_responses
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions s
    WHERE s.id = fc_responses.session_id
      AND (((s.user_id IS NOT NULL) AND (s.user_id = auth.uid())) OR (s.user_id IS NULL))
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions s
    WHERE s.id = fc_responses.session_id
      AND (((s.user_id IS NOT NULL) AND (s.user_id = auth.uid())) OR (s.user_id IS NULL))
  )
);

CREATE POLICY "Users can view their session fc_responses" ON public.fc_responses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions s
    WHERE s.id = fc_responses.session_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage fc_responses" ON public.fc_responses FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');