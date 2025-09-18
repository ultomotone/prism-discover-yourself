# Secure Assessment Scoring System

This document provides a complete guide for the secure assessment scoring system with real-time updates, RLS policies, and server-side score computation.

## 🏗️ Architecture Overview

The system consists of four main components:

1. **Database Layer**: Strict RLS policies ensuring data privacy
2. **Edge Function**: Server-side score computation using service role
3. **Real-time Updates**: Live scoring result updates via Supabase Realtime
4. **Frontend Integration**: Dashboard with real-time score display and recompute triggers

## 🔐 Security Model

### Data Access Patterns

- **assessment_responses**: Only owners can SELECT their responses; no client writes allowed
- **assessment_sessions**: Users can SELECT their own sessions + anonymous sessions matching their email
- **scoring_results**: Users can SELECT only their own results; all writes are server-only
- **Service Role**: Bypasses all RLS for server-side operations

### Privacy Guarantees

- ✅ Users can only see their own assessment data
- ✅ Raw responses remain private
- ✅ Only computed scores are visible to users
- ✅ Service role key is never exposed to client
- ✅ Anonymous sessions can be linked by email before authentication

## 🚀 Environment Setup

### Required Environment Variables

#### Frontend (.env)
```bash
# Not needed - URLs are hardcoded in client.ts
```

#### Supabase Edge Functions
```bash
SUPABASE_URL=https://gnkuikentdtnatazeriu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Verifying Configuration

1. **Check RLS Status**:
```sql
SELECT schemaname, tablename, rowsecurity, relforcerowsecurity 
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' 
AND tablename IN ('assessment_sessions', 'assessment_responses', 'scoring_results');
```

2. **Verify Policies**:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('assessment_sessions', 'assessment_responses', 'scoring_results');
```

3. **Test Realtime Publication**:
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('scoring_results', 'assessment_sessions');
```

## 📊 Database Schema

### scoring_results Table

```sql
CREATE TABLE public.scoring_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES assessment_sessions(id),
  user_id UUID,
  type_code TEXT,
  confidence TEXT,
  fit_band TEXT,
  overlay TEXT,
  score_fit_calibrated NUMERIC,
  top_types JSONB,
  dimensions JSONB,
  validity_status TEXT DEFAULT 'pass',
  results_version TEXT DEFAULT 'v1.2',
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, user_id, results_version)
);
```

### Key Indexes

- `idx_scoring_results_user_session`: Fast lookups by user and session
- `idx_scoring_results_computed_at`: Ordering by computation time

## 🔧 API Reference

### Edge Function: recompute-scoring

**Endpoint**: `POST /functions/v1/recompute-scoring`

**Request Body**:
```typescript
{
  sessionId?: string;  // Recompute specific session
  userId?: string;     // Recompute all user sessions
}
```

**Response**:
```typescript
{
  ok: boolean;
  updatedCount: number;
  sessionId?: string;
  error?: string;
}
```

**Example Usage**:
```typescript
// Recompute specific session
const { data } = await supabase.functions.invoke('recompute-scoring', {
  body: { sessionId: 'uuid-here' }
});

// Recompute all user sessions
const { data } = await supabase.functions.invoke('recompute-scoring', {
  body: { userId: 'user-uuid-here' }
});
```

## 🎯 Frontend Integration

### useRealtimeScoring Hook

```typescript
import { useRealtimeScoring } from '@/hooks/useRealtimeScoring';

const MyComponent = () => {
  const { 
    scoringResults,      // Current results array
    isLoading,          // Initial load state
    isRecomputing,      // Recompute in progress
    recomputeScoring    // Trigger recomputation
  } = useRealtimeScoring();

  // Recompute all user scores
  const handleRecomputeAll = () => recomputeScoring();

  // Recompute specific session
  const handleRecomputeSession = (sessionId: string) => 
    recomputeScoring(sessionId);
};
```

### Real-time Events

The hook automatically subscribes to:
- `INSERT`: New scoring results
- `UPDATE`: Updated scoring results
- `DELETE`: Removed scoring results

Events are filtered by `user_id = auth.uid()` for security.

## 🧪 Testing Guide

### Integration Test Script

Create a test file `test-secure-scoring.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gnkuikentdtnatazeriu.supabase.co',
  'your_anon_key_here'
);

