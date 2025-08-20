-- Add unique constraint for profiles session_id to enable proper upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_session ON profiles(session_id);

-- Add QA queries as saved queries (for reference)
/*
A. Find rows still wrong after backfill
select session_id, type_code, top_types,
       (type_scores->(top_types->>0)->>'fit_abs')::numeric as fit_abs,
       version, updated_at
from profiles
where version <> 'v1.1'
   or (type_scores->(top_types->>0)->>'fit_abs')::numeric >= 95
order by updated_at desc
limit 50;

B. Verify we're reading the correct field in UI
select session_id,
       jsonb_pretty(type_scores) as ts,
       top_types, version
from profiles
order by created_at desc
limit 1;

C. Count how many were backfilled
select version, count(*) from profiles group by 1;
*/