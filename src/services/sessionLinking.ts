import { SupabaseClient } from '@supabase/supabase-js';

export type LinkSessionsResult =
  | { ok: true; linked: number }
  | { ok: false; error: unknown };

export async function linkSessionsToUser(
  client: SupabaseClient,
  email: string,
  userId: string,
): Promise<LinkSessionsResult> {
  try {
    const { data: sessions, error: fetchError } = await client
      .from('assessment_sessions')
      .select('id')
      .eq('email', email)
      .is('user_id', null);

    if (fetchError) return { ok: false, error: fetchError };
    if (!sessions || sessions.length === 0) return { ok: true, linked: 0 };

    const ids = sessions.map((s: { id: string }) => s.id);
    const { error: updateError } = await client
      .from('assessment_sessions')
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (updateError) return { ok: false, error: updateError };

    return { ok: true, linked: ids.length };
  } catch (error) {
    return { ok: false, error };
  }
}

export type LinkSessionResult = { ok: true } | { ok: false; error: unknown };

export async function linkSessionToAccount(
  client: SupabaseClient,
  sessionId: string,
  userId: string,
  email?: string,
): Promise<LinkSessionResult> {
  try {
    // 1. Try edge function first
    try {
      const { data, error } = await client.functions.invoke(
        'link_session_to_account',
        {
          body: { session_id: sessionId, user_id: userId, email },
        }
      );

      if (!error && data?.success) return { ok: true };
      if (!error && data?.success === false)
        return { ok: false, error: data.error };
      if (error?.status && error.status !== 404)
        return { ok: false, error };
    } catch {
      // fall through
    }

    // 2. Fallback: direct update
    const { error: updateError } = await client
      .from('assessment_sessions')
      .update({
        user_id: userId,
        email: email ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .is('user_id', null);

    if (updateError) return { ok: false, error: updateError };
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export function getSessionResumePath(sessionId: string): string {
  return `/continue/${sessionId}`;
}
