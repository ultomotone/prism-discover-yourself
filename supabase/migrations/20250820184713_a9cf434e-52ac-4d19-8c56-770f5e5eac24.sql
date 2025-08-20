-- Fix calibration algorithm to provide proper spread using z-score normalization
do $$
declare
  mu  numeric;
  sd  numeric;
begin
  -- Calculate mean and standard deviation of raw scores
  select avg(score_fit_raw)::numeric, nullif(stddev_pop(score_fit_raw),0)::numeric
  into mu, sd
  from profiles
  where score_fit_raw is not null;

  -- Fallback if sd is null/0: estimate from IQR  
  if sd is null or sd = 0 then
    select nullif(percentile_cont(0.75) within group (order by score_fit_raw)
                - percentile_cont(0.25) within group (order by score_fit_raw),0) * 0.7413
    into sd
    from profiles
    where score_fit_raw is not null;
  end if;

  -- If still no valid sd, use a minimal spread
  if sd is null or sd = 0 then
    sd := 1;
  end if;

  -- Apply z-score transformation: center at 50, spread of ±15 (roughly 20-80 range)
  update profiles p
  set
    score_fit_calibrated = greatest(0, least(100,
      round(50 + 15 * ((p.score_fit_raw - mu) / sd), 1)
    )),
    fit_band = case
      when greatest(0, least(100, round(50 + 15 * ((p.score_fit_raw - mu) / sd), 1))) >= 70 then 'High'
      when greatest(0, least(100, round(50 + 15 * ((p.score_fit_raw - mu) / sd), 1))) >= 50 then 'Moderate'
      else 'Low'
    end,
    results_version = 'v1.1'
  where p.score_fit_raw is not null;

  -- Log the parameters used
  raise notice 'Calibration completed with mu=%, sd=%', mu, sd;
end $$;

-- Create histogram view for monitoring distribution
create or replace view v_fit_histogram as
select 
  width_bucket(score_fit_calibrated, 0, 100, 10) as bin,
  count(*) as count,
  round(min(score_fit_calibrated), 1) as bin_min,
  round(max(score_fit_calibrated), 1) as bin_max
from profiles
where results_version = 'v1.1' and score_fit_calibrated is not null
group by bin
order by bin;