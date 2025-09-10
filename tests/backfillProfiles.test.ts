import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findSessionsNeedingProfile, SessionRecord, ProfileRecord } from '../supabase/functions/_shared/backfillUtils';

test('findSessionsNeedingProfile identifies sessions needing profiles', () => {
  const sessions: SessionRecord[] = [
    { id: 'a', status: 'completed', completed_questions: 10, total_questions: 10 },
    { id: 'b', status: 'in_progress', completed_questions: 10, total_questions: 10 },
    { id: 'c', status: 'in_progress', completed_questions: 5, total_questions: 10 },
    { id: 'd', status: 'completed', completed_questions: 10, total_questions: 10 },
  ];
  const profiles: ProfileRecord[] = [{ session_id: 'd' }];

  const result = findSessionsNeedingProfile(sessions, profiles);
  assert.deepStrictEqual(result.map((s) => s.id).sort(), ['a', 'b']);
});
