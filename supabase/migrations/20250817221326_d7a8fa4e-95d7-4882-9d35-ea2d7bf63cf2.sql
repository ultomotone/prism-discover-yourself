-- Create table for assessment sessions
CREATE TABLE public.assessment_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- Will be null for anonymous users, can be linked later when auth is added
  session_type TEXT NOT NULL DEFAULT 'prism',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INTEGER,
  completed_questions INTEGER DEFAULT 0,
  metadata JSONB, -- Store additional session info like browser, IP, etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual assessment responses
CREATE TABLE public.assessment_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'likert', 'multiple-choice', 'attention-check', etc.
  question_section TEXT NOT NULL,
  answer_value TEXT, -- Store the actual answer value
  answer_numeric INTEGER, -- Store numeric representation if applicable
  response_time_ms INTEGER, -- How long it took to answer
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_assessment_sessions_user_id ON public.assessment_sessions(user_id);
CREATE INDEX idx_assessment_sessions_session_type ON public.assessment_sessions(session_type);
CREATE INDEX idx_assessment_sessions_created_at ON public.assessment_sessions(created_at);
CREATE INDEX idx_assessment_responses_session_id ON public.assessment_responses(session_id);
CREATE INDEX idx_assessment_responses_question_id ON public.assessment_responses(question_id);

-- Enable Row Level Security
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented yet)
-- Users can create new sessions
CREATE POLICY "Anyone can create assessment sessions" 
ON public.assessment_sessions 
FOR INSERT 
WITH CHECK (true);

-- Users can read their own sessions (by session ID)
CREATE POLICY "Users can read assessment sessions" 
ON public.assessment_sessions 
FOR SELECT 
USING (true); -- For now allow all reads, can be restricted when auth is added

-- Users can update their own sessions
CREATE POLICY "Users can update assessment sessions" 
ON public.assessment_sessions 
FOR UPDATE 
USING (true); -- For now allow all updates, can be restricted when auth is added

-- Users can create responses for any session (for anonymous usage)
CREATE POLICY "Anyone can create assessment responses" 
ON public.assessment_responses 
FOR INSERT 
WITH CHECK (true);

-- Users can read responses
CREATE POLICY "Users can read assessment responses" 
ON public.assessment_responses 
FOR SELECT 
USING (true); -- For now allow all reads

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_assessment_sessions_updated_at
    BEFORE UPDATE ON public.assessment_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();