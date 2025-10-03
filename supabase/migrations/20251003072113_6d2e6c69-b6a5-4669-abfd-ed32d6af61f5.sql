-- Add primary key to cfa_fit
ALTER TABLE public.cfa_fit
DROP CONSTRAINT IF EXISTS cfa_fit_pkey;

ALTER TABLE public.cfa_fit
ADD PRIMARY KEY (results_version, model_name);

-- Add primary key to cfa_loadings
ALTER TABLE public.cfa_loadings
DROP CONSTRAINT IF EXISTS cfa_loadings_pkey;

ALTER TABLE public.cfa_loadings
ADD PRIMARY KEY (results_version, scale_tag, question_id);

-- Clear test data from cfa_fit
DELETE FROM public.cfa_fit WHERE results_version = 'v1.2.1';

-- Clear any test data from cfa_loadings
DELETE FROM public.cfa_loadings WHERE results_version = 'v1.2.1';