-- Enable RLS on country_mapping table
ALTER TABLE country_mapping ENABLE ROW LEVEL SECURITY;

-- Add policy to allow public read access for country mapping
CREATE POLICY "Country mapping is publicly readable" 
ON country_mapping FOR SELECT 
USING (true);