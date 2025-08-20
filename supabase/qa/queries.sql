-- QA Queries for PRISM v1.1 Scoring

-- A) See fit/share quickly
select
  session_id,
  top_types,
  (type_scores->(top_types->>0)->>'fit_abs')::numeric as top_fit_abs,
  (type_scores->(top_types->>0)->>'share_pct')::numeric as top_share_pct,
  confidence, fit_band, validity_status, version, created_at
from profiles
order by created_at desc
limit 30;

-- B) Count FC vs expected (replace YOUR_SESSION_ID)
with fc as (
  select session_id, count(*) as fc_ct
  from assessment_responses r
  join assessment_scoring_key k using (question_id)
  where r.session_id = 'YOUR_SESSION_ID'
    and k.scale_type like 'FORCED_CHOICE%'
  group by 1
)
select f.fc_ct, c.value->>'fc_expected_min' as expected_min
from fc f
left join scoring_config c on c.key='fc_expected_min';

-- C) Rebuild S (Likert-only sanity)
select
  k.tag, avg(
    case
      when k.reverse_scored then 6 - (r.answer_value::numeric)
      else (r.answer_value::numeric)
    end
  ) as mean_raw_1_5
from assessment_responses r
join assessment_scoring_key k using (question_id)
where r.session_id = 'YOUR_SESSION_ID'
  and k.tag like '%_S'
  and k.scale_type in ('LIKERT_1_5','CATEGORICAL_5','FREQUENCY')
group by k.tag
order by k.tag;
