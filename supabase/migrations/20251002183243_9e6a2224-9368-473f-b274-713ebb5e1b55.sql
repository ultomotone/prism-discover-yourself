-- Enable RLS on new tables
ALTER TABLE dif_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_half_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfa_fit ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_discrimination ENABLE ROW LEVEL SECURITY;

-- Public read access for analytics (these are aggregated metrics, not user data)
CREATE POLICY "Public read dif_results" ON dif_results FOR SELECT USING (true);
CREATE POLICY "Public read calibration_bins" ON calibration_bins FOR SELECT USING (true);
CREATE POLICY "Public read calibration_summary" ON calibration_summary FOR SELECT USING (true);
CREATE POLICY "Public read split_half_results" ON split_half_results FOR SELECT USING (true);
CREATE POLICY "Public read cfa_fit" ON cfa_fit FOR SELECT USING (true);
CREATE POLICY "Public read item_discrimination" ON item_discrimination FOR SELECT USING (true);

-- Service role write access (computed by backend jobs)
CREATE POLICY "Service role write dif_results" ON dif_results 
  FOR ALL USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role write calibration_bins" ON calibration_bins 
  FOR ALL USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role write calibration_summary" ON calibration_summary 
  FOR ALL USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role write split_half_results" ON split_half_results 
  FOR ALL USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role write cfa_fit" ON cfa_fit 
  FOR ALL USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role write item_discrimination" ON item_discrimination 
  FOR ALL USING (((current_setting('request.jwt.claims'::text, true))::jsonb ->> 'role'::text) = 'service_role'::text);