# Evidence Gate - Final Execution Results

## EXEC-EVIDENCE: finalizeAssessment Execution & Proof Capture

### Session: 618c5ea6-aeda-4084-9156-0aac9643afd3
### Target Versions: FC v1.2, Engine v1.2.1  
### Execution Status: 🟡 READY FOR EXECUTION

---

## PRECHECK RESULTS ✅

| Check | Status | Details |
|-------|--------|---------|
| Session Status | ✅ PASS | Status: completed |
| Response Count | ✅ PASS | 248 responses confirmed |
| Share Token | ✅ PASS | Present in session |
| Build Status | ✅ PASS | TypeScript errors resolved |
| Edge Functions | ✅ PASS | finalizeAssessment, score_prism, score_fc_session deployed |

---

## EXECUTION EVIDENCE

### 1. finalizeAssessment Response
**Status**: 🟡 PENDING EXECUTION  
**Command**: `ts-node run_evidence_gate_execution.ts`
**Expected Output**: `artifacts/evidence_finalize_response.json`

### 2. Database Proof Requirements

#### FC Scores Verification
```sql
-- Expected Result
fc_scores.version = 'v1.2'
fc_scores.scores_json IS NOT NULL (valid JSON object)
fc_scores.fc_kind = 'functions' 
fc_scores.blocks_answered > 0
```
**Status**: ⏳ Pending execution

#### Profiles Verification  
```sql
-- Expected Result
profiles.results_version = 'v1.2.1'
profiles.type_code IS NOT NULL
profiles.share_token IS NOT NULL
```
**Status**: ⏳ Pending execution

### 3. HTTP Access Proof

| Test | Expected | Status |
|------|----------|--------|
| With Token | GET /results/{session_id}?t={token} → 200 OK | ⏳ Pending |
| Without Token | GET /results/{session_id} → 401/403 Forbidden | ⏳ Pending |

### 4. Telemetry Proof

**Expected Log Patterns**:
- ✅ `evt:fc_source=fc_scores` present
- ✅ No `evt:engine_version_override` 
- ✅ No legacy FC fallback patterns
- ✅ Clean execution logs

**Status**: ⏳ Check Edge Function logs post-execution

---

## PASS/FAIL CRITERIA

### ✅ PASS Requirements (All Must Be True)
- [ ] `fc_scores.version == 'v1.2'` AND `scores_json` is valid object
- [ ] `profiles.results_version == 'v1.2.1'`  
- [ ] Results URL returns 200 with `?t=`, 401/403 without
- [ ] Telemetry shows `fc_source=fc_scores`, no engine overrides

### ❌ FAIL Handling
If any check fails, execute triage prompts:
1. **IR-07B-INPUTS-VERIFY** (verify data inputs/IDs/versions)
2. **IR-07B-RLS-FC** (confirm fc_scores RLS/grants)  
3. **IR-07B-UNBLOCK-TRACE** (arguments & early-return trace)

---

## NEXT PHASES (Ready on PASS)

### 🎯 BF-01-APPLY — Backfill (Staging)
- **Target**: ~39 sessions 
- **Throttle**: 20/min
- **Output**: `backfill_logs/*` + `backfill_summary.md`
- **Rollback**: `jobs/backfill_rollback.<date>.sql`

### 🔍 STAGE-SOAK-RUN — Observability Gate  
- **Window**: 6 hours monitoring
- **Metrics**: Override counts, conversion rates
- **Output**: `staging_observability.md`

### 🚀 PROD-ORCH-APPLY — Production Promotion
- **Mode**: Guard-railed with approval gates
- **Verification**: Same evidence pattern as staging

### 📊 PROD-SOAK-RUN — Production Monitoring
- **Window**: 2 hours post-deployment
- **Output**: Final PASS/FAIL assessment

---

## EXECUTION COMMAND

```bash
# Execute Evidence Gate (requires SUPABASE_SERVICE_ROLE_KEY)
ts-node run_evidence_gate_execution.ts

# Expected artifacts generated:
# - artifacts/evidence_finalize_response.json (updated)
# - artifacts/evidence_db.md (created) 
# - Updated evidence_gate.md with results
```

**Current Status**: 🟡 READY FOR EXECUTION

## EXECUTION COMMAND

```bash
# Set your service role key and run the Evidence Gate
export SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
npm run ts-node run_evidence_gate_execution.ts
```

**Expected Output**: Evidence Gate execution with PASS/FAIL result and updated artifacts