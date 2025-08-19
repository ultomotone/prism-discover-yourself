-- PRISM v1.1 Database Schema Updates
-- Add new fields to profiles table for enhanced analytics

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS validity_status text DEFAULT 'pass',
ADD COLUMN IF NOT EXISTS top_gap numeric,
ADD COLUMN IF NOT EXISTS close_call boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fit_band text,
ADD COLUMN IF NOT EXISTS fc_answered_ct integer DEFAULT 0;

-- Add section tracking to assessment_responses
ALTER TABLE public.assessment_responses 
ADD COLUMN IF NOT EXISTS section_id text;

-- Update profiles table to include new fit explainer fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS top_3_fits jsonb,
ADD COLUMN IF NOT EXISTS fit_explainer jsonb;