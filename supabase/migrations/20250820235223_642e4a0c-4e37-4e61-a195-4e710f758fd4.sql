-- Add submitted_at and recomputed_at to profiles, and backfill
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recomputed_at TIMESTAMPTZ;

-- Backfill submitted_at from created_at where missing (preserve history)
UPDATE public.profiles
SET submitted_at = COALESCE(submitted_at, created_at)
WHERE submitted_at IS NULL;

-- Helpful indexes for analytics
CREATE INDEX IF NOT EXISTS idx_profiles_submitted_at ON public.profiles (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_recomputed_at ON public.profiles (recomputed_at DESC);
