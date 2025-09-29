-- Create view to identify sessions missing new scoring fields
CREATE OR REPLACE VIEW public.v_results_missing_new_fields AS
SELECT r.session_id, r.computed_at
FROM public.scoring_results r
WHERE r.payload IS NULL
   OR NOT (r.payload ? 'profile')
   OR NOT (r.payload->'profile' ? 'dims_highlights')
   OR NOT (r.payload->'profile' ? 'seat_coherence')
   OR NOT (r.payload->'profile' ? 'fit_parts')
   OR NOT (r.payload->'profile' ? 'blocks_norm')
   OR NOT (r.payload->'profile' ? 'distance_metrics')
ORDER BY r.computed_at DESC;