# PRISM Version Component Matrix

## Component × Version Status Grid

| Component | Location | Declared Version | Effective Version | Status | Action Needed |
|-----------|----------|------------------|-------------------|---------|---------------|
| **Core Engine** |
| `scoreEngine.ts` | `/_shared/score-engine/index.ts` | v1.2.1 | v1.2.1 | ✅ ALIGNED | None |
| `score_prism` function | `/functions/score_prism/index.ts` | v1.2.1 | v1.2.1 | ✅ ALIGNED | None |
| **FC Pipeline** |
| `score_fc_session` | `/functions/score_fc_session/index.ts` | v1.2 | v1.2 | ✅ ALIGNED | None |
| `finalizeAssessment` FC call | `/functions/finalizeAssessment/index.ts` | v1.2 | v1.2 | ✅ ALIGNED | None |
| `score_prism` FC read | `/functions/score_prism/index.ts` | v1.2 | v1.2 | ✅ ALIGNED | None |
| **Shared Libraries** |
| `calibration.ts` | `/_shared/calibration.ts:35` | v1.2.1 | v1.2.1 | ✅ ALIGNED | None |
| `config.ts` | `/_shared/config.ts:77` | v1.2.1 | v1.2.1 | ✅ ALIGNED | None |
| **Database Config** |
| `scoring_config.results_version` | DB table | v1.2.1 | v1.2.1 | ✅ ALIGNED | None |
| **Live Data** |
| `profiles.results_version` | Table data | v1.2.1 | v1.2.1 | ✅ ALIGNED | Natural correction |
| `fc_scores.version` | Table data | - | - | ℹ️ EMPTY | Populate on usage |

---

## Flow Verification Matrix

| Flow Step | Component | Version Parameter | Status | Notes |
|-----------|-----------|-------------------|---------|-------|
| 1. Assessment Complete | `finalizeAssessment` | - | ✅ | Entry point |
| 2. FC Scoring | `score_fc_session` | `version: "v1.2"` | ✅ | Correct parameter |
| 3. FC Upsert | `fc_scores` table | `version: "v1.2"` | ✅ | Consistent storage |
| 4. Profile Scoring | `score_prism` | Uses `fc_scores` v1.2 | ✅ | Reads correct version |
| 5. Version Stamping | `profiles` | `results_version: "v1.2.1"` | ✅ | Engine enforced |

---

## Observability Integration

### ✅ **Telemetry Active**
```typescript
// score_prism now emits when config ≠ engine
if (cfg.results_version !== "v1.2.1") {
  console.log(`evt:engine_version_override,db_version:${cfg.results_version},engine_version:v1.2.1`);
}
```

### ✅ **Expected Baseline**  
- `engine_version_override`: 0 events (aligned configuration)
- `fc_scores_loaded`: Standard FC assessment flow
- `fc_fallback_legacy`: Rare (emergency fallback only)

---

## Compliance Status

**✅ ARCHITECTURE COMPLIANT**
- Unified scoring engine operational at v1.2.1
- FC unification working correctly at v1.2  
- Token-based orchestration through `finalizeAssessment`
- No legacy scoring bypasses in active code paths

**✅ CONFIGURATION ALIGNED**
- Database config updated to v1.2.1
- Shared library versions consistent at v1.2.1
- Telemetry active for future drift detection

**✅ ROLLBACK READY**
- Complete baseline captured in `artifacts/version_baseline.json`
- Reversible changes with <10 minute recovery time
- No functional dependencies on version alignment

---

**STATUS**: All components aligned to target versions. System ready for staging promotion.