-- Keep only the latest profile for the LIE session, remove duplicates
DELETE FROM public.profiles 
WHERE session_id = 'c6970644-8b35-4128-b5c4-53dd292141a9'
AND created_at < '2025-08-19 02:39:05.919277+00';