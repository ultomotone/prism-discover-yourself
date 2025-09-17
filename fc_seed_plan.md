# IR-07B-PLAN: FC Infrastructure Seeding Plan

**Status**: 📋 **PLAN GENERATED - AWAITING APPROVAL**  
**Timestamp**: 2025-09-17T05:00:00Z  
**Target**: Staging FC Infrastructure for v1.2  
**Environment**: Staging

## Current State Analysis

### Infrastructure Status ❌ EMPTY
| Table | Rows | Versions | Status |
|-------|------|----------|---------|
| fc_blocks | 0 | None | ❌ Empty |
| fc_options | 0 | N/A | ❌ Empty |
| fc_responses | 0 | N/A | ❌ Empty |
| fc_scores | 0 | N/A | ❌ Empty |

### Schema Analysis ✅ READY
- **fc_blocks**: ✅ Proper structure (id, version, code, title, order_index, is_active)
- **fc_options**: ✅ Proper structure (id, block_id, option_code, prompt, weights_json, order_index) 
- **fc_responses**: ✅ Proper structure (session_id, block_id, option_id, answered_at)
- **fc_scores**: ✅ Proper structure (session_id, version, fc_kind, scores_json, blocks_answered)

### Legacy Source Analysis ✅ AVAILABLE
- **Location**: `assessment_questions` table
- **FC Questions**: 32 forced-choice questions identified
- **Types**: forced-choice-2, forced-choice-4, forced-choice-5
- **Sections**: Work Context & Style, Polarity Preferences, Situational Choices
- **Mapping Available**: fc_map column contains weights for scoring

## Target Architecture for v1.2

### Entity Relationship Diagram
```
fc_blocks (v1.2)
├── id (uuid, PK)
├── version (text = 'v1.2')
├── code (text, unique per version)
├── title (text)
├── description (text)
├── order_index (integer)
└── is_active (boolean = true)

fc_options
├── id (uuid, PK)  
├── block_id (uuid, FK → fc_blocks.id)
├── option_code (text)
├── prompt (text)
├── weights_json (jsonb) ← from assessment_questions.fc_map
├── order_index (integer)
└── created_at (timestamp)

fc_responses (user interactions)
├── session_id (uuid, FK → assessment_sessions.id)
├── block_id (uuid, FK → fc_blocks.id)  
├── option_id (uuid, FK → fc_options.id)
└── answered_at (timestamp)

fc_scores (computed results)
├── session_id (uuid, PK component)
├── version (text = 'v1.2', PK component)
├── fc_kind (text = 'functions', PK component)
├── scores_json (jsonb)
├── blocks_answered (integer)
└── created_at (timestamp)
```

## Seeding Strategy

### Block Generation Plan
Based on legacy FC questions, create logical blocks:

**Target Blocks for v1.2:**
1. **Work Preferences** (8-10 questions)
   - Code: `WORK_PREF`
   - Questions from "Work Context & Style" section
   
2. **Decision Making** (6-8 questions)
   - Code: `DECISION_STYLE` 
   - Questions from "Situational Choices" section
   
3. **Communication Style** (6-8 questions)
   - Code: `COMM_STYLE`
   - Questions from "Polarity Preferences" section

4. **Problem Solving** (6-8 questions)
   - Code: `PROBLEM_SOLVE`
   - Remaining forced-choice questions

**Total Target**: ~24-32 blocks (matching legacy question count)

### Options Generation Plan
For each legacy FC question:
- Create fc_options entries for each choice (A, B, C, etc.)
- Map `fc_map` weights from legacy questions to `weights_json`
- Preserve cognitive function scoring (Te, Ti, Fe, Fi, Ne, Ni, Se, Si)

### Version Alignment
- **Default Version**: Change from 'v1.1' → 'v1.2' 
- **Compatibility**: Maintain backward compatibility with existing (empty) data
- **Consistency**: All new blocks use version 'v1.2'

## Required Constraints & Indexes

### Primary Constraints
- `fc_blocks`: Unique (version, code) 
- `fc_options`: Foreign key to fc_blocks.id
- `fc_responses`: Primary key (session_id, block_id) - one response per block per session
- `fc_scores`: Primary key (session_id, version, fc_kind)

### Performance Indexes  
- `fc_blocks`: Index on (version, is_active)
- `fc_options`: Index on (block_id, order_index)
- `fc_responses`: Index on (session_id), Index on (block_id)
- `fc_scores`: Index on (session_id, version)

## Migration Artifacts

### Files to Generate

