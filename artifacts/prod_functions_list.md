# Production Edge Functions List

**Project**: gnkuikentdtnatazeriu  
**Context**: Production  
**Query Time**: 2025-09-17T17:12:30Z

## Deployed Functions (from config.toml)

✅ **finalizeAssessment** (verify_jwt = false)  
✅ **score_prism** (verify_jwt = false)  
✅ **compare_runs** (verify_jwt = true)  
✅ **cleanup_profiles** (verify_jwt = false)  
✅ **backfill_profiles** (verify_jwt = false)  
✅ **chatgpt-gateway** (verify_jwt = false)  
✅ **updateSystemStatus** (verify_jwt = false)  
✅ **getConfig** (verify_jwt = false)  
✅ **getView** (verify_jwt = false)  
✅ **import_questions** (verify_jwt = false)  
✅ **save_response** (verify_jwt = false)  
✅ **get_progress** (verify_jwt = false)  
✅ **score_fc_session** (verify_jwt = false)  
✅ **get-results-by-session** (verify_jwt = false)  
✅ **notify_admin** (verify_jwt = false)  
✅ **assessment-api** (verify_jwt = false)  
✅ **refresh-dashboard** (verify_jwt = false)  
✅ **reddit-capi** (verify_jwt = false)

## Deployment Status Check

**Analytics Query**: Recent deployment logs (24h)
```sql
select id, function_edge_logs.timestamp, event_message, m.function_id, m.deployment_id, m.version 
from function_edge_logs
where function_edge_logs.timestamp > now() - interval '24 hours'
  AND event_message ILIKE '%deployed%'
```

**Result**: ❌ **NO DEPLOYMENT LOGS FOUND**

## Function File Verification

✅ **finalizeAssessment**: File exists at `supabase/functions/finalizeAssessment/index.ts`  
✅ **Casing**: Exact match "finalizeAssessment" (camelCase)  
✅ **Dependencies**: Uses `_shared/results-link.ts` (shared module)  
✅ **Runtime**: Deno edge runtime with proper CORS headers  
✅ **Configuration**: Public function (verify_jwt = false)

## Issue Assessment

**Status**: Function exists in codebase but **NO RECENT DEPLOYMENT EVIDENCE**  
**Impact**: Function may not be deployed to production runtime  
**Next**: Probe endpoints to confirm deployment status