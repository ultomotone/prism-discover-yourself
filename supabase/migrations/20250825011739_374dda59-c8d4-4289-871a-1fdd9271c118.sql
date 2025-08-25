-- Add missing updated_at column to assessment_responses table
ALTER TABLE public.assessment_responses 
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assessment_responses
CREATE TRIGGER update_assessment_responses_updated_at
    BEFORE UPDATE ON public.assessment_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();