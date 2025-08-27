-- Create helper views for FC analytics
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