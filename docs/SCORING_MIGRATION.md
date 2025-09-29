# Scoring Results Migration to Unified Table

## Overview

This document describes the migration from exploded legacy scoring tables to a unified `scoring_results` table that stores complete assessment results as JSON payloads.

## Architecture

### Unified Table: `scoring_results`
- **Primary Key**: `session_id` (UUID, references `assessment_sessions`)
- **Payload**: Complete JSON object with all scoring data (profile, types, functions, state, session)
- **Convenience Columns**: `type_code`, `confidence` for quick filtering
- **Versioning**: `scoring_version` tracks the scoring engine version

### Legacy Tables (Phase 1 - Compatibility Mode)
- `profiles` - Main profile data
- `scoring_results_types` - Type scores breakdown
- `scoring_results_functions` - Function strength data  
- `scoring_results_state` - State/overlay information

## Implementation Phases

### Phase 1: Dual Write (Current)
- All scoring operations write to both unified `scoring_results` and legacy tables
- `persistResultsV3` handles unified writes + legacy compatibility
- `get-results-by-session` reads from unified table first, falls back to legacy RPC
- Controlled by `WRITE_EXPLODED = true` flag

### Phase 2: Unified Only (Future)
- Set `WRITE_EXPLODED = false` in `persistResultsV3.ts`
- Remove legacy table dependencies
- Frontend reads only from unified payloads

## Key Components

### Shared Types (`_shared/types.results.ts`)
```typescript
interface ScoringPayload {
  version: string;
  profile: { session_id, type_code, confidence, ... };
  types: Array<{ type_code, fit, share, ... }>;
  functions: Array<{ func_code, strength, ... }>;
  state: { overlay_band, blocks, ... };
  session: { id, status, ... };
  results_version: string;
}
```

### Persistence Layer (`_shared/persistResultsV3.ts`)
- Primary write to `scoring_results` (idempotent UPSERT)
- Optional legacy writes when `WRITE_EXPLODED = true`
- Comprehensive error handling and logging

### Updated Functions
- `score_prism`: Uses `persistResultsV3` instead of direct table writes
- `get-results-by-session`: Reads unified table first, legacy fallback
- `admin-backfill-scoring_results`: Migrates historical data

## Benefits

1. **Single Source of Truth**: All scoring data in one place
2. **Performance**: Fewer joins, single query for complete results
3. **Versioning**: Clear tracking of scoring engine versions
4. **Flexibility**: JSON payload supports schema evolution
5. **Caching**: Complete results cached as single object

## Data Migration

### Backfill Process
```bash
# Run backfill function to migrate existing data
POST /functions/v1/admin-backfill-scoring_results
```

The backfill:
1. Identifies sessions with legacy data but no unified entry
2. Rebuilds complete payloads from legacy tables
3. Stores in unified table using `persistResultsV3`
4. Reports success/failure statistics

### Validation
- Compare unified vs legacy results for accuracy  
- Monitor cache hit rates in `get-results-by-session`
- Verify payload completeness and structure

## Monitoring

### Key Metrics
- `persistResultsV3_unified_success/failed` - Write success rate
- `results.unified_cache_hit` - Read performance
- `persistResultsV3_legacy_failed_non_fatal` - Legacy write issues

### Logs
All operations emit structured JSON logs with session_id for traceability.

## Security Notes

The `scoring_results` table uses the same permissive RLS policies as legacy tables for compatibility. In production, consider more restrictive policies based on session ownership.

## Rollback Plan

1. Set `WRITE_EXPLODED = true` to re-enable legacy writes
2. Update `get-results-by-session` to prioritize legacy RPC
3. Legacy tables contain complete data for rollback scenarios

---

**Status**: Phase 1 implemented - dual write with legacy compatibility  
**Next**: Monitor performance and plan Phase 2 transition