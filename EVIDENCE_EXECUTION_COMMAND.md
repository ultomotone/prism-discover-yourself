# Evidence Gate - Execute Now

## PRECHECK RESULTS ✅

- **Session Status**: completed
- **Response Count**: 248 responses confirmed
- **Share Token**: Present
- **FC Scores**: Not yet created (as expected)
- **Profiles**: Not yet created (as expected)

## EXECUTION COMMAND

```bash
# Export your Supabase service role key
export SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"

# Execute the Evidence Gate
npm run ts-node run_evidence_gate_execution.ts
```

## EXPECTED RESULTS

### On SUCCESS ✅
- `fc_scores` record created with `version = 'v1.2'`
- `profiles` record created with `results_version = 'v1.2.1'`
- Results URL returns 200 with token, 401/403 without
- Clean telemetry logs

### On FAILURE ❌
- Triage with IR-07B diagnostic prompts
- RLS/grants verification
- Input validation checks

## POST-EXECUTION

After running the script, paste the console output here to proceed to **BF-01-APPLY — Backfill (Staging)**.