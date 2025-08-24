-- Fix the RLS security issue for country_mapping table
ALTER TABLE country_mapping ENABLE ROW LEVEL SECURITY;

-- Allow public read access to country mapping
CREATE POLICY "Country mapping is publicly readable" 
ON country_mapping 
FOR SELECT 
USING (true);

-- Allow service role to manage country mapping
CREATE POLICY "Service role can manage country mapping" 
ON country_mapping 
FOR ALL 
USING (auth.role() = 'service_role'::text) 
WITH CHECK (auth.role() = 'service_role'::text);