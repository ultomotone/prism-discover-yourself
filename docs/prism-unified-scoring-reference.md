# PRISM Unified Scoring – Implementation Reference (Design + API + Checklist)

This reference consolidates the architecture, contracts, and operational requirements for the unified PRISM scoring flow. It’s structured as documentation for implementers and reviewers. The shared scoring engine lives at `supabase/functions/_shared/scoreEngine.ts`.

## Frontend Integration (React)

### Assessment Page → Finalization

**Flow:** Assessment page collects answers, then calls Edge Function: `finalizeAssessment`. On success, it navigates to the Results page using the tokenized results URL.

**Requirements**

- Replace any direct `score_prism` calls with `finalizeAssessment`.
- Use the returned `share_token` to navigate to:
  - `/results/:sessionId?t=<share_token>`
- Reuse the existing results components (e.g. `ResultsV2`) to render top-3, trait breakdown, charts, etc.
- Security: Frontend uses anon key only; no secrets appear in client code.

### Results Page

**Flow:** Results page calls Edge Function: `get-results-by-session` with `{ sessionId, shareToken }` to retrieve the profile, then renders `ResultsV2`.

**Requirements**

- Expect query parameter `t` for the share token.
- Handle “not found / invalid token” errors with a user message.
- Keep share/download controls (copy secure link, PDF export) as today.

## Backend (Edge Functions) – API Reference

### `finalizeAssessment` (Edge Function)

**Purpose:** Orchestrates completion: (1) ensures FC scoring exists, (2) invokes unified scoring, (3) completes the session, (4) returns a secure share link token.

**Parameters**

- `session_id`: string (UUID) – Assessment session to finalize
- `responses?`: Array<{ question_id: string|number, answer_value: string|number }> – Optional; used to set `completed_questions` count (not required for scoring)

**Returns**

- `ok`: boolean – true on success
- `status`: "success"
- `session_id`: string
- `share_token`: string – Use in results URL `?t=<token>`
- `profile`: `ProfileResult` – The computed profile payload
- `results_url`: string – Convenience link with token

**Side Effects**

- Calls `score_fc_session` (`basis="functions"`, `version="v1.2"`)
- Calls `score_prism` (unified engine)
- Updates `assessment_sessions`:
  - `status = 'completed'`
  - `completed_at = now()`
  - `completed_questions = responses.length || profile.fc_answered_ct || 0`
  - `share_token` (generated if not present)

**Errors**

- `422` – Scoring failed / partial insufficient
- `500` – Unexpected exception

### `score_fc_session` (Edge Function)

**Purpose:** Tally Forced-Choice answers into a normalized per-function score record for the session.

**Parameters**

- `session_id`: string (UUID) – Target session
- `basis`: "functions" – Scoring mode (current system uses "functions")
- `version`: "v1.2" – FC scoring version tag (must match scoring/prism expectations)

**Returns**

- `scores_json`: Record<Func, number> – 0–100 normalized function scores
- `blocks_answered`: number – Count of FC blocks answered

**Side Effects**

- Upserts into `fc_scores` on (`session_id`, `version`, `fc_kind`) with `scores_json` & `blocks_answered`.

**Errors**

- Non-fatal errors are logged; finalize path continues (the scoring engine can fallback to legacy mapping if needed).

### `score_prism` (Edge Function)

**Purpose:** Compute the unified profile (Likert + FC), calibrate fit/confidence, and upsert into profiles.

**Parameters**

- `session_id`: string (UUID) – Target session
- `partial_session?`: boolean – If true, can produce a partial/insufficient status rather than a final profile
- (No raw responses required; function reads from DB)

**Returns**

- `status`: "success" (or "partial" | "partial_insufficient")
- `profile`: `ProfileResult` – Full results payload (fields listed under Scoring Engine Output)
- `confidence_numeric`: number – Calibrated confidence as a percentage (one-decimal)

**Side Effects**

- Reads `assessment_responses`, `assessment_scoring_key`, `fc_scores`, config tables (and optional calibration model)
- Upserts into `profiles` (unique per `session_id`)
- May set `recomputed_at` for recomputes
- May update `assessment_sessions.status` as safety

**Errors**

- `500` – Internal error; includes message
- `partial*` statuses for incomplete data if `partial_session` is set

