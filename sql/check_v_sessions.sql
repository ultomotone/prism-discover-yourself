SELECT * FROM public.v_sessions ORDER BY started_at DESC LIMIT 20;
SELECT COUNT(*) AS null_user_ids FROM public.v_sessions WHERE user_id IS NULL;
