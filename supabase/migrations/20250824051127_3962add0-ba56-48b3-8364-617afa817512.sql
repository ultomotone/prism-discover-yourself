-- Create a country mapping table for ISO-2 conversion
CREATE TABLE IF NOT EXISTS country_mapping (
  country_name TEXT PRIMARY KEY,
  iso2_code TEXT NOT NULL
);

-- Insert common country mappings
INSERT INTO country_mapping (country_name, iso2_code) VALUES
('UNITED STATES', 'us'),
('RUSSIA', 'ru'), 
('GERMANY', 'de'),
('CANADA', 'ca'),
('POLAND', 'pl'),
('UNITED KINGDOM', 'gb'),
('FRANCE', 'fr'),
('ITALY', 'it'),
('SPAIN', 'es'),
('NETHERLANDS', 'nl'),
('BRAZIL', 'br'),
('INDIA', 'in'),
('CHINA', 'cn'),
('JAPAN', 'jp'),
('AUSTRALIA', 'au')
ON CONFLICT (country_name) DO UPDATE SET iso2_code = EXCLUDED.iso2_code;

-- Update the country activity view to use proper ISO-2 codes
CREATE OR REPLACE VIEW v_activity_country_30d AS
SELECT 
  COALESCE(cm.iso2_code, LOWER(REPLACE(s.country_iso2, ' ', '_'))) as iso2,
  s.country_iso2 as country_name,
  COUNT(*)::bigint as sessions
FROM assessment_sessions s
JOIN profiles p ON p.session_id = s.id
LEFT JOIN country_mapping cm ON UPPER(s.country_iso2) = cm.country_name
WHERE s.created_at >= NOW() - INTERVAL '30 days'
  AND s.status = 'completed'
  AND s.country_iso2 IS NOT NULL
  AND s.country_iso2 != ''
GROUP BY s.country_iso2, cm.iso2_code
HAVING COUNT(*) > 0
ORDER BY sessions DESC;