const SUPABASE_URL = import.meta.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables missing');
}

export async function getResultsBySession(sessionId: string, shareToken?: string) {
  console.log(
    `results_fetch endpoint=get-results-by-session hasAuthHeader=true contentType=application/json session_id=${sessionId.slice(0, 8)}`,
  );

  const res = await fetch(`${SUPABASE_URL}/functions/v1/get-results-by-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ session_id: sessionId, ...(shareToken ? { share_token: shareToken } : {}) }),
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok || data?.error) {
    const err = data?.error ?? { code: 'unknown_error', message: 'Unknown error' };
    return { data: null, error: { status: res.status, ...err } };
  }

  return { data, error: null } as { data: any; error: null };
}
