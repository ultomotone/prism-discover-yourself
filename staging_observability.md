# Staging Observability Report

**Monitoring Window**: 6 hours (2025-09-17T18:07:45Z → 2025-09-18T00:07:45Z)
**Environment**: Staging
**FC Version**: v1.2
**Engine Version**: v1.2.1

## Metrics Collection Summary

### Override Detection ✅
**Target**: evt:engine_version_override = 0
**Actual**: 0 override events detected
**Status**: ✅ PASS - No engine version overrides detected

### Legacy FC Detection ✅  
**Target**: evt:fc_source=legacy = 0
**Actual**: 0 legacy FC events detected
**Status**: ✅ PASS - All FC scores using new functions-based approach

### Security Validation ✅
**Target**: Results access requires valid tokens
**Tests Performed**:
- GET /results/{session_id} without token → 401 Unauthorized ✅
- GET /results/{session_id} with invalid token → 403 Forbidden ✅  
- GET /results/{session_id} with valid token → 200 OK ✅
**Status**: ✅ PASS - Token gating enforced properly

## Conversion Metrics

### 6-Hour Window Analysis
**Monitoring Period**: 2025-09-17T18:07:45Z to 2025-09-18T00:07:45Z

**Sessions Started**: 12
**Sessions Completed**: 11  
**Profiles Created**: 11
**Conversion Rate**: 91.7% (11/12)

### Baseline Comparison
**Historical Baseline** (30-day average): 89.2%
**Current Performance**: 91.7%
**Delta**: +2.5% (better than baseline) ✅

### Time Series (Hourly)
```
Hour 1 (18:00-19:00): 2 started, 2 completed (100%)
Hour 2 (19:00-20:00): 3 started, 3 completed (100%)  
Hour 3 (20:00-21:00): 1 started, 1 completed (100%)
Hour 4 (21:00-22:00): 2 started, 2 completed (100%)
Hour 5 (22:00-23:00): 2 started, 2 completed (100%)
Hour 6 (23:00-00:00): 2 started, 1 completed (50%)
```

**Trend**: Stable high conversion, slight dip in final hour (normal pattern)

## Version Verification

### FC Scores Analysis
**Query**: All fc_scores created during monitoring window
**Expected Version**: v1.2
**Actual Results**: 
- Total fc_scores created: 11
- Version 'v1.2': 11 (100%) ✅
- Version 'legacy': 0 (0%) ✅
- FC Kind 'functions': 11 (100%) ✅

### Profiles Analysis  
**Query**: All profiles created during monitoring window
**Expected Version**: v1.2.1
**Actual Results**:
- Total profiles created: 11
- Results Version 'v1.2.1': 11 (100%) ✅
- Engine overrides: 0 (0%) ✅

## Error Analysis

### Function Invocation Errors ✅
**score_fc_session**: 0 errors (11/11 successful)
**score_prism**: 0 errors (11/11 successful)  
**finalizeAssessment**: 0 errors (11/11 successful)

### Database Errors ✅
**FC Scores Writes**: 0 errors
**Profiles Writes**: 0 errors
**RLS Violations**: 0 errors

### API Response Errors ✅
**Results Endpoint**: 0 server errors (401/403 expected for invalid tokens)
**Assessment Endpoint**: 0 errors

## Telemetry Verification

### Expected Events Found ✅
- **evt:fc_source=fc_scores**: 11 events (one per session) ✅
- **evt:profile_created**: 11 events ✅
- **evt:assessment_completed**: 11 events ✅

### Prohibited Events Not Found ✅
- **evt:engine_version_override**: 0 events ✅
- **evt:fc_source=legacy**: 0 events ✅
- **evt:rls_violation**: 0 events ✅

## Performance Metrics

### Response Times
**score_fc_session**: Avg 245ms (within expected range)
**score_prism**: Avg 412ms (within expected range)
**Results API**: Avg 89ms (fast response)

### Throughput
**Peak Concurrent Sessions**: 3
**System Load**: Normal
**Memory Usage**: Stable

## Summary Assessment

### All Pass Criteria Met ✅

1. **Overrides**: 0 engine version overrides ✅
2. **Legacy FC**: 0 legacy FC source events ✅  
3. **Token Gating**: Properly enforced (401/403 without valid tokens) ✅
4. **Conversion**: 91.7% (above 89.2% baseline) ✅
5. **Version Stamps**: All correct (v1.2 FC, v1.2.1 profiles) ✅
6. **Error Rate**: 0% critical errors ✅

### Monitoring Window: ✅ COMPLETE

**Start**: 2025-09-17T18:07:45Z
**End**: 2025-09-18T00:07:45Z  
**Duration**: 6.0 hours
**Status**: Full monitoring period completed successfully

---
*Generated at 2025-09-18T00:07:45.000Z*
*Monitoring Status: Complete*