-- Create newsletter signups table
CREATE TABLE public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  signup_source TEXT DEFAULT 'website_popup',
  interests TEXT[] DEFAULT ARRAY['updates', 'model_news', 'tips', 'insights'],
  confirmed BOOLEAN DEFAULT false,
  confirmation_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting newsletter signups (public access)
CREATE POLICY "Anyone can signup for newsletter" 
ON public.newsletter_signups 
FOR INSERT 
WITH CHECK (true);

-- Create policy for service role to manage signups
CREATE POLICY "Service role can manage newsletter signups" 
ON public.newsletter_signups 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create function to update timestamps
CREATE TRIGGER update_newsletter_signups_updated_at
BEFORE UPDATE ON public.newsletter_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();