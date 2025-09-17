# Results Discovery - Endpoints Analysis

## Current Implementation Status

**Results Page Route**: `/results/[sessionId]`  
**Test Parameters**:
- session_id: `618c5ea6-aeda-4084-9156-0aac9643afd3`
- share_token: `7e4f523d-9d8d-4b3c-8cb9-a3d8600a4da5`
- Expected URL: `https://prismassessment.com/results/618c5ea6-aeda-4084-9156-0aac9643afd3?t=7e4f523d-9d8d-4b3c-8cb9-a3d8600a4da5`

## Data Flow Analysis

### Current Implementation in Results.tsx:
- **RPC Call**: `supabase.rpc("get_results_by_session", { p_session_id: sessionId, t: shareToken ?? null })`
- **Environment**: Points to production Supabase project `gnkuikentdtnatazeriu`
- **Security**: Uses SECURITY DEFINER RPC (no direct table reads)

### Available API Endpoints:

1. **RPC Function**: `get_results_by_session(session_id uuid, t text)`
   - This is what Results.tsx currently uses
   - Parameters: `{ p_session_id, t }`

2. **Edge Function**: `get-results-by-session`  
   - Available but NOT used by Results.tsx
   - Parameters: `{ session_id, share_token }`
   - Calls internal RPC: `get_profile_by_session(session_uuid, token_text)`

3. **Alternative RPC**: `get_profile_by_session(p_session_id uuid, p_share_token text)`
   - Used by Edge Function internally

## Architecture Mismatch Identified

**ISSUE**: Results.tsx calls RPC directly instead of using the secure Edge Function
- Current: Frontend → RPC `get_results_by_session`
- Expected: Frontend → Edge Function `get-results-by-session` → RPC `get_profile_by_session`

## Environment Verification
- Supabase Project: `gnkuikentdtnatazeriu` ✅
- Site Origin: Will verify against `https://prismassessment.com` ✅