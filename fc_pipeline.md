# IR-03 — FC Pipeline Integrity Analysis

**Status**: 🔴 **FC INFRASTRUCTURE INCOMPLETE**  
**Timestamp**: 2025-09-17T03:52:00Z  
**Environment**: Staging

## Code Path Verification

### finalizeAssessment → score_fc_session Call
```typescript
// supabase/functions/finalizeAssessment/index.ts:29-35
try {
  await supabase.functions.invoke("score_fc_session", {
    body: { session_id, version: "v1.2", basis: "functions" },
  });
} catch {
  /* ignore */  // ⚠️ SILENTLY IGNORED
}
```

**✅ PASS**: Call path exists with correct parameters  
**⚠️ WARNING**: Errors silently ignored (best-effort pattern)

### score_fc_session Data Dependencies
```typescript
// supabase/functions/score_fc_session/index.ts:30-44
const { data: blocks } = await supabase
  .from("fc_blocks")
  .select("id, code, is_active")
  .eq("version", version)      // "v1.2"
  .eq("is_active", true);

const { data: options } = await supabase
  .from("fc_options")
  .select("id, block_id, option_code, weights_json");

const { data: reps } = await supabase
  .from("fc_responses")
  .select("block_id, option_id")
  .eq("session_id", session_id);
```

## Database Readiness Assessment

### FC Infrastructure Tables Status
| Table | Exists | Records | Version v1.2 | Active Records |
|-------|--------|---------|---------------|----------------|
| fc_blocks | ✅ Yes | **0** | 0 | 0 |
| fc_options | ✅ Yes | **0** | N/A | 0 |
| fc_responses | ✅ Yes | **0** | N/A | 0 |

**❌ CRITICAL**: All FC infrastructure tables are empty

### Expected vs Actual Data Model

#### Expected New Model (v1.2)
```sql
-- FC Blocks: Define assessment sections
fc_blocks (id, version='v1.2', code, is_active=true)

-- FC Options: Define answer choices with cognitive weights  
fc_options (id, block_id, option_code, weights_json)

-- FC Responses: User selections mapped to options
fc_responses (session_id, block_id, option_id)
```

#### Actual Old Model (Current)
```sql
-- Old FC Questions in assessment_questions
SELECT COUNT(*) FROM assessment_questions WHERE type LIKE 'forced-choice%';
-- Result: 24 FC questions exist

-- Old FC Responses in assessment_responses  
SELECT COUNT(*) FROM assessment_responses ar 
JOIN assessment_questions aq ON aq.id = ar.question_id
WHERE aq.type LIKE 'forced-choice%' AND ar.session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3';
-- Result: 10+ FC responses exist
```

## FC Pipeline Flow Analysis

### Current Execution Path
1. **score_fc_session invoked** ✅ Function called
2. **Load fc_blocks** ❌ Returns 0 records  
3. **Load fc_options** ❌ Returns 0 records
4. **Load fc_responses** ❌ Returns 0 records  
5. **Early return** ❌ Line 46-52: "no fc responses"
6. **No FC scores generated** ❌ Zero upserts to fc_scores

### Expected Log Events (Missing)
```typescript
// Lines that should execute but don't:
console.log(`evt:fc_scoring_start,session_id:${session_id},basis:${basis},version:${version}`);
// ✅ This executes

console.log(`evt:fc_no_responses,session_id:${session_id}`);  
// ✅ This executes (early return)

console.log(`evt:fc_tally_complete,session_id:${session_id},answered:${answered},keys:${Object.keys(tally).length}`);
// ❌ Never reached

console.log(`evt:fc_scoring_complete,session_id:${session_id},blocks_answered:${answered}`);
// ❌ Never reached
```

## Data Model Migration Gap

### The Missing Bridge
The system expects two different data models to coexist:

#### For FC Scoring (New Model)
- Questions defined in `fc_blocks`
- Answer weights in `fc_options`  
- User choices in `fc_responses`

#### For Assessment Delivery (Old Model)  
- Questions in `assessment_questions` (type='forced-choice-*')
- User choices in `assessment_responses`
- Weights in `fc_map` column (currently null)

### Migration Never Completed
```sql
-- Evidence of incomplete migration:
-- 1. FC questions exist in old format
SELECT id, type FROM assessment_questions WHERE type LIKE 'forced-choice%' LIMIT 3;
-- Result: [129, 'forced-choice-4'], [130, 'forced-choice-4'], ...

-- 2. FC responses exist in old format  
SELECT question_id, answer_value FROM assessment_responses 
WHERE session_id = '618c5ea6-aeda-4084-9156-0aac9643afd3'
AND question_id IN (129, 130, 131);
-- Result: Valid FC responses with text answers

-- 3. New FC infrastructure empty
SELECT COUNT(*) FROM fc_blocks; -- 0
SELECT COUNT(*) FROM fc_options; -- 0  
SELECT COUNT(*) FROM fc_responses; -- 0
```

## Hypotheses & Root Cause

### Primary Hypothesis: Incomplete Data Migration
- **Evidence**: Old FC questions work, new FC infrastructure empty
- **Impact**: score_fc_session finds no data, returns early
- **Result**: No FC scores generated for any session

### Secondary Issues
1. **Silent Failure**: finalizeAssessment ignores FC scoring errors
2. **Missing Mapping**: No bridge between old and new data models
3. **Zero Validation**: No alerts when FC infrastructure is empty

## Fix Options Analysis

### Option A: Populate FC Infrastructure
- Create fc_blocks from assessment_questions  
- Create fc_options with proper weights
- Map assessment_responses to fc_responses
- **Complexity**: High (data transformation)
- **Risk**: Medium (data integrity)

### Option B: Bridge Old → New in score_fc_session
- Modify function to read from assessment_questions/responses
- Maintain new output format (fc_scores table)
- **Complexity**: Medium (code changes)
- **Risk**: Low (maintains existing data)

### Option C: Bypass FC Temporarily  
- Make score_prism work without FC scores
- Add feature flag to disable FC requirement
- **Complexity**: Low (configuration)
- **Risk**: Low (fallback mode)

## Recommendation

**Immediate**: Option C (bypass FC temporarily) to restore profile generation  
**Medium-term**: Option B (bridge old → new) for proper FC scoring  
**Long-term**: Option A (complete migration) for full v1.2 functionality

## Next IR Steps

- **IR-04**: Confirm 20-day gap correlates with FC infrastructure issues
- **IR-05**: Verify service role credentials are working  
- **IR-06**: Check if FC processing causes timeouts
- **IR-07**: Implement hotfix with RLS + FC bypass

---
**Critical Finding**: FC infrastructure incomplete, preventing all FC scoring  
**Impact**: Secondary to RLS issue, but compounds scoring problems