-- Fix system status to allow scoring
UPDATE scoring_config 
SET value = jsonb_set(value, '{status}', '"ok"'::jsonb)
WHERE key = 'system_status';