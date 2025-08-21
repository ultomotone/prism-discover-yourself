-- Create system status configuration
INSERT INTO public.scoring_config (key, value, updated_at) 
VALUES (
  'system_status',
  '{
    "status": "green",
    "message": "All systems operational", 
    "last_updated": null,
    "updated_by": null
  }'::jsonb,
  now()
)
ON CONFLICT (key) DO NOTHING;