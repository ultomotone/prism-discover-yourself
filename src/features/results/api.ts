import type { SupabaseClient } from '@supabase/supabase-js';

export type FetchResultsArgs = {
  supabase: SupabaseClient;
  sessionId: string;
  shareToken?: string | null;
};

export type FetchResultsResponse = {
  profile: any;
  session: { id: string; status: string };
};

export class FetchResultsError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export async function fetchResults({ supabase, sessionId, shareToken }: FetchResultsArgs): Promise<FetchResultsResponse> {
  if (shareToken) {
    const { data, error } = await supabase.rpc('get_profile_by_session', {
      p_session_id: sessionId,
      p_share_token: shareToken,
    });
    if (data && !error) {
      return { profile: data, session: { id: sessionId, status: 'completed' } };
    }
    if (error && (error as any)?.status === 429) {
      throw new FetchResultsError('rate_limited');
    }
    // fallthrough to edge function for other errors or missing profile
  }

  const { data: fnData, error: fnError } = await supabase.functions.invoke('get-results-by-session', {
    headers: { 'Content-Type': 'application/json' },
    body: { session_id: sessionId, share_token: shareToken || undefined },
  });
  if (fnError) {
    const status = (fnError as any).status;
    if (status === 404) throw new FetchResultsError('results_not_found');
    if (status === 403) throw new FetchResultsError('access_denied');
    if (status === 429) throw new FetchResultsError('rate_limited');
    throw new FetchResultsError('server_error');
  }

  const payload: any = fnData as any;
  if (payload && payload.ok === false) {
    throw new FetchResultsError(payload.reason || 'server_error');
  }

  const profile = payload.profile ?? payload;
  const session = payload.session ?? { id: sessionId, status: 'completed' };
  return { profile, session };
}
