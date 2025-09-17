# Telemetry Verification

## RPC Function Telemetry Status

### Database Function Execution
- ✅ `get_results_by_session` executes successfully
- ✅ No SQL ambiguity errors in logs
- ✅ Proper `no_data_found` exceptions for missing profiles
- ✅ Token validation working correctly

### Version Stamps Confirmed
**From Working Session** (91dfe71f-44d1-4e44-ba8c-c9c684c4071b):
```json
{
  "profile": {
    "version": "v1.2.0",
    "type_code": "LIE",
    "conf_calibrated": 0.4678,
    "score_fit_calibrated": 38.1,
    "overlay": "–"
  },
  "session": {
    "status": "completed",
    "session_type": "prism"
  }
}
```

### Security Validation
- ✅ Token-based access control enforced
- ✅ No direct table reads required
- ✅ SECURITY DEFINER function protects data access
- ✅ Proper error handling prevents data leakage

### Performance
- ✅ Single RPC call pattern established
- ✅ Optional index created for token validation performance
- ✅ Function executes within expected timeframes

### Expected Frontend Events
When integrated, expect to see:
- `evt:results_render` with `rpc_status=success`
- `has_token=true` for tokenized requests  
- `version=v1.2.0` in telemetry from profile data
- No `engine_version_override` events