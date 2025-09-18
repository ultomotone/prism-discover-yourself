# Database Diagnostics Documentation

The Diagnostics (`db_diagnostics`) Edge Function provides read-only access to database metadata without exposing sensitive row data.

## Authentication

Requires `X-Audit-Key` header:

```bash
curl -H "X-Audit-Key: $AUDIT_KEY" \
  https://<project>.functions.supabase.co/db_diagnostics
```

## Response Format

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "tables": [
    "assessment_sessions",
    "profiles", 
    "scoring_results"
  ],
  "columns": {
    "assessment_sessions": [
      {
        "column_name": "id",
        "data_type": "uuid",
        "is_nullable": "NO",
        "column_default": "gen_random_uuid()"
      },
      {
        "column_name": "email",
        "data_type": "text", 
        "is_nullable": "YES",
        "column_default": null
      }
    ]
  },
  "policies": {
    "assessment_sessions": [
      {
        "polname": "sess_select_owner_or_email",
        "polcmd": "SELECT",
        "polroles": "{authenticated}",
        "qual": "(user_id = auth.uid()) OR ...",
        "with_check": null
      }
    ]
  },
  "metadata": {
    "allowed_tables_count": 6,
    "total_policies": 12
  }
}
```

## Rate Limiting

- **Limit**: 60 requests per minute per IP
- **Response**: 429 Too Many Requests if exceeded

## Use Cases

- **Schema inspection**: See table structure and column types
- **Policy review**: Audit RLS policies for security issues  
- **Debugging**: Understand database configuration without row access
- **Documentation**: Generate up-to-date schema docs

## Security Features

- **Metadata only**: No actual row data returned
- **Allow-listed tables**: Only returns info for predefined safe tables
- **Rate limited**: Prevents abuse
- **Authenticated**: Requires valid audit key

## Example Usage

```bash
# Get full diagnostics
curl -H "X-Audit-Key: $AUDIT_KEY" \
  https://your-project.functions.supabase.co/db_diagnostics | jq '.'

# Check specific table policies  
curl -H "X-Audit-Key: $AUDIT_KEY" \
  https://your-project.functions.supabase.co/db_diagnostics | \
  jq '.policies.profiles'

# Count tables and policies
curl -H "X-Audit-Key: $AUDIT_KEY" \
  https://your-project.functions.supabase.co/db_diagnostics | \
  jq '.metadata'
```

## Error Responses

Authentication failure:
```json
{
  "ok": false,
  "code": "UNAUTHORIZED", 
  "message": "Invalid audit key"
}
```

Rate limit exceeded:
```json
{
  "ok": false,
  "code": "RATE_LIMIT",
  "message": "Rate limit exceeded"
}
```