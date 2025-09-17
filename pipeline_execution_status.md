# Pipeline Execution Status

## GATE-EVIDENCE — Hard PASS Evidence Capture 
**Status:** READY TO EXECUTE  
**Script:** `run_evidence_gate.ts`  
**Expected:** fc_scores v1.2 + profiles v1.2.1 + tokenized URLs working

## BF-01-APPLY — Staging Backfill Apply
**Status:** READY TO EXECUTE  
**Script:** `run_backfill_apply.ts`  
**Target:** 39 sessions identified in backfill plan  
**Expected:** All sessions get fc_scores + profiles with correct versions

## STAGE-SOAK — Staging Health Check  
**Status:** READY TO EXECUTE  
**Script:** `run_staging_soak.ts`  
**Window:** 6 hours post-backfill  
**Expected:** >90% conversion, correct versioning, clean security/telemetry

## Execution Order
1. Run `ts-node run_evidence_gate.ts` - Must PASS before proceeding
2. Run `ts-node run_backfill_apply.ts` - Apply the planned backfill  
3. Wait 30 minutes for system stabilization
4. Run `ts-node run_staging_soak.ts` - Verify staging health
5. If all PASS → ready for production promotion

## Artifacts Generated
- `evidence_gate.md` - Evidence capture results
- `backfill_summary.md` - Backfill execution summary  
- `jobs/backfill_rollback.YYYY-MM-DD.sql` - Rollback script
- `staging_observability.md` - Health check results

## Next Steps After PASS
Ready for PROD-ORCH production promotion with same guard rails.