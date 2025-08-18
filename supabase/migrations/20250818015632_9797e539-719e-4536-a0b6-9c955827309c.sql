-- Extend profiles with blocks_norm + version
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS blocks_norm jsonb,
  ADD COLUMN IF NOT EXISTS version text;