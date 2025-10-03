-- Remove the sample data that was incorrectly inserted
DELETE FROM public.measurement_invariance 
WHERE model_name = '8-Factor PRISM Model' 
AND results_version = 'v1.2.1'
AND model_comparison = 'Gender (Male vs Female)';

DELETE FROM public.dif_results 
WHERE question_id IN (42, 87, 156) 
AND method = 'Mantel-Haenszel'
AND focal_group = 'Female';