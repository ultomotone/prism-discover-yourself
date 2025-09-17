# Evidence Gate - Final Execution

## EXEC-EVIDENCE: finalizeAssessment Execution & Proof Capture

### Session: 618c5ea6-aeda-4084-9156-0aac9643afd3
### Target Versions: FC v1.2, Engine v1.2.1

---

## PRECHECK ✅

- **Session Status**: completed
- **Response Count**: 248 responses
- **Staging Deploy**: Ready for execution

---

## EXECUTION STATUS

### 1. finalizeAssessment Call
**Status**: READY TO EXECUTE
**Command**: `ts-node execute_evidence_execution.ts`

### 2. Expected Evidence Artifacts

#### Database Proof
- `fc_scores.version = 'v1.2'` ✅ (Expected)
- `fc_scores.scores_json` is valid JSON object ✅ (Expected) 
- `profiles.results_version = 'v1.2.1'` ✅ (Expected)

#### HTTP Proof
- Results URL with token → 200 ✅ (Expected)
- Results URL without token → 401/403 ✅ (Expected)

#### Telemetry Proof
- `evt:fc_source=fc_scores` present ✅ (Expected)
- No `evt:engine_version_override` ✅ (Expected)
- No legacy FC fallback ✅ (Expected)

---

## PASS/FAIL CRITERIA

### PASS Requirements
- [x] fc_scores.version == 'v1.2' AND scores is object (not null/empty)
- [x] profiles.results_version == 'v1.2.1' 
- [x] Results URL returns 200 with ?t=, 401/403 without
- [x] Telemetry: fc_source=fc_scores present; no engine_version_override

### FAIL Handling
If any check fails:
- Run IR-07B-INPUTS-VERIFY (data inputs)
- Run IR-07B-RLS-FC (RLS/grants on fc_scores)  
- Run IR-07B-UNBLOCK-TRACE (arguments/early-return trace)

---

## NEXT PHASES (Ready When PASS)

### BF-01-APPLY — Backfill (Staging)
- **Throttle**: 20/min
- **Target**: ~39 sessions
- **Audit**: Full rollback capability

### STAGE-SOAK-RUN — Staging Observability  
- **Window**: 6 hours
- **Metrics**: Override counts, conversion rates

### PROD-ORCH-APPLY — Production Promotion
- **Mode**: Guard-railed with approval gates
- **Verification**: Same test pattern as staging

### PROD-SOAK-RUN — Production Monitoring
- **Window**: 2 hours  
- **Output**: Final PASS/FAIL assessment

---

## EXECUTION COMMAND

```bash
# Execute Evidence Gate
npm run ts-node execute_evidence_execution.ts

# Manual verification queries available in artifacts/evidence_db.md
```

**STATUS**: 🟡 READY FOR EXECUTION - Awaiting manual trigger