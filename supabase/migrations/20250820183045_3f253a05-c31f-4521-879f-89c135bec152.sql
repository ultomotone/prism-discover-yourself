-- Fix v1.1 backfill: compute calibrated fit from type_scores and create activity view

-- First, let's check if we have type_scores data to work with
-- and create a robust backfill that uses the actual fit data

-- Step 1: Update profiles with calibrated fit from type_scores data
do $$
declare
  p10 numeric; p50 numeric; p90 numeric; span numeric;
  processed_count integer := 0;
begin
  -- Get raw fit scores from type_scores JSON where available
  update profiles p
  set score_fit_raw = (
    case 
      when p.type_scores is not null 
           and p.top_types is not null 
           and jsonb_array_length(p.top_types) > 0
      then coalesce(
        (p.type_scores->(p.top_types->>0)->>'fit_abs')::numeric,
        (p.type_scores->(p.top_types->>0)->>'fit')::numeric
      )
      else p.score_fit_raw
    end
  )
  where p.type_scores is not null 
    and p.top_types is not null
    and p.score_fit_raw is null;

  get diagnostics processed_count = row_count;
  raise notice 'Updated % profiles with raw fit from type_scores', processed_count;

  -- Now compute percentiles for calibration
  select
    percentile_cont(0.10) within group (order by score_fit_raw),
    percentile_cont(0.50) within group (order by score_fit_raw),
    percentile_cont(0.90) within group (order by score_fit_raw)
  into p10, p50, p90
  from profiles
  where score_fit_raw is not null and score_fit_raw > 0;

  span := nullif(p90 - p10, 0);
  
  raise notice 'Calibration points: p10=%, p50=%, p90=%, span=%', p10, p50, p90, span;

  -- Fallback if cohort too narrow: use min/max
  if span is null or span < 5 then
    select min(score_fit_raw), 
           percentile_cont(0.50) within group (order by score_fit_raw), 
           max(score_fit_raw)
    into p10, p50, p90
    from profiles
    where score_fit_raw is not null and score_fit_raw > 0;
    span := greatest(nullif(p90 - p10, 0), 10); -- ensure minimum span
    raise notice 'Used fallback calibration: p10=%, p50=%, p90=%, span=%', p10, p50, p90, span;
  end if;

  -- Calibrate to ~35..75 band; clamp 0..100
  update profiles p
  set
    score_fit_calibrated = greatest(0, least(100,
      round(35 + 40 * ((p.score_fit_raw - p50) / span), 1)
    )),
    results_version = 'v1.1'
  where p.score_fit_raw is not null and p.score_fit_raw > 0;

  get diagnostics processed_count = row_count;
  raise notice 'Calibrated % profiles with new fit scores', processed_count;

  -- Update fit_band based on calibrated score
  update profiles p
  set fit_band = case
    when p.score_fit_calibrated >= 70 then 'High'
    when p.score_fit_calibrated >= 50 then 'Moderate'
    else 'Low'
  end
  where p.score_fit_calibrated is not null;

  get diagnostics processed_count = row_count;
  raise notice 'Updated fit_band for % profiles', processed_count;

end $$;

-- Step 2: Create activity map view for country data
create or replace view v_activity_country_30d as
select
  -- Try to extract country code from responses or use country field
  coalesce(
    upper(nullif(trim(
      coalesce(
        (select ar.answer_value 
         from assessment_responses ar 
         where ar.session_id = p.session_id 
           and ar.question_text ilike '%country%' 
         limit 1),
        p.country
      )
    ), '')),
    'XX'
  ) as iso2,
  coalesce(
    coalesce(
      (select ar.answer_value 
       from assessment_responses ar 
       where ar.session_id = p.session_id 
         and ar.question_text ilike '%country%' 
       limit 1),
      p.country
    ),
    'Unknown'
  ) as country_label,
  count(*) as sessions
from profiles p
where p.created_at >= now() - interval '30 days'
group by 1, 2
having count(*) > 0
order by sessions desc;

-- Step 3: Grant proper RLS permissions for service role updates
create policy "Service role can update profiles for backfill"
on profiles for update
to service_role
using (true)
with check (true);