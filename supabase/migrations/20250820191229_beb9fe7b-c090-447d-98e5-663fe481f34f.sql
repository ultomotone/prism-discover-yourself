-- Fix calibration clustering with proper type casting
do $$
declare
  mu  numeric;
  sd  numeric;
  min_raw numeric;
  max_raw numeric;
begin
  -- Calculate stats for raw scores  
  select avg(score_fit_raw)::numeric, 
         nullif(stddev_pop(score_fit_raw),0)::numeric,
         min(score_fit_raw)::numeric,
         max(score_fit_raw)::numeric
  into mu, sd, min_raw, max_raw
  from profiles
  where score_fit_raw is not null;

  -- Fallback if sd is null/0: estimate from IQR or use range
  if sd is null or sd = 0 then
    select nullif(percentile_cont(0.75) within group (order by score_fit_raw)
                - percentile_cont(0.25) within group (order by score_fit_raw),0) * 0.7413
    into sd
    from profiles
    where score_fit_raw is not null;
  end if;

  -- Final fallback: use range if still no valid sd
  if sd is null or sd = 0 then
    sd := greatest(1, (max_raw - min_raw) / 4);
  end if;

  -- Update with improved calibration that handles clustering
  update profiles p
  set
    score_fit_calibrated = greatest(0, least(100,
      round((50 + 15 * ((p.score_fit_raw - mu) / sd) + 
            -- Add small random jitter for identical scores to prevent clustering
            (random() - 0.5) * 0.5)::numeric, 1)
    )),
    updated_at = now()
  where p.score_fit_raw is not null and p.results_version = 'v1.1';

  -- Update fit_band based on new calibrated scores
  update profiles 
  set fit_band = case
    when score_fit_calibrated >= 70 then 'High'
    when score_fit_calibrated >= 50 then 'Moderate'
    else 'Low'
  end
  where results_version = 'v1.1' and score_fit_calibrated is not null;

  -- Log the parameters used
  raise notice 'Calibration fixed with mu=%, sd=%, jitter applied', mu, sd;
end $$;