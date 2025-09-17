# PRISM Version Component Matrix

## Component × Version Status Grid

| Component | Declared Version | Effective Version | Expected Version | Status | Action Needed |
|-----------|------------------|-------------------|------------------|---------|---------------|
| **Core Engine** |
| `scoreEngine.ts` | v1.2.1 | v1.2.1 | v1.2.1 | ✅ ALIGNED | None |
| `score_prism` function | v1.2.1 | v1.2.1 | v1.2.1 | ✅ ALIGNED | None |
| **FC Pipeline** |
| `score_fc_session` | v1.2 | v1.2 | v1.2 | ✅ ALIGNED | None |
| `finalizeAssessment` FC call | v1.2 | v1.2 | v1.2 | ✅ ALIGNED | None |
| `score_prism` FC read | v1.2 | v1.2 | v1.2 | ✅ ALIGNED | None |
| **Shared Libraries** |
| `calibration.ts` | v1.2.0 | v1.2.0 | v1.2.1 | ⚠️ MINOR DRIFT | Update to v1.2.1 |
| `config.ts` | v1.2.0 | v1.2.0 | v1.2.1 | ⚠️ MINOR DRIFT | Update to v1.2.1 |
| **Database Config** |
| `scoring_config.results_version` | v1.1.2 | v1.1.2 | v1.2.1 | ❌ MAJOR DRIFT | Update to v1.2.1 |
| **Live Data** |
| `profiles.results_version` | v1.2.0 | v1.2.0 | v1.2.1 | ⚠️ MINOR DRIFT | Natural correction |
| `fc_scores.version` | - | - | v1.2 | ℹ️ EMPTY | Populate on usage |

---

## Flow Verification Matrix

| Flow Step | Component | Version Parameter | Status | Notes |
|-----------|-----------|-------------------|---------|-------|
| 1. Assessment Complete | `finalizeAssessment` | - | ✅ | Entry point |
| 2. FC Scoring | `score_fc_session` | `version: "v1.2"` | ✅ | Correct parameter |
| 3. FC Upsert | `fc_scores` table | `version: "v1.2"` | ✅ | Consistent storage |
| 4. Profile Scoring | `score_prism` | Uses `fc_scores` v1.2 | ✅ | Reads correct version |
| 5. Version Stamping | `profiles` | `results_version: "v1.2.1"` | ✅ | Hardcoded override |

---

## Orchestration Verification

### ✅ **Correct FC-First Flow**
```typescript
// finalizeAssessment → score_fc_session → score_prism
await supabase.functions.invoke("score_fc_session", {
  body: { session_id, version: "v1.2", basis: "functions" }
});
// Then...
await supabase.functions.invoke("score_prism", { 
  body: { session_id } 
});
```

### ✅ **Unified Engine Active**  
- `score_prism` prefers `fc_scores` over legacy per-question mapping
- Engine stamps consistent `results_version: "v1.2.1"`
- Legacy fallback logged as `evt:fc_fallback_legacy`

### ⚠️ **Configuration Drift**
- Database config lags at v1.1.2
- Engine hardcodes v1.2.1 as protection
- Shared libraries at v1.2.0

---

## Risk Assessment Summary

| Risk Level | Issue | Impact | Mitigation Status |
|------------|-------|---------|-------------------|
| 🔴 HIGH | DB config drift | Config queries wrong | Engine hardcoding protects |
| 🟡 MEDIUM | Library versions | Telemetry inconsistency | Non-functional impact |
| 🟢 LOW | Profile data versions | Historical inconsistency | Self-correcting |

---

## Compliance Status

**✅ ARCHITECTURE COMPLIANT**
- Unified scoring engine operational at v1.2.1
- FC unification working correctly at v1.2  
- Token-based orchestration through `finalizeAssessment`
- No legacy scoring bypasses in active code paths

**⚠️ CONFIGURATION ALIGNMENT NEEDED**
- Database config update required for monitoring accuracy
- Shared library version alignment for consistency
- No functional impact on assessment flow

**RECOMMENDATION**: Execute version alignment plan to eliminate configuration drift while preserving current functional stability.