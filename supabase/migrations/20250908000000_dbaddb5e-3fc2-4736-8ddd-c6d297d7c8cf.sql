-- 1) Rate limits table and function
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key text PRIMARY KEY,
    window_ends_at timestamptz NOT NULL,
    count int NOT NULL
);

CREATE OR REPLACE FUNCTION public.rate_limit(
    p_key text,
    p_max int,
    p_window interval
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_count int;
    v_window timestamptz;
BEGIN
    SELECT count, window_ends_at INTO v_count, v_window
    FROM public.rate_limits
    WHERE key = p_key;

    IF NOT FOUND OR now() > v_window THEN
        INSERT INTO public.rate_limits(key, window_ends_at, count)
        VALUES (p_key, now() + p_window, 1)
        ON CONFLICT (key)
        DO UPDATE SET window_ends_at = EXCLUDED.window_ends_at,
                      count = 1;
        RETURN true;
    ELSE
        UPDATE public.rate_limits
        SET count = count + 1
        WHERE key = p_key
        RETURNING count INTO v_count;
        RETURN v_count <= p_max;
    END IF;
END;
$$;

-- 2) Example usage: get_profile_by_session_token with rate limiting
CREATE OR REPLACE FUNCTION public.get_profile_by_session_token(
    p_share_token text,
    p_client_ip text
) RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_key text;
BEGIN
    v_key := 'rl:get_profile_by_session_token:ip:' || coalesce(p_client_ip, 'unknown');
    IF NOT public.rate_limit(v_key, 10, interval '1 minute') THEN
        RAISE EXCEPTION 'Rate limit exceeded for get_profile_by_session_token';
    END IF;

    SELECT p.* INTO v_profile
    FROM public.profiles p
    JOIN public.assessment_sessions s ON s.id = p.session_id
    WHERE s.share_token = p_share_token
      AND s.status = 'completed'
    LIMIT 1;

    RETURN v_profile;
END;
$$;