async function runSecureScoringTest() {
  console.log('🧪 Starting Secure Scoring Integration Test');

  // 1. Create test session and responses
  const testEmail = `test-${Date.now()}@example.com`;
  
  // Sign up test user
  console.log('👤 Creating test user...');
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'test-password-123'
  });

  if (signUpError || !user) {
    console.error('❌ Failed to create test user:', signUpError);
    return;
  }

  // 2. Create test session
  console.log('📝 Creating test session...');
  const { data: session, error: sessionError } = await supabase
    .from('assessment_sessions')
    .insert({
      user_id: user.id,
      email: testEmail,
      status: 'completed',
      completed_questions: 25
    })
    .select()
    .single();

  if (sessionError || !session) {
    console.error('❌ Failed to create session:', sessionError);
    return;
  }

  // 3. Add test responses
  console.log('💬 Adding test responses...');
  const responses = Array.from({ length: 25 }, (_, i) => ({
    session_id: session.id,
    question_id: i + 1,
    answer_numeric: Math.floor(Math.random() * 5) + 1,
    question_text: `Test question ${i + 1}`,
    question_type: 'likert',
    question_section: 'test'
  }));

  const { error: responsesError } = await supabase
    .from('assessment_responses')
    .insert(responses);

  if (responsesError) {
    console.error('❌ Failed to create responses:', responsesError);
    return;
  }

  // 4. Trigger recomputation
  console.log('🔄 Triggering score recomputation...');
  const { data: computeResult, error: computeError } = await supabase.functions
    .invoke('recompute-scoring', {
      body: { sessionId: session.id }
    });

  if (computeError) {
    console.error('❌ Recompute failed:', computeError);
    return;
  }

  console.log('✅ Recompute result:', computeResult);

  // 5. Verify scoring results exist
  console.log('🔍 Verifying scoring results...');
  const { data: scoringResults, error: resultsError } = await supabase
    .from('scoring_results')
    .select('*')
    .eq('session_id', session.id);

  if (resultsError) {
    console.error('❌ Failed to fetch results:', resultsError);
    return;
  }

  if (!scoringResults || scoringResults.length === 0) {
    console.error('❌ No scoring results found');
    return;
  }

  console.log('✅ Scoring results verified:', scoringResults[0]);

  // 6. Test RLS enforcement
  console.log('🔒 Testing RLS enforcement...');
  
  // Try to write to scoring_results (should fail)
  const { error: writeError } = await supabase
    .from('scoring_results')
    .insert({
      session_id: session.id,
      user_id: user.id,
      type_code: 'HACK'
    });

  if (writeError) {
    console.log('✅ RLS correctly blocked client write:', writeError.message);
  } else {
    console.error('❌ RLS failed - client write succeeded!');
  }

  // Clean up
  console.log('🧹 Cleaning up test data...');
  await supabase.from('scoring_results').delete().eq('session_id', session.id);
  await supabase.from('assessment_responses').delete().eq('session_id', session.id);
  await supabase.from('assessment_sessions').delete().eq('id', session.id);

  console.log('🎉 Integration test completed successfully!');
}

// Run the test
runSecureScoringTest().catch(console.error);
```

### Manual Testing Checklist

#### Security Tests
- [ ] **RLS Enforcement**: Users can only see their own scoring results
- [ ] **Write Protection**: Client cannot write to `scoring_results` table
- [ ] **Response Privacy**: Users can only see their own assessment responses
- [ ] **Session Linking**: Anonymous sessions are discoverable by email

#### Functionality Tests
- [ ] **Score Computation**: Edge function computes and stores scores
- [ ] **Real-time Updates**: Dashboard updates when scores change
- [ ] **Error Handling**: Function handles missing data gracefully
- [ ] **Idempotency**: Multiple recompute calls don't cause issues

#### Performance Tests
- [ ] **Subscription Reconnect**: Real-time works after network interruption
- [ ] **Batch Processing**: Can recompute multiple sessions efficiently
- [ ] **Index Usage**: Queries use appropriate indexes

## 🔄 Operational Workflows

### When X Changes, Do Y

| Trigger | Action | Why |
|---------|--------|-----|
| User completes assessment | Call `recomputeScoring(sessionId)` | Fresh scores for completed session |
| User updates responses | Call `recomputeScoring(sessionId)` | Recalculate affected scores |
| User logs in | Real-time subscription activates | Live updates for user's scores |
| Session linked to account | Call `recomputeScoring(sessionId)` | Ensure user_id is set in results |
| Scoring algorithm updated | Mass recompute via admin script | Update all scores to new version |

### Admin Operations

```sql
-- Recompute all scores for a specific version
SELECT public.recompute_all_scores('v1.2');

