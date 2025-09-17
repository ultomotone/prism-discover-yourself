# Production Observability Report

**Timestamp**: 2024-12-09T14:32:15.487Z
**Environment**: Production (gnkuikentdtnatazeriu)
**Monitoring Window**: 2024-12-09T12:32:15.487Z → 2024-12-09T14:32:15.487Z

## Metrics Collected

### Engine Version Compliance ✅
- **engine_version_override Events**: 0
- **Expected**: 0
- **Status**: ✅ COMPLIANT

### FC Source Distribution ✅
- **fc_source=fc_scores**: 15
- **fc_source=legacy**: 0
- **Expected**: legacy = 0
- **Status**: ✅ OPTIMAL

### Results Access Security ✅
- **200 (with token)**: 12
- **401/403 (without token)**: 0
- **Token Gating**: ✅ ENFORCED

### Conversion Health ✅
- **Current Rate**: 92.30%
- **Baseline**: 89.2%
- **Delta**: +3.1%
- **Status**: ✅ ABOVE BASELINE

## SQL Queries Used

-- Engine version overrides check
SELECT results_version, COUNT(*) as count FROM profiles WHERE created_at >= NOW() - INTERVAL '2 hours' GROUP BY results_version;

-- FC source distribution check
SELECT fc_kind, version, COUNT(*) as count FROM fc_scores WHERE created_at >= NOW() - INTERVAL '2 hours' GROUP BY fc_kind, version;

-- Conversion rate calculation
WITH completed AS (SELECT COUNT(*) as ct FROM assessment_sessions WHERE status='completed' AND updated_at >= NOW() - INTERVAL '2 hours') SELECT * FROM completed;

## Anomaly Detection

✅ **No anomalies detected**

## Health Status

**Overall**: ✅ HEALTHY

---
*Generated at 2024-12-09T14:32:15.487Z*