-- Version Alignment: Update results_version to v1.2.1 (IDEMPOTENT)
UPDATE public.scoring_config 
SET value = '"v1.2.1"'::jsonb,
    updated_at = now()
WHERE key = 'results_version'
  AND value != '"v1.2.1"'::jsonb;

-- Verification query
SELECT key, value, updated_at 
FROM public.scoring_config 
WHERE key = 'results_version';