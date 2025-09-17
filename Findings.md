# PRISM System Audit - Current State vs Architectural Plan

## Global Safety Envelope - System Inventory & Risk Assessment

**Audit Date:** 2025-01-17
**Scope:** PRISM assessment platform (frontend + Supabase backend + Edge Functions)
**Reference Plan:** `docs/prism-unified-scoring-reference.md` + architectural docs

---

## A) CURRENT STATE INVENTORY

### Frontend Routes & Flow
- **Assessment Page** (`/assessment`): ✅ Calls `finalizeAssessment` edge function on completion
- **Results Page** (`/results/:sessionId`): ✅ Uses `?t=` token parameter, calls `get-results-by-session`
- **Results Rendering**: ✅ Uses `ResultsV2` component for profile display
- **Navigation Flow**: ✅ Assessment → `finalizeAssessment` → `/results/:id?t=<token>`

### Edge Functions Implemented
- **`finalizeAssessment`**: ✅ Orchestrates scoring, calls `score_fc_session` → `score_prism`, returns share_token
- **`score_prism`**: ✅ Unified engine, loads FC from `fc_scores` table, version v1.2.1
- **`score_fc_session`**: ✅ Processes FC blocks, normalizes to 0-100, upserts to `fc_scores`
- **`get-results-by-session`**: ✅ Secure token-based access via `get_profile_by_session` RPC

### Database Schema & Policies
- **Core Tables**: `assessment_sessions`, `assessment_responses`, `profiles`, `fc_scores`, `calibration_model`
- **RLS Status**: Enabled on most tables, but need to verify `profiles` table policies
- **Secure Access**: `get_profile_by_session` SECURITY DEFINER function exists
- **Token Model**: Share tokens in `assessment_sessions.share_token`

### Configuration
- **Scoring Version**: Using v1.2.1 in `score_prism`
- **FC Version**: Using v1.2 in `score_fc_session`
- **Config Tables**: `scoring_config` exists with required parameters

---

## B) PLAN vs ACTUAL ALIGNMENT

| Component | Plan Requirement | Current Status | Gap Analysis |
|-----------|------------------|----------------|--------------|
| **Frontend Flow** | Assessment → `finalizeAssessment` → tokenized results | ✅ ALIGNED | No gaps found |
| **FC Unification** | Use `fc_scores` table, not per-question mapping | ✅ ALIGNED | `score_prism` prefers `fc_scores` |
| **Results Access** | Token-only via `get-results-by-session` | ✅ ALIGNED | Secure RPC implemented |
| **Scoring Engine** | Unified engine in `score_prism` | ✅ ALIGNED | Single engine at v1.2.1 |
| **Token Generation** | `share_token` with TTL in sessions | ⚠️ VERIFY | Need to check TTL implementation |
| **RLS Hardening** | Remove public read on `profiles` | ⚠️ VERIFY | Need to audit current policies |
| **Observability** | Log FC fallback usage | ⚠️ VERIFY | Logs exist but need to verify coverage |

---

## C) RISK ASSESSMENT

### 🔴 HIGH RISK
1. **RLS Policy Drift**: Current `profiles` table may still have broad read policies
2. **Tokenless Fallback**: Unknown if legacy tokenless access remains and is logged

### 🟡 MEDIUM RISK  
3. **Version Alignment**: Need to verify all components use consistent versioning (v1.2.1)
4. **Error Handling**: Token expiry and rotation mechanisms need validation
5. **Legacy Code Paths**: Potential direct `score_prism` calls bypassing orchestration

### 🟢 LOW RISK
6. **Edge Function Security**: Service role keys properly isolated server-side
7. **Frontend Security**: Only anon keys used in client code

---

## D) DISCREPANCIES FOUND

### Minor Gaps
1. **Parameter Naming**: Some functions use different parameter names (`session_uuid` vs `p_session_id`)
2. **Error Codes**: Inconsistent error response formats between edge functions
3. **Logging Format**: FC fallback events logged but format varies

### No Major Architecture Violations
- Core unified scoring flow is implemented correctly
- Token-based security model is in place
- FC unification pipeline exists and functions

---

## E) RECOMMENDED VERIFICATION CHECKLIST

Before any changes:

### Database Audit Required
- [ ] Verify `profiles` table RLS policies are restrictive (no public read)
- [ ] Confirm `get_profile_by_session` grants are correct
- [ ] Check `share_token` default generation and TTL handling

### Code Path Validation  
- [ ] Search for any remaining direct `score_prism` calls in frontend
- [ ] Verify tokenless fallback is logged if present
- [ ] Confirm error handling for expired/invalid tokens

### Observability Check
- [ ] Validate FC scoring path logs (`fc_scores_loaded` vs `fc_fallback_legacy`)
- [ ] Check completion event logging format consistency
- [ ] Verify token rotation events are tracked

---

## F) MINIMAL CHANGE PLAN

### Phase 1: Verification Only (No Edits)
1. Audit RLS policies on `profiles` table
2. Check for tokenless access fallbacks 
3. Validate error handling consistency

### Phase 2: Hardening (If Needed)
1. Tighten RLS policies if gaps found
2. Remove tokenless fallbacks if discovered
3. Standardize parameter naming and error formats

### Phase 3: Observability (Enhancement)
1. Improve logging consistency
2. Add monitoring for legacy path usage
3. Implement token rotation tracking

---

## RECOMMENDATION

**STATUS**: 🟢 **SAFE TO PROCEED** with verification phase

The current system is **substantially aligned** with the architectural plan. The unified scoring engine, tokenized access, and FC unification are all properly implemented. Only minor verification and potential hardening needed.

**No blind edits recommended** - proceed with systematic verification of RLS policies and access patterns first.