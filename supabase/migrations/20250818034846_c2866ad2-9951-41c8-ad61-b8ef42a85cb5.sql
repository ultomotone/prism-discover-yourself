-- Update assessment_responses table to handle array and object answers
ALTER TABLE public.assessment_responses 
ADD COLUMN IF NOT EXISTS answer_array text[], 
ADD COLUMN IF NOT EXISTS answer_object jsonb;

-- Update assessment_scoring_key to support new question types  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'assessment_scoring_key' 
        AND column_name = 'question_type'
    ) THEN
        ALTER TABLE public.assessment_scoring_key ADD COLUMN question_type text;
    END IF;
END $$;

-- Create index for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_assessment_responses_answer_array ON public.assessment_responses USING GIN(answer_array);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_answer_object ON public.assessment_responses USING GIN(answer_object);

-- Update the scoring key enum to include new question types
ALTER TYPE assessment_scale_type ADD VALUE IF NOT EXISTS 'matrix';
ALTER TYPE assessment_scale_type ADD VALUE IF NOT EXISTS 'select-all'; 
ALTER TYPE assessment_scale_type ADD VALUE IF NOT EXISTS 'ranking';