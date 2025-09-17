# Manual Function Test Instructions

Since we need to test the finalizeAssessment function but cannot execute Node.js scripts directly, here are the manual test options:

## Option 1: Browser Console Test

Open the browser console on the Lovable preview and run:

```javascript
// Test the finalizeAssessment function
const testFunction = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('Testing finalizeAssessment...');
    const result = await supabase.functions.invoke('finalizeAssessment', {
      body: {
        session_id: '618c5ea6-aeda-4084-9156-0aac9643afd3',
        fc_version: 'v1.2'
      }
    });
    
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    return { error };
  }
};

// Run the test
testFunction();
```

## Option 2: Curl Test (with service role key)

```bash
curl -X POST \
  https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "session_id": "618c5ea6-aeda-4084-9156-0aac9643afd3",
    "fc_version": "v1.2"
  }'
```

## Option 3: Direct HTTP Test

Using any HTTP client, send a POST request to:
- URL: `https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment`
- Headers:
  - `Authorization: Bearer <SERVICE_ROLE_KEY>`
  - `Content-Type: application/json`
  - `apikey: <SERVICE_ROLE_KEY>`
- Body: `{"session_id":"618c5ea6-aeda-4084-9156-0aac9643afd3","fc_version":"v1.2"}`

## Expected Results

### Success (200 OK):
```json
{
  "ok": true,
  "status": "success", 
  "session_id": "618c5ea6-aeda-4084-9156-0aac9643afd3",
  "share_token": "<uuid>",
  "profile": {
    "id": "<profile-uuid>",
    "type_code": "<type>",
    "results_version": "v1.2.1"
  },
  "results_url": "https://prismassessment.com/results/618c5ea6-aeda-4084-9156-0aac9643afd3?t=<token>"
}
```

### Failure Cases:
- **404**: Function not deployed
- **401/403**: Authentication issue  
- **422**: Scoring failed (check logs)
- **500**: Internal error (RLS or other issue)

## Next Steps After Test

1. **If SUCCESS**: Run database verification queries to confirm profile creation
2. **If FAILURE**: Analyze error message to determine root cause
3. **Update evidence files** with actual test results
4. **Complete HTTP access testing** if profile was created