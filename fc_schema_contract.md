# IR-07B SCHEMA CONTRACT ANALYSIS

**Timestamp**: 2025-09-17T05:47:00Z  
**Target**: fc_scores schema vs function expectations  
**Environment**: Staging

## FC_SCORES TABLE SCHEMA

| Column | Type | Nullable | Default | Function Expects |
|--------|------|----------|---------|------------------|
| session_id | uuid | NO | null | ✅ UUID |
| version | text | NO | 'v1.2' | ✅ TEXT (v1.2) |
| fc_kind | text | NO | null | ✅ TEXT (basis param) |  
| scores_json | jsonb | NO | null | ✅ JSONB object |
| blocks_answered | integer | NO | null | ✅ INTEGER count |
| created_at | timestamptz | NO | now() | ✅ Auto timestamp |

## PRIMARY KEY & CONSTRAINTS ✅

| Constraint Type | Definition | Function Compatibility |
|----------------|------------|----------------------|
| PRIMARY KEY | `(session_id, version, fc_kind)` | ✅ PERFECT MATCH |
| Function ON CONFLICT | `"session_id,version,fc_kind"` | ✅ EXACT MATCH |

## UPSERT COMPATIBILITY CHECK ✅

### Function Upsert Statement
```typescript
supabase.from("fc_scores").upsert({
  session_id,        // UUID - matches schema ✅
  version,           // TEXT "v1.2" - matches schema ✅  
  fc_kind: basis,    // TEXT "functions" - matches schema ✅
  scores_json: scores,      // JSONB object - matches schema ✅
  blocks_answered: answered // INTEGER - matches schema ✅
}, { onConflict: "session_id,version,fc_kind" }); // ✅ MATCHES PK
```

### Schema Validation
- ✅ **All required fields provided**: No nullable violations
- ✅ **Data types match**: UUID, TEXT, JSONB, INTEGER all correct
- ✅ **Constraint target correct**: ON CONFLICT matches composite PK exactly
- ✅ **Default values compatible**: version defaults to 'v1.2' (function passes 'v1.2')

## COMPATIBILITY MATRIX

| Component | Function Expectation | Actual Schema | Status |
|-----------|---------------------|---------------|---------|
| session_id | UUID, NOT NULL | uuid, NOT NULL | ✅ MATCH |
| version | TEXT 'v1.2' | text, DEFAULT 'v1.2' | ✅ MATCH |
| fc_kind | TEXT (basis param) | text, NOT NULL | ✅ MATCH |
| scores_json | JSONB object | jsonb, NOT NULL | ✅ MATCH |
| blocks_answered | INTEGER count | integer, NOT NULL | ✅ MATCH |
| Primary Key | (session_id,version,fc_kind) | (session_id,version,fc_kind) | ✅ PERFECT |

## CHECK CONSTRAINTS

**None found** - No version validation or score format constraints that could block writes.

## VERDICT

**PERFECT COMPATIBILITY** - Schema contract is exactly what the function expects.

- ✅ No column mismatches
- ✅ No constraint conflicts  
- ✅ No nullable violations
- ✅ ON CONFLICT target matches PK perfectly
- ✅ No CHECK constraints blocking writes

**SCHEMA IS NOT THE BLOCKER** - Table structure is ready for function writes.

---

**STATUS**: ✅ SCHEMA CONTRACT PERFECT  
**NEXT**: Verify input data (fc_blocks, fc_options, fc_responses) exists as expected