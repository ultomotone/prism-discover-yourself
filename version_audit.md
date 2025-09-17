# PRISM Engine Version Consistency Audit

## Executive Summary

**Audit Date:** 2025-01-17  
**Target Engine Version:** v1.2.1  
**Target FC Version:** v1.2  
**Status:** ⚠️ **VERSION DRIFT DETECTED**

---

## Component Version Matrix

| Component | Location | Declared Version | Effective Version | Status |
|-----------|----------|------------------|-------------------|---------|
| **Edge Functions** |
| `score_prism` | `/supabase/functions/score_prism/index.ts` | v1.2.1 | v1.2.1 | ✅ ALIGNED |
| `score_fc_session` | `/supabase/functions/score_fc_session/index.ts` | v1.2 | v1.2 | ✅ ALIGNED |
| `finalizeAssessment` | `/supabase/functions/finalizeAssessment/index.ts` | v1.2 (FC call) | v1.2 | ✅ ALIGNED |
| **Shared Libraries** |
| Scoring Engine | `/supabase/functions/_shared/scoreEngine.ts` | v1.2.1 | v1.2.1 | ✅ ALIGNED |
| Calibration | `/supabase/functions/_shared/calibration.ts` | v1.2.0 | v1.2.0 | ⚠️ MINOR DRIFT |
| Config Manager | `/supabase/functions/_shared/config.ts` | v1.2.0 | v1.2.0 | ⚠️ MINOR DRIFT |
| **Database Config** |
| scoring_config | `results_version` key | **v1.1.2** | v1.1.2 | ❌ **MAJOR DRIFT** |
| **Live Data** |
| fc_scores | Table data | No records | - | ℹ️ EMPTY |
| profiles | Table data | v1.2.0 | v1.2.0 | ⚠️ MINOR DRIFT |

---

## Critical Findings

### ❌ **MAJOR DRIFT: Database Configuration**
- **Issue**: `scoring_config.results_version = "v1.1.2"` (should be v1.2.1)
- **Impact**: Configuration mismatch between engine expectation and database setting
- **Risk**: Engine defaults may not align with deployed expectations

### ⚠️ **MINOR DRIFT: Shared Libraries**
- **Issue**: Calibration and Config utilities at v1.2.0 while engine at v1.2.1
- **Impact**: Version stamp inconsistency in telemetry
- **Risk**: Low - functionality alignment maintained

### ✅ **PROPER ORCHESTRATION FLOW**
- `finalizeAssessment` correctly calls `score_fc_session` with `version: "v1.2"`
- `score_prism` correctly reads from `fc_scores` with `version: "v1.2"`
- FC basis set to `"functions"` as required

---

## Legacy Version References Found

### Direct v1.1 References (Acceptable - Admin Tools)
1. `backfill_rescore_v11/index.ts:26` - Legacy migration utility
2. `score_fc_session/index.ts:71` - Comment referencing v1.1 (informational)
3. `recompute_profiles_v11/index.ts:155` - Admin recompute utility
4. `train_confidence_calibration/index.ts:28` - Fallback default

**Assessment**: These are legitimate admin/migration tools, not active scoring paths.

### Configuration Defaults
1. `getConfig/index.ts:69` - Fallback default `"v1.1.2"` (acceptable)

---

## FC Integration Verification

### ✅ Correct FC Version Flow
```typescript
// finalizeAssessment (L31)
await supabase.functions.invoke("score_fc_session", {
  body: { session_id, version: "v1.2", basis: "functions" }
});

// score_prism (L90-91)  
.eq("version", "v1.2")
.eq("fc_kind", "functions")
```

### ✅ Fallback Behavior
- `score_prism` logs `evt:fc_fallback_legacy` when FC scores not found
- Legacy per-question mapping remains as emergency fallback
- Non-fatal FC errors handled correctly in `finalizeAssessment`

---

## Engine Output Versioning

### ✅ Correct Version Stamping
```typescript
// scoreEngine.ts (L269-270)
version: config.results_version,        // "v1.2.1" 
results_version: config.results_version // "v1.2.1"

// score_prism.ts (L156-157) - Override ensures consistency
results_version: "v1.2.1",
version: "v1.2.1"
```

### ⚠️ Database Config Lag
- Engine hardcodes v1.2.1 regardless of `scoring_config.results_version`
- This prevents version drift but masks configuration issues

---

## Risk Assessment

### 🔴 **HIGH PRIORITY**
1. **Database Config Drift**: `scoring_config.results_version` outdated
   - **Impact**: Configuration queries return wrong version
   - **Mitigation**: Update to v1.2.1 immediately

### 🟡 **MEDIUM PRIORITY**  
2. **Shared Library Versions**: Calibration/Config at v1.2.0
   - **Impact**: Inconsistent telemetry and version reporting
   - **Mitigation**: Bump to v1.2.1 for consistency

### 🟢 **LOW PRIORITY**
3. **Profile Data**: Existing profiles at v1.2.0
   - **Impact**: Historical version stamps inconsistent
   - **Mitigation**: Natural correction through recomputes

---

## Recommendations

### Immediate Actions Required
1. **Update Database Config**:
   ```sql
   UPDATE scoring_config 
   SET value = '"v1.2.1"'::jsonb 
   WHERE key = 'results_version';
   ```

2. **Version Alignment**: Update shared libraries to v1.2.1

### Monitoring Requirements
- Track `scoring_config.results_version` in deployment health checks
- Monitor FC version consistency in `fc_scores` table
- Alert on version mismatches in telemetry

### Rollback Strategy
- Current engine hardcoding v1.2.1 provides safety net
- Database config update is reversible
- Shared library versions are backwards compatible

---

**CONCLUSION**: System is functionally correct but has configuration drift. Engine hardcoding prevents operational issues, but database config should align for consistency and monitoring accuracy.