# Appendices

## RPC Contracts

### get_results_by_session(session_id uuid, t text default null) → jsonb
- **Token path (anon)**: pass both `session_id` and `t`.
- **Owner path (auth)**: pass only `session_id` with a user JWT.
- Returns: `{ profile: jsonb, session: jsonb }`.
- TTL enforced via `assessment_sessions.share_token_expires_at`.

### rotate_results_share_token(p_session_id uuid) → json
- **Auth required**: user must own the session.
- Rotates token, sets a fresh TTL, logs event.
- Returns: `{ share_token: text }`.

## Observability
- `results_token_access_logs` (hashed tokens)
- `results_token_events` (rotate events)
- `v_results_access_last_24h` (calls, legacy ratio, successes)

## Environments
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `RESULTS_BASE_URL` (edge links)
- Smoke envs: `SESSION_ID`, `SHARE_TOKEN`, `USER_JWT`
