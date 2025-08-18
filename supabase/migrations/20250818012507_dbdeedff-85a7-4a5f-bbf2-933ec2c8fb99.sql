-- Create profiles table for storing assessment results
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id UUID NOT NULL,
  type_code TEXT,
  base_func TEXT,
  creative_func TEXT,
  overlay TEXT,
  strengths JSONB,
  dimensions JSONB,
  blocks JSONB,
  neuroticism JSONB,
  validity JSONB,
  confidence TEXT,
  type_scores JSONB,
  top_types JSONB,
  dims_highlights JSONB,
  glossary_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Create KB types table for storing type overviews
CREATE TABLE IF NOT EXISTS public.kb_types (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  overview JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create KB definitions table for storing glossary and concept definitions
CREATE TABLE IF NOT EXISTS public.kb_definitions (
  key TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scoring config table for algorithm parameters
CREATE TABLE IF NOT EXISTS public.scoring_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profiles" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own profiles" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for KB tables (publicly readable, service role can manage)
CREATE POLICY "KB types are publicly readable" ON public.kb_types FOR SELECT USING (true);
CREATE POLICY "Service role can manage KB types" ON public.kb_types FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "KB definitions are publicly readable" ON public.kb_definitions FOR SELECT USING (true);
CREATE POLICY "Service role can manage KB definitions" ON public.kb_definitions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Scoring config is publicly readable" ON public.scoring_config FOR SELECT USING (true);
CREATE POLICY "Service role can manage scoring config" ON public.scoring_config FOR ALL USING (auth.role() = 'service_role');

-- Insert default scoring config values
INSERT INTO public.scoring_config (key, value) VALUES
  ('dim_thresholds', '{"one": 2.5, "two": 3.5, "three": 4.5}'),
  ('neuro_norms', '{"mean": 4.0, "sd": 1.2}'),
  ('fc_block_map_default', '{"A": "Core", "B": "Critic", "C": "Hidden", "D": "Instinct"}')
ON CONFLICT (key) DO NOTHING;

-- Add trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on kb_types
CREATE TRIGGER update_kb_types_updated_at
  BEFORE UPDATE ON public.kb_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on kb_definitions
CREATE TRIGGER update_kb_definitions_updated_at
  BEFORE UPDATE ON public.kb_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on scoring_config
CREATE TRIGGER update_scoring_config_updated_at
  BEFORE UPDATE ON public.scoring_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();