### `get-results-by-session` (Edge Function)

**Purpose:** Return a completed profile when the caller provides a valid `sessionId` + `shareToken` pair.

**Parameters**

- `sessionId`: string (UUID)
- `shareToken`: string – Token from session (query param `t` on Results URL)

**Returns**

- `profile`: `ProfileResult`
- `session`: { id: string, status: "completed" }

**Access**

- Executes a `SECURITY DEFINER` SQL function that checks the token against the session & profile.
- (Optional, temporary) Tokenless fallback (controlled usage, logs a warning) to ease transition from old links.

**Errors**

- `404` – Not found / invalid token
- `403` – Access denied (token check failed, if surfaced)

## Scoring Engine Module (TypeScript, shared): `scoreAssessment`

```ts
function scoreAssessment(input: ProfileInput): ProfileResult
```

**Purpose:** Deterministic, pure computation of the PRISM profile from response data and scoring key; encapsulates Likert & FC unification, type distance matching, fit calibration inputs, validity checks, and confidence estimation.

**Parameters**

- `input.sessionId`: string (UUID) – Context for logging/debug
- `input.responses`: Array<{ question_id: string|number, answer_value: string|number, scale_type?: string }> – Deduped responses
- `input.scoringKey`: Record<qid, ScoringMeta> – Per-question metadata (scale, reverse flag, tags, FC maps, etc.)
- `input.config`:
  - `results_version: string`
  - `dim_thresholds`: { one: number, two: number, three: number }
  - `neuro_norms`: { mean: number, sd: number }
  - `overlay_neuro_cut: number`
  - `overlay_state_weights`: { stress: number, time: number, sleep: number, focus: number }
  - `softmax_temp: number`
  - `conf_raw_params`: { a: number, b: number, c: number }
  - `fit_band_thresholds`: { high_fit: number, moderate_fit: number, high_gap: number, moderate_gap: number }
  - `fc_expected_min: number`
  - ... (optional state/attention config)
- `input.fcFunctionScores?`: Record<Func, number> – (0–100) precomputed FC per-function scores (from `fc_scores`); if present, preferred over raw FC mapping
- `input.partial?`: boolean – Allow partial/insufficient output
- `input.fc_expected?`: number – Expected FC count (completeness)

**Output: `ProfileResult` (selected/representative fields)**

- `type_code`: string – Winning type (e.g., "LII")
- `base_func`: string, `creative_func`: string
- `top_types`: string[] – Top 3 codes
- `top_3_fits`: Array<{ code: string, fit: number, share: number }>
- `score_fit_raw`: number, `score_fit_calibrated`: number, `fit_band`: "High"|"Moderate"|"Low"
- `top_gap`: number, `close_call`: boolean
- `strengths`: Record<Func, number> – 1–5 scale per function
- `dimensions`: Record<Func, number> – dimensional depth counts (0–4)
- `blocks_norm`: { Core: number, Critic: number, Hidden: number, Instinct: number }
- `dims_highlights`: { coherent: string[], unique: string[] }
- `neuro_mean`: number, `neuro_z`: number, `overlay_neuro`: "+"|"–"|"0"
- `overlay_state`: "+"|"–"|"0", `state_index`: number, `overlay`: string
- `validity_status`: "pass"|"warning"|"fail", `validity`: {...details...}
- `confidence`: "High"|"Moderate"|"Low" – textual (validity-driven)
- `conf_raw`: number, `conf_calibrated`: number
- `fc_answered_ct`: number, `fc_coverage_bucket`: string
- `version`: string, `results_version`: string

**Notes**

- Calibration (cohort & isotonic/platt) is typically applied in the Edge function after raw confidence is computed by the engine.
- The engine gracefully handles: missing tags, legacy FC fallback, partial sessions (when `partial` is set).

## Database Contracts

### Tables Involved

- `assessment_sessions` – id, status, share_token, timestamps, completed_questions
- `assessment_responses` – deduped by question_id per session
- `assessment_scoring_key` – per-question meta (scale, tags, reverse, fc_map, etc.)
- `fc_scores` – (`session_id`, `version`, `fc_kind`) → `scores_json` (0–100 per function), `blocks_answered`
- `profiles` – final results JSON fields & metrics for session
- `calibration_model` – (optional) isotonic/knots per stratum for confidence calibration
- `type_prototypes` – (optional, DB-provided prototypes; else fallback constants)

