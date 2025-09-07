-- Fix PostgreSQL 42P16 on CREATE OR REPLACE VIEW:
-- Primary strategy: Non-breaking in-place replace that preserves existing column list/types/order.
-- Secondary strategy (commented out below): controlled drop-and-recreate with GRANT replay.

-- =====================================================================
-- PRIMARY (ACTIVE): NON-BREAKING IN-PLACE REPLACE
-- =====================================================================
DO $$
DECLARE
  v_schema  text := 'public';
  v_view    text := 'v_recent_assessments_safe';
  v_oid     oid;
  rec       record;
  sel_list  text := '';
  sep       text := '';
  col_expr  text;
  col_note  text;
BEGIN
  -- Find the view OID (if it exists)
  SELECT c.oid
    INTO v_oid
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = v_schema
    AND c.relname = v_view
    AND c.relkind = 'v'; -- plain view

  IF v_oid IS NULL THEN
    -- View does not exist: create it with the desired minimal column set (idempotent bootstrap).
    RAISE NOTICE 'View %.% does not exist. Creating with minimal anonymized columns.', v_schema, v_view;

    EXECUTE format($ddl$
      CREATE VIEW %I.%I AS
      SELECT
        /* created_at: pass-through from profiles */
        p.created_at,
        /* type_prefix: anonymized type code prefix */
        LEFT(p.type_code, 3) AS type_prefix,
        /* overlay: pass-through (already safe) */
        p.overlay,
        /* country_display: privacy placeholder */
        'Hidden for Privacy'::text AS country_display,
        /* time_period: derived band from created_at */
        CASE
          WHEN p.created_at >= CURRENT_DATE - INTERVAL '1 day' THEN 'Today'
          WHEN p.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'This week'
          ELSE 'Earlier'
        END AS time_period,
        /* fit_indicator: derived from confidence */
        CASE
          WHEN p.confidence = 'High' THEN 'Strong'
          WHEN p.confidence = 'Moderate' THEN 'Moderate'
          WHEN p.confidence = 'Low' THEN 'Developing'
          ELSE 'Processing'
        END AS fit_indicator
      FROM public.profiles p
      WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
    $ddl$, v_schema, v_view);

    -- Note: Views don’t bypass RLS on underlying tables; callers may still be blocked.
    -- If you need public read regardless of RLS, expose this via a SECURITY DEFINER function.

    RETURN;
  END IF;

  -- Build a SELECT list that preserves the existing output columns exactly (names/types/order).
  FOR rec IN
    SELECT
      a.attnum,
      a.attname                                  AS col_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) AS col_type
    FROM pg_attribute a
    WHERE a.attrelid = v_oid
      AND a.attnum > 0
      AND NOT a.attisdropped
    ORDER BY a.attnum
  LOOP
    -- Decide mapping per existing column name.
    IF rec.col_name = 'created_at' THEN
      col_note := 'created_at: pass-through from profiles';
      col_expr := 'p.created_at::' || rec.col_type || ' AS ' || quote_ident(rec.col_name);

    ELSIF rec.col_name IN ('type_prefix','type_code','type','code') THEN
      -- Keep the existing column name, but compute LEFT(type_code,3); cast to the existing column type.
      col_note := rec.col_name || ': anonymized type prefix from p.type_code (LEFT(...,3))';
      col_expr := 'LEFT(p.type_code,3)::' || rec.col_type || ' AS ' || quote_ident(rec.col_name);

    ELSIF rec.col_name = 'overlay' THEN
      col_note := 'overlay: pass-through from profiles';
      col_expr := 'p.overlay::' || rec.col_type || ' AS ' || quote_ident(rec.col_name);

    ELSIF rec.col_name IN ('country','country_display','country_name') THEN
      col_note := rec.col_name || ': privacy placeholder ''Hidden for Privacy''';
      col_expr := quote_literal('Hidden for Privacy') || '::' || rec.col_type || ' AS ' || quote_ident(rec.col_name);

    ELSIF rec.col_name = 'time_period' THEN
      col_note := 'time_period: derived band from p.created_at';
      col_expr := '('
        || 'CASE '
        || 'WHEN p.created_at >= CURRENT_DATE - INTERVAL ''1 day'' THEN ''Today'' '
        || 'WHEN p.created_at >= CURRENT_DATE - INTERVAL ''7 days'' THEN ''This week'' '
        || 'ELSE ''Earlier'' END'
        || ')::' || rec.col_type || ' AS ' || quote_ident(rec.col_name);

    ELSIF rec.col_name = 'fit_indicator' THEN
      col_note := 'fit_indicator: derived band from p.confidence';
      col_expr := '('
        || 'CASE '
        || 'WHEN p.confidence = ''High'' THEN ''Strong'' '
        || 'WHEN p.confidence = ''Moderate'' THEN ''Moderate'' '
        || 'WHEN p.confidence = ''Low'' THEN ''Developing'' '
        || 'ELSE ''Processing'' END'
        || ')::' || rec.col_type || ' AS ' || quote_ident(rec.col_name);

    ELSE
      -- Any column not in the new spec: keep shape by emitting a NULL placeholder cast to the existing type.
      col_note := rec.col_name || ': no longer exposed (emit NULL placeholder to preserve view shape)';
      col_expr := 'NULL::' || rec.col_type || ' AS ' || quote_ident(rec.col_name);
    END IF;

    -- Append with an explanatory comment for this column mapping.
    sel_list := sel_list
      || sep
      || '  /* ' || replace(col_note, '*/', '*\/') || ' */ '
      || col_expr
      || E'\n';

    sep := ',\n';
  END LOOP;

  -- Recreate the view definition non-destructively, preserving output columns.
  EXECUTE
    'CREATE OR REPLACE VIEW '
    || quote_ident(v_schema) || '.' || quote_ident(v_view) || ' AS
     SELECT
