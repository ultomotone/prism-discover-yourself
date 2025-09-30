-- 1) Post-results feedback tables
create table if not exists assessment_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  submitted_at timestamptz default now(),
  clarity_overall int check (clarity_overall between 1 and 5),
  engagement int check (engagement between 1 and 5),
  focus_ease int check (focus_ease between 1 and 5),
  perceived_accuracy int check (perceived_accuracy between 1 and 5),
  actionability boolean,
  nps int check (nps between 0 and 10),
  unclear_any boolean,
  unclear_notes text,
  results_resonated text,
  meta jsonb,
  unique(session_id)
);

create table if not exists assessment_feedback_context (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references assessment_feedback(id) on delete cascade,
  age_bucket text,
  industry_bucket text,
  prior_exposure boolean
);

-- 2) Item flags and UI events
create table if not exists assessment_item_flags (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references assessment_sessions(id) on delete cascade,
  question_id integer references assessment_questions(id) on delete cascade,
  flag_type text check (flag_type in ('unclear','offensive','other')) default 'unclear',
  note text,
  created_at timestamptz default now()
);

create table if not exists assessment_ui_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references assessment_sessions(id) on delete cascade,
  question_id integer,
  event_type text check (event_type in ('focus','blur','flag_click','validation_error')),
  meta jsonb,
  created_at timestamptz default now()
);

-- 3) Question versioning and clarity status
alter table assessment_questions
  add column if not exists question_version int default 1,
  add column if not exists clarity_status text
    check (clarity_status in ('ok','review','deprecated')) default 'ok';

-- 4) Entitlements for paid features
create table if not exists entitlements (
  user_id uuid not null,
  product_code text not null,
  active boolean default true,
  granted_at timestamptz default now(),
  primary key (user_id, product_code)
);

-- 5) Materialized views for KPI dashboard

-- Sessions funnel & timing
create materialized view mv_kpi_sessions as
select
  date_trunc('day', s.started_at) as day,
  count(*) as sessions_started,
  count(*) filter (where s.status='completed') as sessions_completed,
  round(
    (avg(extract(epoch from (s.completed_at - s.started_at)) / 60.0) 
     filter (where s.completed_at is not null))::numeric
  , 2) as avg_completion_minutes
from assessment_sessions s
group by 1;

-- Item clarity flags & effort
create materialized view mv_kpi_item_flags as
select 
  q.id as question_id,
  q.section,
  count(f.*) as flags,
  count(r.*) as answered,
  round((count(f.*)::decimal / nullif(count(r.*),0)), 4) as flag_rate
from assessment_questions q
left join assessment_responses r on r.question_id=q.id
left join assessment_item_flags f on f.question_id=q.id
group by 1,2;

-- Item timing
create materialized view mv_kpi_item_timing as
select 
  question_id,
  percentile_disc(0.5) within group (order by response_time_ms) as p50_ms,
  percentile_disc(0.9) within group (order by response_time_ms) as p90_ms
from assessment_responses
where response_time_ms is not null
group by 1;

-- Item discrimination (item-total correlation)
create materialized view mv_kpi_item_discrimination as
with item_scores as (
  select r.session_id, r.question_id, r.answer_numeric::numeric as v
  from assessment_responses r
  where r.answer_numeric is not null
),
scale_sums as (
  select session_id, sum(v) as scale_sum
  from item_scores
  group by 1
)
select 
  i.question_id,
  corr(i.v, (s.scale_sum - i.v)) as item_total_corr
from item_scores i
join scale_sums s using (session_id)
group by 1;

-- Post-results survey KPIs
create materialized view mv_kpi_feedback as
select
  date_trunc('day', f.submitted_at) as day,
  avg(f.clarity_overall) as avg_clarity,
  avg(f.perceived_accuracy) as avg_accuracy,
  avg(f.engagement) as avg_engagement,
  avg(f.focus_ease) as avg_focus,
  avg(f.nps) as avg_nps,
  count(*) as feedback_count,
  avg((f.actionability::int)) as pct_actionable,
  avg((f.unclear_any::int)) as pct_reported_unclear
from assessment_feedback f
group by 1;

-- Scoring health metrics
create materialized view mv_kpi_scoring as
select
  date_trunc('day', p.computed_at) as day,
  avg(p.top_gap) as avg_top_gap,
  avg(p.conf_calibrated) as avg_conf_cal,
  count(*) filter (where p.validity_status='invalid') as invalid_ct,
  count(*) as total_profiles
from profiles p
group by 1;

-- 6) Enable RLS on new tables
alter table assessment_feedback enable row level security;
alter table assessment_feedback_context enable row level security;
alter table assessment_item_flags enable row level security;
alter table assessment_ui_events enable row level security;
alter table entitlements enable row level security;

-- 7) Basic RLS policies
create policy "pub_read_feedback" on assessment_feedback for select using (true);
create policy "pub_write_feedback" on assessment_feedback for insert with check (true);

create policy "pub_read_flags" on assessment_item_flags for select using (true);
create policy "pub_write_flags" on assessment_item_flags for insert with check (true);

create policy "pub_read_events" on assessment_ui_events for select using (true);
create policy "pub_write_events" on assessment_ui_events for insert with check (true);

create policy "users_read_own_entitlements" on entitlements for select using (auth.uid() = user_id);

-- 8) Create indexes for performance
create index idx_feedback_session on assessment_feedback(session_id);
create index idx_feedback_submitted on assessment_feedback(submitted_at);
create index idx_flags_question on assessment_item_flags(question_id);
create index idx_flags_session on assessment_item_flags(session_id);
create index idx_events_session on assessment_ui_events(session_id);
create index idx_events_question on assessment_ui_events(question_id);
create index idx_entitlements_user on entitlements(user_id);