### RLS & Access

- `profiles`
  - RLS enabled
  - Policy: Authenticated users can `SELECT` rows where `user_id = auth.uid()`
  - No public/anon `SELECT`
- Results tokenized access
  - Use a `SECURITY DEFINER` function (e.g., `get_profile_by_session(session_uuid, token_text)`) that:
    - joins `assessment_sessions` on `(id, share_token)`
    - requires session status = 'completed'
    - returns the corresponding `profiles` row
  - Grant `EXECUTE` to anon and authenticated
- `share_token` default
  - `assessment_sessions.share_token DEFAULT gen_random_uuid()`
  - Unique per session (implicitly unique enough; add unique index if desired)

## Configuration & Environment

### Environment Variables (Edge Functions)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (required)
  - Used server-side only via `Deno.env`. Never expose to client.
- (Optional) Logging flags, debug toggles

### Environment Variables (Frontend)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Only anon key is used on the client.

### Config Rows (DB)

- `scoring_config.results_version = "v1.2.1"`
- `scoring_config.softmax_temp` (default 1.0)
- `scoring_config.fc_expected_min` (e.g., 24)
- Optional: thresholds, neuro norms, state weights, attention qids

## Implementation Checklist (Go/No-Go)

### Frontend

- Assessment calls `finalizeAssessment(session_id, responses)` on completion
- Results navigation includes token: `?t=<share_token>`
- Results page calls `get-results-by-session` with `{ sessionId, shareToken }`
- `ResultsV2` renders existing charts & breakdowns (no feature loss)
- No secrets in client bundle (anon key only)

### Edge Functions

- `finalizeAssessment` calls `score_fc_session` (`version="v1.2"`) then `score_prism`
- `score_prism` uses unified engine; upserts profiles (`version v1.2.1`)
- `get-results-by-session` validates token via secure DB function
- (If present) temporary tokenless fallback logs usage and is planned for removal

### Database

- `profiles` RLS tightened (no public `SELECT`); user-only policy in place
- `get_profile_by_session` `SECURITY DEFINER`; `EXECUTE` granted to anon/auth
- `assessment_sessions.share_token` has `DEFAULT` generator
- `scoring_config.results_version = "v1.2.1"`

### ENV / Secrets

- `SUPABASE_SERVICE_ROLE_KEY` set in Edge Functions environment
- Frontend uses anon key only; no service keys in client code

### Observability

- Logs confirm `fc_scores_loaded` or `fc_fallback_legacy` paths
- Logs confirm `scoring_complete` (type, overlay, confidence, top_gap)
- (Temporary) any `tokenless_access` events are monitored

## Test Plan (Essentials)

### Unit

- Engine: deterministic outputs, share sum≈100, ties resolved deterministically, bands & overlays correct.

### Integration

- Complete assessment → finalize returns `share_token`, navigates to results, results render match legacy UI content.
- Public results link (`/results/:id?t=...`) works incognito.
- Authenticated user can list & view only own profiles (RLS).
- Invalid/missing token → “Results not found”.

### Security

- No public `SELECT` on `profiles`.
- Edge client never uses service role key.
- Token cannot be guessed (UUID), token mismatches are rejected.

### Performance

- Scoring completes quickly (O(items) + constant per-type operations).
- Calibration queries limited/sensible (e.g., 90d window if used).

## Known Risks & Mitigations (Top 5)

1. **Old links without token**
   - *Mitigation:* Temporary tokenless fallback (logged) + plan to retire; friendly error on removal.
2. **In-progress sessions across deploy**
   - *Mitigation:* `finalizeAssessment` always triggers `score_fc_session` (`v1.2`), ensuring fresh FC data.
3. **Output drift vs legacy**
   - *Mitigation:* Same weights & thresholds; roundings aligned; side-by-side checks on sample datasets.
4. **RLS hardening regressions**
   - *Mitigation:* Keep dashboards using `SECURITY DEFINER` views/functions; verify app paths access via proper channels.
5. **Param name mismatch (?token vs ?t)**
   - *Mitigation:* Standardize on `?t` across navigate & results; ensure both sides aligned.
