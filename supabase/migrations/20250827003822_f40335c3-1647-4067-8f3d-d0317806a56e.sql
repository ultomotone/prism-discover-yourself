-- Enable RLS and add policies for FC module + helper views

-- Enable RLS
ALTER TABLE public.fc_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fc_scores ENABLE ROW LEVEL SECURITY;

-- fc_blocks: public read, service manage
DROP POLICY IF EXISTS "FC blocks are publicly readable" ON public.fc_blocks;
CREATE POLICY "FC blocks are publicly readable" ON public.fc_blocks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role can manage fc_blocks" ON public.fc_blocks;
CREATE POLICY "Service role can manage fc_blocks" ON public.fc_blocks FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- fc_options: public read, service manage
DROP POLICY IF EXISTS "FC options are publicly readable" ON public.fc_options;
CREATE POLICY "FC options are publicly readable" ON public.fc_options FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role can manage fc_options" ON public.fc_options;
CREATE POLICY "Service role can manage fc_options" ON public.fc_options FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- fc_scores: public read, service manage
DROP POLICY IF EXISTS "FC scores are publicly readable" ON public.fc_scores;
CREATE POLICY "FC scores are publicly readable" ON public.fc_scores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role can manage fc_scores" ON public.fc_scores;
CREATE POLICY "Service role can manage fc_scores" ON public.fc_scores FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- fc_responses: insert for anyone; update for owner/anonymous; select for owner; service manage
DROP POLICY IF EXISTS "Anyone can insert fc_responses" ON public.fc_responses;
CREATE POLICY "Anyone can insert fc_responses" ON public.fc_responses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for session owner or anonymous (fc_responses)" ON public.fc_responses;
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

DROP POLICY IF EXISTS "Users can view their session fc_responses" ON public.fc_responses;
CREATE POLICY "Users can view their session fc_responses" ON public.fc_responses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assessment_sessions s
    WHERE s.id = fc_responses.session_id AND s.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Service role can manage fc_responses" ON public.fc_responses;
CREATE POLICY "Service role can manage fc_responses" ON public.fc_responses FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Helper views
CREATE OR REPLACE VIEW public.v_fc_coverage AS
select
  r.session_id,
  count(*) as fc_answered,
  (select count(*) from public.fc_blocks b where b.is_active) as fc_total,
  round(100.0 * count(*) / nullif((select count(*) from public.fc_blocks b where b.is_active),0), 1) as fc_pct
from public.fc_responses r
group by r.session_id;

CREATE OR REPLACE VIEW public.v_fc_option_dist AS
select o.block_id, o.option_code, count(r.*) as n
from public.fc_options o
left join public.fc_responses r on r.option_id = o.id
group by 1,2
order by 1,2;