' || sel_list || '
     FROM public.profiles p
     WHERE p.created_at >= CURRENT_DATE - INTERVAL ''30 days''';

  RAISE NOTICE 'View %.% replaced in-place with preserved columns.', v_schema, v_view;
END
$$ LANGUAGE plpgsql;

-- =====================================================================
-- SECONDARY (COMMENTED): BREAKING DROP-AND-RECREATE WITH GRANTS REPLAY
-- =====================================================================
/*
-- ⚠️ Breaking path: This changes the view’s column list.
-- Prefer creating a NEW view name (e.g., v_recent_assessments_safe_v2), migrate dependencies, then swap names.
-- DROP VIEW ... CASCADE may remove dependent objects (other views, functions); use with extreme care.

DO $$
DECLARE
  v_schema  text := 'public';
  v_view    text := 'v_recent_assessments_safe';
  g         record;
BEGIN
  -- Capture existing table-level GRANTs
  CREATE TEMP TABLE _view_grants ON COMMIT DROP AS
  SELECT grantee, privilege_type
  FROM information_schema.table_privileges
  WHERE table_schema = v_schema
    AND table_name   = v_view;

  -- Drop the view (no CASCADE here; if dependencies exist, abort and use the v2 pattern instead)
  EXECUTE format('DROP VIEW IF EXISTS %I.%I', v_schema, v_view);

  -- Recreate with the minimal anonymized column set (no ORDER BY/LIMIT inside the view)
  EXECUTE format($ddl$
    CREATE VIEW %I.%I AS
    SELECT
      p.created_at,
      LEFT(p.type_code, 3) AS type_prefix,
      p.overlay,
      'Hidden for Privacy'::text AS country_display,
      CASE
        WHEN p.created_at >= CURRENT_DATE - INTERVAL '1 day' THEN 'Today'
        WHEN p.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'This week'
        ELSE 'Earlier'
      END AS time_period,
      CASE
        WHEN p.confidence = 'High' THEN 'Strong'
        WHEN p.confidence = 'Moderate' THEN 'Moderate'
        WHEN p.confidence = 'Low' THEN 'Developing'
        ELSE 'Processing'
      END AS fit_indicator
    FROM public.profiles p
    WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
  $ddl$, v_schema, v_view);

  -- Replay GRANTs (table-level)
  FOR g IN SELECT * FROM _view_grants LOOP
    EXECUTE format('GRANT %s ON %I.%I TO %I', g.privilege_type, v_schema, v_view, g.grantee);
  END LOOP;

  -- Note: Column-level grants on views are rare; if present, capture via information_schema.role_column_grants similarly.

END
$$ LANGUAGE plpgsql;
*/

-- ---------------------------------------------------------------------
-- Notes:
-- * Views do NOT bypass RLS on underlying tables. If you need public read
--   irrespective of RLS, expose a SECURITY DEFINER function owned by a role
--   with appropriate privileges, or use a materialized view refreshed by a
--   privileged job.
-- * Tested on PostgreSQL ≥ 12.
-- * Idempotency: the primary block preserves existing shape; if the view
--   doesn't exist it creates it with the new minimal columns.
