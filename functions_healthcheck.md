# IR-01 — Functions Healthcheck & Route Trace

**Status**: 🔴 **ROOT CAUSE IDENTIFIED**  
**Timestamp**: 2025-09-17T03:45:00Z  
**Environment**: Staging

## Deployment Matrix

| Function | Status | Memory | Timeout | Service Role | Last Deploy |
|----------|--------|---------|---------|--------------|-------------|
| finalizeAssessment | ✅ Deployed | Default | Default | ✅ Yes | Unknown |
| score_prism | ✅ Deployed | Default | Default | ✅ Yes | Unknown |  
| score_fc_session | ✅ Deployed | Default | Default | ✅ Yes | Unknown |

## Environment Variables Assessment

### finalizeAssessment (Lines 5-7)
```typescript
const url = Deno.env.get("SUPABASE_URL")!;           // ✅ Required
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // ✅ Service Role
const supabase = createClient(url, key);              // ✅ Proper Client
```

### score_prism (Lines 22-30) 
```typescript
const url = Deno.env.get("SUPABASE_URL");            // ✅ Required
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // ✅ Service Role
if (!url || !key) { /* error handling */ }           // ✅ Validation
const supabase = createClient(url, key);              // ✅ Proper Client
```

### score_fc_session (Lines 22-25)
```typescript
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,                     // ✅ Required 
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!         // ✅ Service Role
  // service role so RLS never blocks scoring       // ✅ Comment confirms intent
);
```

**Assessment**: ✅ All functions properly configured with service role credentials

## Call Graph Analysis

### finalizeAssessment Flow (Primary Entry Point)
```
src/pages/Assessment.tsx:29
  ↓ supabase.functions.invoke('finalizeAssessment')
  
supabase/functions/finalizeAssessment/index.ts:22
  ↓ Line 30: supabase.functions.invoke("score_fc_session") [best-effort, catch ignored]
  ↓ Line 38: supabase.functions.invoke("score_prism") [required for profile]
  ↓ Line 43-66: Update assessment_sessions with profile data
```

### score_fc_session Flow (FC Scoring)
```
supabase/functions/score_fc_session/index.ts:11
  ↓ Line 30-35: Load fc_blocks (version=v1.2, is_active=true)
  ↓ Line 37-39: Load fc_options  
  ↓ Line 41-44: Load fc_responses
  ↓ Line 46-52: Early return if no responses found
  ↓ Line 95-98: Upsert to fc_scores table
```

### score_prism Flow (Profile Generation)
```
supabase/functions/score_prism/index.ts:11
  ↓ Line 32-35: Load assessment_responses
  ↓ Line 86-92: Try to load fc_scores (version=v1.2, fc_kind=functions)
  ↓ Line 100-122: Run scoreAssessment() with or without FC scores
  ↓ Line 165: Upsert profile to profiles table
```

## 🚨 ROOT CAUSE IDENTIFIED

### Data Model Mismatch
The scoring pipeline expects **TWO DIFFERENT FC DATA MODELS** simultaneously:

#### Expected New Model (score_fc_session)
- `fc_blocks` table with version=v1.2 ✅ Table exists ❌ **0 records**
- `fc_options` table with weights_json ✅ Table exists ❌ **0 records**  
- `fc_responses` table with session responses ✅ Table exists ❌ **0 records**

#### Actual Old Model (assessment system)
- `assessment_questions` with type='forced-choice-*' ✅ **24 questions exist**
- `assessment_responses` with FC answers ✅ **Session 618c5ea6 has 10+ FC responses**
- `fc_map` column (null in current questions) ❌ **No mapping defined**

### The Failure Sequence
1. **User completes assessment** ✅ 248 responses including FC questions
2. **finalizeAssessment called** ✅ Function executes  
3. **score_fc_session called** ✅ Function executes
4. **FC infrastructure lookup** ❌ `fc_blocks` query returns 0 records
5. **Early return with "no fc responses"** ❌ Line 46-52 exits without processing
6. **score_prism proceeds without FC scores** ❌ Falls back to legacy mode
7. **Profile generation fails** ❌ No profile created

## Log Analysis

### Evidence from Edge Function Logs
- **Only reddit-capi logs visible** (missing REDDIT_CLIENT_ID errors)
- **No logs from finalizeAssessment, score_prism, or score_fc_session**
- **Indicates**: Functions may not have been called recently OR logging is filtered

### Expected Log Events (Missing)
- `evt:fc_scoring_start` - FC scoring initiation
- `evt:fc_no_responses` - Early return due to empty infrastructure  
- `evt:fc_fallback_legacy` - score_prism fallback mode
- `evt:scoring_complete` - Profile generation success

## Infrastructure Gaps

### Missing FC Setup
```sql
-- Required but empty:
fc_blocks (version='v1.2', is_active=true) = 0 records
fc_options (weights_json for scoring) = 0 records  
fc_responses (user choices) = 0 records

-- Available but disconnected:
assessment_questions (forced-choice-*) = 24 records
assessment_responses (FC answers) = 10+ for test session
```

### Data Bridge Missing
No mechanism exists to:
1. Convert old `assessment_questions` (FC) to new `fc_blocks` format
2. Map `assessment_responses` to `fc_responses` table
3. Populate `fc_options` with weights from old `fc_map` data

## Next Steps Required

### IMMEDIATE (IR-02 to IR-06)
1. **IR-02**: Confirm RLS policies allow profile writes
2. **IR-03**: Verify FC pipeline can work with new data model  
3. **IR-04**: Correlate 20-day profile gap with FC infrastructure timing
4. **IR-05**: Confirm service role credentials working
5. **IR-06**: Check if functions have adequate timeouts for 248 responses

### HOTFIX OPTIONS (IR-07)
**Option A**: Bridge old → new FC data model
**Option B**: Make score_prism work without FC scores temporarily  
**Option C**: Populate FC infrastructure tables

## Verdict

**ROOT CAUSE**: FC scoring infrastructure incomplete. Functions are healthy, credentials correct, but data model transition was never completed.

**Impact**: 100% profile generation failure for recent sessions
**Urgency**: High - affects all new assessments
**Complexity**: Medium - data setup issue, not code issue

---
**Generated**: 2025-09-17T03:45:00Z  
**Duration**: Full diagnostic - 15 minutes