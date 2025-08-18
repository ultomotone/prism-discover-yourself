-- Add created_at to profiles if not exists and add dashboard config
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Add dashboard configuration keys for country and email question IDs
INSERT INTO scoring_config(key, value) VALUES
('dashboard_country_qid', jsonb_build_object('id', 123)),
('dashboard_email_qid', jsonb_build_object('id', 1))
ON CONFLICT (key) DO UPDATE SET value = excluded.value;