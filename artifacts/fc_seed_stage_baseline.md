# FC Seeding Stage Baseline

**Timestamp**: 2025-09-17T05:18:00Z  
**Environment**: Staging  
**Context**: Pre-seeding baseline for IR-07B-APPLY

## Pre-Seeding State

### Table Row Counts
| Table | Rows |
|-------|------|
| fc_blocks | 0 |
| fc_options | 0 |
| fc_responses | 0 |
| fc_scores | 0 |

### RLS Policies - profiles table
| Policy Name | Command | Using | With Check |
|-------------|---------|-------|------------|
| Service role can manage profiles | ALL | auth.role() = 'service_role' | auth.role() = 'service_role' |
| Users can view their own profiles | SELECT | auth.uid() = user_id | - |

### Test Sessions Available
| Session ID | Status | Created At |
|------------|--------|------------|
| 618c5ea6-aeda-4084-9156-0aac9643afd3 | completed | 2025-09-16 19:54:24 |
| 070d9bf2-516f-44ee-87fc-017c7db9d29c | completed | 2025-09-15 03:21:01 |

### Schema Structure
FC tables exist with proper constraints and indexes ready for seeding.

### Expected Changes
After fc_seed.sql:
- fc_blocks: 6 rows (v1.2)
- fc_options: 24 rows (4 per block)
- New indexes: idx_fc_blocks_version_active, idx_fc_options_block_order, etc.

---
**STATUS**: ✅ Ready for Migration Apply