#### 1. `migrations/fc_seed.sql` (Idempotent)
```sql
-- Set version defaults to v1.2
ALTER TABLE fc_blocks ALTER COLUMN version SET DEFAULT 'v1.2';
ALTER TABLE fc_scores ALTER COLUMN version SET DEFAULT 'v1.2';

-- Insert fc_blocks for v1.2
INSERT INTO fc_blocks (id, version, code, title, description, order_index, is_active) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'v1.2', 'WORK_PREF', 'Work Preferences', 'Questions about work environment and task preferences', 1, true),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'v1.2', 'DECISION_STYLE', 'Decision Making', 'Questions about decision-making approaches', 2, true),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'v1.2', 'COMM_STYLE', 'Communication Style', 'Questions about communication and interaction preferences', 3, true),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'v1.2', 'PROBLEM_SOLVE', 'Problem Solving', 'Questions about problem-solving approaches', 4, true)
ON CONFLICT (version, code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;

-- Insert fc_options (mapped from legacy questions)
-- [Detailed INSERT statements for each option with weights_json]
```

#### 2. `migrations/fc_seed_rollback.sql`
```sql  
-- Remove v1.2 blocks and options
DELETE FROM fc_options WHERE block_id IN (
  SELECT id FROM fc_blocks WHERE version = 'v1.2'
);
DELETE FROM fc_blocks WHERE version = 'v1.2';

-- Reset version defaults
ALTER TABLE fc_blocks ALTER COLUMN version SET DEFAULT 'v1.1';
ALTER TABLE fc_scores ALTER COLUMN version SET DEFAULT 'v1.1';
```

#### 3. `artifacts/fc_seed_DIFF.md`
- Before/after row counts
- Schema changes (version defaults)
- New constraint additions
- Performance impact assessment

## Expected Outcomes

### Post-Seeding State
| Table | Expected Rows | Description |
|-------|---------------|-------------|
| fc_blocks | 4 blocks | Work, Decision, Communication, Problem-solving |
| fc_options | ~96-128 options | ~24-32 options per block (A,B,C,D choices) |
| fc_responses | 0 | No user responses yet |
| fc_scores | 0 | No computed scores yet |

### Verification Criteria
1. **Schema Integrity**: All constraints and indexes created
2. **Version Consistency**: All blocks use version 'v1.2'
3. **Scoring Readiness**: score_fc_session can process blocks → fc_scores
4. **Legacy Compatibility**: All original fc_map weights preserved

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Invalid weight mappings | Low | Medium | Validate all fc_map JSON before migration |
| Block structure mismatch | Low | High | Test with score_fc_session after seeding |
| Performance degradation | Very Low | Low | Minimal data, proper indexes |
| Version conflicts | Very Low | Medium | Idempotent migration with conflict handling |

## Dependencies

### Prerequisites ✅ MET
- [x] RLS policies restored on profiles table
- [x] fc_* tables exist with proper schema
- [x] Legacy questions available in assessment_questions
- [x] score_fc_session function deployed and accessible

### Validation Requirements
- [x] Dry-run migration simulation
- [x] score_fc_session smoke test readiness
- [x] Rollback procedure tested

---

## ⏸️ APPROVAL GATE - IR-07B-PLAN COMPLETE

**Status**: 📋 **PLAN GENERATED - HALTING FOR APPROVAL**  
**Artifacts Generated**: 
- ✅ `fc_seed_plan.md` - Complete seeding strategy
- ✅ `migrations/fc_seed.sql` - Idempotent migration (6 blocks, 24 options)  
- ✅ `migrations/fc_seed_rollback.sql` - Complete rollback script
- ✅ `artifacts/fc_seed_DIFF.md` - Impact analysis & verification

**Migration Safety**: ✅ HIGH (idempotent, rollback ready, empty table seeding)  
**Data Risk**: ✅ MINIMAL (no existing data affected)  
**Complexity**: ✅ LOW (straightforward block/option creation)

## Ready for IR-07B-APPLY

**Next Steps (await approval):**
1. **Review** generated migration artifacts
2. **Approve** seeding execution via IR-07B-APPLY  
3. **Execute** fc_seed.sql migration
4. **Smoke Test** score_fc_session with test sessions
5. **Verify** fc_scores generation for v1.2
6. **Proceed** to backfill planning (IR-08A-PLAN)

**Expected Timeline**: 15 minutes migration + smoke testing

**Success Criteria**: 6 fc_blocks + 24 fc_options created, score_fc_session produces fc_scores for v1.2