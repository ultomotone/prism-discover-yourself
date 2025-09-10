export interface SessionRecord {
  id: string;
  status: string | null;
  completed_questions: number | null;
  total_questions: number | null;
  completed_at?: string | null;
}

export interface ProfileRecord {
  session_id: string;
}

/**
 * Find sessions that have answered all questions but are missing a profile.
 * Counts sessions with status 'completed' or those 'in_progress' with all
 * questions answered.
 */
export function findSessionsNeedingProfile(
  sessions: SessionRecord[],
  profiles: ProfileRecord[],
): SessionRecord[] {
  const haveProfile = new Set(profiles.map((p) => p.session_id));

  return sessions.filter((s) => {
    const isCompleted = s.status === 'completed';
    const answeredAll =
      s.status === 'in_progress' &&
      s.total_questions !== null &&
      s.completed_questions !== null &&
      s.completed_questions >= s.total_questions;

    return !haveProfile.has(s.id) && (isCompleted || answeredAll);
  });
}
