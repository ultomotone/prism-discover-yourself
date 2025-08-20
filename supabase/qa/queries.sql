-- QA Queries for PRISM v1.1 backfill verification

-- A. Find rows still wrong after backfill
select session_id, type_code, top_types,
       (type_scores->(top_types->>0)->>'fit_abs')::numeric as fit_abs,
       version, updated_at
from profiles
where version <> 'v1.1'
   or (type_scores->(top_types->>0)->>'fit_abs')::numeric >= 95
order by updated_at desc
limit 50;

-- B. Verify we're reading the correct field in UI (paste result into console when viewing the same row)
select session_id,
       jsonb_pretty(type_scores) as ts,
       top_types, version
from profiles
order by created_at desc
limit 1;

-- C. Count how many were backfilled
select version, count(*) from profiles group by 1;

-- D. Show recent assessments with v1.1 data
select 
  session_id,
  type_code,
  overlay,
  (type_scores->(top_types->>0)->>'fit_abs')::numeric as fit_abs,
  (type_scores->(top_types->>0)->>'share_pct')::numeric as share_pct,
  fit_band,
  confidence,
  version,
  created_at
from profiles
where created_at >= CURRENT_DATE - INTERVAL '1 day'
order by created_at desc
limit 20;

-- E. Compare pre-v1.1 vs v1.1 fit scores
select 
  version,
  count(*) as count,
  round(avg((type_scores->(top_types->>0)->>'fit_abs')::numeric), 1) as avg_fit,
  round(min((type_scores->(top_types->>0)->>'fit_abs')::numeric), 1) as min_fit,
  round(max((type_scores->(top_types->>0)->>'fit_abs')::numeric), 1) as max_fit
from profiles
where type_scores is not null and top_types is not null
group by version
order by version;