-- Phase 3: Add configuration for partial session support and enhanced JSON validation

INSERT INTO scoring_config (key, value) VALUES
('partial_session_enabled', 'true'::jsonb),
('partial_session_min_completion_rate', '0.3'::jsonb),
('json_validation_enabled', 'true'::jsonb)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();