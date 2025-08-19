-- Fix the country question ID in scoring_config
UPDATE scoring_config 
SET value = '{"id": 4}'::jsonb 
WHERE key = 'dashboard_country_qid';