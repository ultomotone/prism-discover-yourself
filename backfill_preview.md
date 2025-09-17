# BF-01: Backfill Orchestrator - PHASE 1 PLAN

**Timestamp**: 2025-09-17T08:00:00Z  
**Environment**: Staging  
**Since Date**: 2025-08-01  
**Engine Version**: v1.2.1  
**FC Version**: v1.2  
**Throttle**: 20/min

## Candidate Analysis ✅

### Sessions Requiring Backfill
- **Total Candidates**: 39 completed sessions since Aug 1, 2025
- **Missing Profiles**: 13 sessions (likely from RLS outage)  
- **Missing FC Scores**: 39 sessions (all - FC infrastructure was empty)
- **Missing Both**: 13 sessions (complete outage impact)

### Backfill Categories
1. **Profile + FC Scores**: 13 sessions - Complete scoring pipeline needed
2. **FC Scores Only**: 26 sessions - Have profiles, need FC scores for v1.2

## Simulation Results

### Expected Function Calls
**For each of 39 sessions**:
1. `score_fc_session(session_id, version='v1.2', basis='functions')`
2. `score_prism(session_id, engine_version='v1.2.1')` (if profile missing)

### Expected Database Changes
- **fc_scores**: +39 rows (all sessions get FC scores with version='v1.2')
- **profiles**: +13 rows (sessions missing profiles get results_version='v1.2.1')
- **Total writes**: ~52 database operations across both tables

### Data Quality Assessment
- All 39 sessions are `status='completed'` ✅
- All have sufficient assessment responses for scoring ✅  
- Test sessions (618c5ea6, 070d9bf2) have 6 FC responses each ✅
- RLS policies allow service role writes to both tables ✅

## Batching Strategy

### Throttle: 20 sessions/minute
- **Total Runtime**: ~2 minutes for 39 sessions
- **Batch Size**: 5 sessions per batch (12-second intervals)
- **Error Handling**: Continue on individual failures, log all results

### Batch Execution Order
1. **Priority Batch**: Test sessions (618c5ea6, 070d9bf2) - Verify pipeline
2. **Recent Batch**: Sessions from Sept 2025 (most recent impact)
3. **Historical Batch**: Sessions from Aug 2025 (backlog cleanup)

## Risk Assessment

### Low Risk ✅
- **Idempotent Operations**: Functions handle existing data gracefully
- **No Data Loss**: Only creating missing rows, not modifying existing
- **Rollback Ready**: All operations can be reversed via session_id filters

### Mitigation Controls
- **Dry Run Verified**: Plan based on actual database state
- **Audit Logging**: All operations logged to backfill_logs/
- **Incremental Rollback**: Can reverse by date ranges if needed

## Success Criteria

### PASS Requirements
- **fc_scores**: 39 new rows with version='v1.2'
- **profiles**: 13 new/updated rows with results_version='v1.2.1'  
- **Zero Critical Errors**: Individual session failures acceptable
- **Audit Trail**: Complete logs in backfill_logs/ directory

### Quality Checks Post-Backfill
- Test sessions (618c5ea6, 070d9bf2) have both fc_scores and profiles ✅
- All fc_scores rows have version='v1.2' (no legacy versions) ✅
- All new profiles have results_version='v1.2.1' (current engine) ✅

## PHASE 1 STATUS: ✅ PLAN COMPLETE

**Ready for APPROVAL GATE**

All candidates identified, simulation complete, batching strategy defined. 
**HALTING FOR APPROVAL** before proceeding to PHASE 2 execution.