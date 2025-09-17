# PRISM System Risk Assessment & Rollback Plan

## CRITICAL FINDINGS - NO IMMEDIATE ACTION REQUIRED

Based on the Global Safety Envelope audit, the PRISM system is **substantially aligned** with the architectural plan. The unified scoring engine, tokenized access model, and FC unification pipeline are correctly implemented.

## RISK CATEGORIES

### 🟢 LOW RISK - Architecture Aligned
- **Unified Scoring Flow**: `finalizeAssessment` → `score_fc_session` → `score_prism` ✅
- **Tokenized Results Access**: `/results/:id?t=<token>` via secure RPC ✅  
- **FC Unification**: `fc_scores` table used by scoring engine ✅
- **Edge Function Security**: Service role keys isolated server-side ✅

### 🟡 MEDIUM RISK - Needs Verification
1. **RLS Policy Review**: Verify `profiles` table doesn't have overly broad read access
2. **Token Management**: Confirm TTL and rotation mechanisms work correctly
3. **Error Consistency**: Standardize error formats across edge functions
4. **Version Alignment**: Ensure all components use consistent versioning

### 🔴 HIGH RISK - Requires Investigation  
1. **Legacy Code Paths**: Need to verify no direct `score_prism` calls bypass orchestration
2. **Tokenless Fallbacks**: Check if any legacy access patterns remain unlogged

## ROLLBACK STRATEGY

### Current State Backup
```sql
-- Backup current RLS policies before any changes
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('profiles', 'assessment_sessions', 'assessment_responses')
ORDER BY tablename, policyname;
```

### Rollback Commands (If Needed)
```sql
-- Restore original policies if hardening goes wrong
-- (To be populated after verification phase)
```

### Edge Function Rollback
- Current edge functions are stable and aligned
- No rollback needed unless policy changes break access
- Keep current versions as rollback targets

## VERIFICATION CHECKPOINTS

### Phase 1: Policy Audit (SAFE)
- [ ] Run Supabase linter to check RLS coverage
- [ ] Review `profiles` table policies for public access
- [ ] Verify `get_profile_by_session` grants are minimal

### Phase 2: Code Path Analysis (SAFE)  
- [ ] Search codebase for direct `score_prism` calls
- [ ] Check for tokenless result access patterns
- [ ] Validate error handling consistency

### Phase 3: Observability Check (SAFE)
- [ ] Confirm FC scoring path logging works
- [ ] Test token validation error flows  
- [ ] Verify completion event tracking

## IDEMPOTENCY NOTES

All proposed changes must be:
1. **Reversible**: Clear rollback steps for each modification
2. **Non-destructive**: Tighten policies, don't break existing functionality  
3. **Gradual**: Verify each change before proceeding to next
4. **Logged**: Track all policy changes for audit trail

## GO/NO-GO CRITERIA

### ✅ PROCEED IF:
- RLS linter shows no critical vulnerabilities
- No direct scoring bypasses found in code
- Current functionality works as expected

### ❌ STOP IF:
- Critical RLS gaps discovered (public read on profiles)
- Unlogged tokenless access found
- Error patterns suggest security bypass

## MONITORING DURING CHANGES

### Key Metrics to Watch:
- Failed token validation attempts
- Legacy FC fallback usage rates  
- Profile access error rates
- Assessment completion success rates

### Alert Thresholds:
- >5% increase in access errors = investigate
- >10% FC fallback rate = check FC pipeline
- Any tokenless access = security review

---

**NEXT STEP**: Execute Phase 1 verification only. No code changes until verification confirms system security posture.