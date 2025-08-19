-- Fix: Enforce SECURITY INVOKER on views so queries run with the caller's privileges and RLS applies
-- This mitigates linter rule 0010_security_definer_view

-- Safely update all public views present in the schema
ALTER VIEW IF EXISTS public.v_profiles_ext SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_sessions SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_retest_deltas SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_retest_pairs SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_item_stats SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_item_total_te SET (security_invoker = true);
ALTER VIEW IF EXISTS public.v_section_progress SET (security_invoker = true);

-- Optional hardening (kept conservative for performance): enable security barrier only on the most sensitive view
-- You can uncomment if needed after validating performance/compatibility
-- ALTER VIEW public.v_profiles_ext SET (security_barrier = true);
