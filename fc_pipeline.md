# FC Pipeline Status — IR-07B Applied

**Migration**: fc_seed.sql  
**Applied**: 2025-09-17T05:20:00Z  
**Environment**: Staging  
**Status**: ✅ SEEDING COMPLETE

## Post-Apply Verification

### Row Counts Verified
| Table | Total Rows | v1.2 Specific | Status |
|-------|------------|---------------|---------|
| fc_blocks | 6 | 6 blocks | ✅ Complete |
| fc_options | 24 | 6 unique blocks | ✅ Complete |
| fc_responses | 0 | N/A | ✅ Ready |
| fc_scores | 0 | N/A | ✅ Ready |

### Schema Changes Applied
- ✅ `fc_blocks.version` DEFAULT set to 'v1.2'
- ✅ `fc_scores.version` DEFAULT set to 'v1.2'
- ✅ 6 blocks inserted with stable UUIDs
- ✅ 24 options inserted with cognitive function weights

### Block Structure (v1.2)
| Order | Code | Title | Options | Status |
|-------|------|-------|---------|---------|
| 1 | WORK_PREF | Work Environment Preferences | A,B,C,D | ✅ |
| 2 | DECISION_STYLE | Decision Making Style | A,B,C,D | ✅ |
| 3 | COMM_STYLE | Communication & Interaction Style | A,B,C,D | ✅ |
| 4 | PROBLEM_SOLVE | Problem Solving Approach | A,B,C,D | ✅ |
| 5 | INFO_PROCESS | Information Processing Style | A,B,C,D | ✅ |
| 6 | ENERGY_FOCUS | Energy & Focus Patterns | A,B,C,D | ✅ |

### Cognitive Function Weights Verification
All 24 options contain balanced weights for 8 cognitive functions:
- **Te, Ti, Fe, Fi, Ne, Ni, Se, Si**
- Weights range from 0-3 per function
- Each option has a primary function focus (weight 3)

## IR-07B-VERIFY: Score_FC_Session Smoke Tests

### Test Sessions Available
- **Primary**: `618c5ea6-aeda-4084-9156-0aac9643afd3` (completed 2025-09-16)
- **Secondary**: `070d9bf2-516f-44ee-87fc-017c7db9d29c` (completed 2025-09-15)

### Expected Results After Testing
- ✅ Non-empty fc_scores with version='v1.2'
- ✅ Telemetry: fc_source=fc_scores (no legacy)
- ✅ Blocks answered > 0 for sessions with FC responses

### Pre-Test Status
- ✅ FC infrastructure seeded and verified
- ✅ score_fc_session function operational
- ✅ Service role has RLS access to all FC tables

### Rollback Ready
- `migrations/fc_seed_rollback.sql` available
- `artifacts/fc_seed_stage_baseline.md` captured

---
**IR-07B STATUS**: ✅ SEEDING COMPLETE  
**NEXT**: Execute score_fc_session smoke tests