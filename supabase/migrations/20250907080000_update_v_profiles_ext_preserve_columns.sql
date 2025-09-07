-- supabase/migrations/20250907080000_update_v_profiles_ext_preserve_columns.sql
-- Purpose: update v_profiles_ext without dropping any existing columns

DO $$
DECLARE
  cols text;
BEGIN
  -- If the view doesn't exist yet, create it fresh
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'v_profiles_ext' AND c.relkind = 'v'
  ) THEN
    EXECUTE $v$
      CREATE VIEW public.v_profiles_ext AS
      SELECT
        p.*,
        (SELECT (value->>'fit_abs')::numeric
           FROM jsonb_each(p.type_scores)
           ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
           LIMIT 1) AS top1_fit,
        (SELECT (value->>'fit_abs')::numeric
           FROM jsonb_each(p.type_scores)
           ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
           OFFSET 1 LIMIT 1) AS top2_fit,
        (SELECT (value->>'share_pct')::numeric
           FROM jsonb_each(p.type_scores)
           ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
           LIMIT 1) AS top1_share,
        (SELECT key
           FROM jsonb_each(p.type_scores)
           ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
           LIMIT 1) AS top_type
      FROM public.profiles p;
    $v$;
  ELSE
    -- Build a SELECT list that preserves ALL existing view columns:
    --  • If a column still exists on profiles → use p."col"
    --  • If it no longer exists            → keep as NULL::type AS "col"
    SELECT string_agg(
      CASE
        WHEN EXISTS (
          SELECT 1
          FROM information_schema.columns pc
          WHERE pc.table_schema = 'public'
            AND pc.table_name   = 'profiles'
            AND pc.column_name  = a.attname
        )
        THEN format('p.%I', a.attname)
        ELSE format('NULL::%s AS %I', format_type(a.atttypid, a.atttypmod), a.attname)
      END,
      E',\n  ' ORDER BY a.attnum
    )
    INTO cols
    FROM pg_attribute a
    JOIN pg_class c  ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'v_profiles_ext'
      AND a.attnum > 0
      AND NOT a.attisdropped;

    EXECUTE format($v$
      CREATE OR REPLACE VIEW public.v_profiles_ext AS
      SELECT
        %s,
        (SELECT (value->>'fit_abs')::numeric
           FROM jsonb_each(p.type_scores)
           ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
           LIMIT 1) AS top1_fit,
        (SELECT (value->>'fit_abs')::numeric
           FROM jsonb_each(p.type_scores)
           ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
           OFFSET 1 LIMIT 1) AS top2_fit,
        (SELECT (value->>'share_pct')::numeric
           FROM jsonb_each(p.type_scores)
           ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
           LIMIT 1) AS top1_share,
        (SELECT key
           FROM jsonb_each(p.type_scores)
           ORDER BY (value->>'fit_abs')::numeric DESC NULLS LAST
           LIMIT 1) AS top_type
      FROM public.profiles p;
    $v$, cols);
  END IF;
END$$;
