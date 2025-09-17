# FC Smoke Test Report — IR-07B-VERIFY

**Timestamp**: 2025-09-17T05:22:00Z  
**Environment**: Staging  
**FC Version**: v1.2  
**Test Status**: 🟡 IN PROGRESS

## Test Sessions

### Primary Session: 618c5ea6-aeda-4084-9156-0aac9643afd3
- **Status**: Completed (2025-09-16 19:54:24)
- **FC Response Status**: Unknown (testing)
- **Expected Result**: FC scores generated with version='v1.2'

### Secondary Session: 070d9bf2-516f-44ee-87fc-017c7db9d29c  
- **Status**: Completed (2025-09-15 03:21:01)
- **FC Response Status**: Unknown (testing)
- **Expected Result**: FC scores generated with version='v1.2'

## Test Results Matrix

| Session | score_fc_session | fc_scores Created | Version | Blocks Answered | Status |
|---------|------------------|-------------------|---------|-----------------|---------|
| 618c5ea6... | 🟡 Testing | 🟡 Pending | 🟡 Pending | 🟡 Pending | 🟡 IN PROGRESS |
| 070d9bf2... | ⏳ Queued | ⏳ Queued | ⏳ Queued | ⏳ Queued | ⏳ QUEUED |

## Telemetry Expectations

### Success Indicators
- `evt:fc_scoring_start` logged
- `evt:fc_tally_complete` logged  
- `evt:fc_scores_normalized` logged
- `evt:fc_scoring_complete` logged
- Zero `evt:fc_no_responses` (unless legitimate)

### Error Indicators  
- `evt:fc_option_not_found` warnings
- `evt:fc_upsert_error` errors
- Function timeouts or crashes

---
**STATUS**: 🟡 Ready to begin smoke testing