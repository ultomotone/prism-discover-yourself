# Backfill Pipeline Implementation

Complete implementation of the three-phase backfill pipeline with guarded execution, comprehensive monitoring, and rollback capabilities.

## Phase Overview

### 🚀 PHASE 1: BACKFILL (Staging) — APPLY (Guarded)
**Script**: `run_backfill_staging_apply.ts`
- Executes staged backfill plan (~39 sessions)
- Throttled at 20 sessions/minute
- Generates comprehensive logs and rollback artifacts
- **Halts for review** before proceeding

### 📊 PHASE 2: STAGING SOAK — 6h (Read-only)  
**Script**: `run_staging_soak_monitor.ts`
- Monitors for 6 hours (configurable)
- Checks version overrides, legacy FC usage, tokenized results
- Calculates conversion rate vs baseline (85%)
- **Halts for prod go/no-go decision**

### 🔍 PHASE 3: PROD HEALTH (Optional quick check)
**Script**: `run_prod_health_check.ts`  
- Discovers prod sessions needing backfill
- Generates idempotent mini backfill plan if needed
- **Halts with recommendations**

## Quick Start

### Option 1: Run Full Pipeline (with manual approval gates)
```bash
node run_backfill_pipeline.ts
# Review backfill_summary.md, then continue manually:
node run_staging_soak_monitor.ts  
node run_prod_health_check.ts
```

### Option 2: Run Individual Phases
```bash
# Phase 1: Apply backfill
node run_backfill_staging_apply.ts

# Phase 2: Monitor staging (after reviewing backfill results)
node run_staging_soak_monitor.ts

# Phase 3: Check prod health
node run_prod_health_check.ts
```

## Generated Artifacts

### Backfill Phase
- `backfill_summary.md` - Execution summary and results
- `backfill_logs/execution_results.json` - Detailed execution data
- `backfill_logs/batch_*.json` - Per-batch execution logs
- `backfill_logs/rollback_YYYY-MM-DD.sql` - Rollback script

### Staging Soak Phase  
- `staging_observability.md` - 6-hour monitoring report
- Metrics: version overrides, FC usage, conversion rate, tokenized access

### Prod Health Phase
- `prod_health_check.md` - Production health analysis
- `prod_mini_backfill_plan.json` - Mini backfill plan (if needed)

## Safety Features

### Idempotent Operations
- All operations can be safely re-run
- Duplicate detection and handling
- Graceful handling of existing data

### Throttling & Rate Limiting
- 20 sessions/minute maximum processing rate
- Configurable delays between operations
- Resource-conscious execution

### Comprehensive Logging
- Per-session operation logs
- Error tracking and categorization  
- Execution timing and performance metrics

### Rollback Capabilities
- Automatic rollback script generation
- Timestamp-based rollback targeting
- Verification queries included

### Approval Gates
- Manual review points between phases
- Clear pass/fail criteria
- Halting mechanisms for safety

## Environment Requirements

```bash
# Required environment variable
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Verify connection
node -e "console.log('✅ Service key loaded:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'YES' : 'NO')"
```

## Monitoring & Verification

### Key Metrics to Watch
- **Version Overrides**: Should be 0 (no engine_version_override events)
- **FC Usage**: Should be 100% `fc_kind='functions'` (no legacy)
- **Conversion Rate**: Should be ≥85% (completed sessions → profiles)
- **Tokenized Access**: Should be 100% successful

### Success Criteria
- ✅ All backfill operations complete successfully
- ✅ No version override events in telemetry
- ✅ FC pipeline uses v1.2 consistently
- ✅ Profiles stamped with results_version = "v1.2.1"
- ✅ Conversion rate maintains baseline (≥85%)

## Troubleshooting

### Common Issues
1. **Service key not found**: Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
2. **Rate limiting**: Increase throttle delay in plan configuration
3. **Function timeouts**: Check edge function logs for specific errors
4. **Version mismatches**: Verify plan configuration matches expected versions

### Debug Commands
```bash
# Check environment
echo $SUPABASE_SERVICE_ROLE_KEY

# Verify database connectivity
node -e "import('./supabase/admin.js').then(m => m.admin.from('profiles').select('count').limit(1).then(console.log))"

# Check edge function logs
# Visit: https://supabase.com/dashboard/project/gnkuikentdtn[...]/functions/score_prism/logs
```

### Recovery Procedures
1. **Partial failure**: Review individual session errors in batch logs
2. **Complete failure**: Use rollback script to return to previous state  
3. **Stuck state**: Check edge function logs and database constraints

## Integration Points

### Existing Systems
- Uses existing `jobs/backfill_apply.plan.json` configuration
- Integrates with current edge functions (`score_fc_session`, `score_prism`)
- Leverages existing database schema and RLS policies

### Monitoring Integration  
- Compatible with existing observability infrastructure
- Structured logging for external monitoring systems
- Metrics format ready for dashboard integration

---

**Status**: ✅ Implementation Complete  
**Last Updated**: 2025-09-17  
**Phase**: Ready for Execution