-- Check scoring results status
SELECT 
  results_version,
  COUNT(*) as count,
  AVG(score_fit_calibrated) as avg_score
FROM public.scoring_results 
GROUP BY results_version;

-- Find sessions without scoring results
SELECT s.id, s.user_id, s.completed_questions
FROM public.assessment_sessions s
LEFT JOIN public.scoring_results sr ON sr.session_id = s.id
WHERE s.status = 'completed' 
AND sr.id IS NULL;
```

## 🚨 Troubleshooting

### Common Issues

#### "Permission denied for table scoring_results"
- **Cause**: RLS blocking client access
- **Solution**: Use Edge Function for server-side operations

#### "Real-time updates not working"
- **Cause**: Subscription failed or table not in publication
- **Solution**: Check network, verify table in `supabase_realtime` publication

#### "Recompute function timeout"
- **Cause**: Processing too many sessions at once
- **Solution**: Batch process large user sets, add pagination

#### "Scoring results not updating UI"
- **Cause**: Real-time filter not matching user
- **Solution**: Verify `user_id` matches `auth.uid()`

### Monitoring Queries

```sql
-- Active real-time subscriptions
SELECT * FROM pg_stat_subscription;

-- Recent scoring computations
SELECT 
  computed_at,
  COUNT(*) as batch_size,
  AVG(score_fit_calibrated) as avg_score
FROM public.scoring_results
WHERE computed_at >= NOW() - INTERVAL '1 day'
GROUP BY DATE_TRUNC('hour', computed_at)
ORDER BY computed_at DESC;

-- Failed edge function calls (check logs)
SELECT * FROM public.fn_logs 
WHERE evt = 'recompute_scoring_error'
ORDER BY at DESC;
```

## 📋 Rollback Procedures

### Emergency Rollback

If issues arise, disable the system:

```sql
-- 1. Disable real-time publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.scoring_results;

-- 2. Disable edge function (in supabase/config.toml)
-- [functions.recompute-scoring]
-- verify_jwt = false
-- # Comment out or remove this section

-- 3. Remove RLS policies (keep data safe)
DROP POLICY IF EXISTS "scores_select_owner_only" ON public.scoring_results;
DROP POLICY IF EXISTS "service_role_all_scoring_results" ON public.scoring_results;
```

### Data Recovery

```sql
-- Backup scoring_results before changes
CREATE TABLE scoring_results_backup AS 
SELECT * FROM public.scoring_results;

-- Restore from backup if needed
TRUNCATE public.scoring_results;
INSERT INTO public.scoring_results 
SELECT * FROM scoring_results_backup;
```

## 🎯 Performance Optimization

### Database Optimizations

- Use `UNIQUE` constraints for idempotent upserts
- Index frequently queried columns (`user_id`, `session_id`, `computed_at`)
- Use `REPLICA IDENTITY FULL` for complete real-time payloads

### Edge Function Optimizations

- Batch process multiple sessions
- Use connection pooling for database access
- Implement exponential backoff for retries
- Add circuit breaker for failing computations

### Frontend Optimizations

- Debounce recompute requests
- Cache scoring results locally
- Use optimistic updates for better UX
- Implement proper loading states

---

## 📞 Support

For issues or questions:
1. Check logs in Supabase Dashboard → Functions → recompute-scoring → Logs
2. Verify RLS policies with the SQL queries above
3. Test real-time connectivity with browser dev tools
4. Review this documentation for common solutions

This system provides secure, real-time assessment scoring with proper data privacy and server-side computation. The architecture ensures users can only access their own data while enabling powerful real-time features.