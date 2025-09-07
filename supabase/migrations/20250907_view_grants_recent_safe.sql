-- Views don't support RLS policies. Remove/skip any CREATE POLICY on the view.
-- Instead, just grant SELECT on the view object itself.

DO $$
BEGIN
  -- No-op: policy can't exist on a view, but keep this block for idempotency.
  -- If you accidentally created a similarly named policy on a table, drop it here.
  -- PERFORM 1 FROM pg_policies WHERE schemaname='public' AND tablename='v_recent_assessments_safe' AND policyname='Recent assessments safe view is publicly readable';
  -- IF FOUND THEN EXECUTE 'DROP POLICY "Recent assessments safe view is publicly readable" ON public.v_recent_assessments_safe'; END IF;
  NULL;
END $$;

-- Grant read access to the view object (this does NOT bypass RLS on underlying tables).
GRANT SELECT ON public.v_recent_assessments_safe TO anon, authenticated;
