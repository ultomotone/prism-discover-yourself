// PRISM Results fetcher with CORS + shareToken and owner checks

import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// allow localhost + prod domains
const ALLOWED_ORIGINS = new Set<string>([
  'http://localhost:3000',
  'http://localhost:5173',
  'https://prismpersonality.com',
  'https://lovable.dev',
]);

function withCors(req: Request, res: Response) {
  const origin = req.headers.get('origin') ?? '';
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : '';
  const h = new Headers(res.headers);
  if (allow) h.set('Access-Control-Allow-Origin', allow);
  h.set('Vary', 'Origin');
  h.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
  h.set('Access-Control-Allow-Headers', 'authorization, content-type');
  return new Response(res.body, { status: res.status, headers: h });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return withCors(req, new Response(null, { status: 204 }));
  }

  try {
    const { sessionId, shareToken } = await req.json().catch(() => ({}));
    if (!sessionId) {
      return withCors(
        req,
        new Response(JSON.stringify({ error: 'sessionId required' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
      );
    }

    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') ?? '' },
      },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: userData } = await caller.auth.getUser();
    const userId = userData?.user?.id ?? null;

    const { data: sess, error: sErr } = await admin
      .from('assessment_sessions')
      .select('id,status,user_id,share_token')
      .eq('id', sessionId)
      .single();

    if (sErr || !sess) {
      return withCors(
        req,
        new Response(JSON.stringify({ error: 'not_found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }),
      );
    }

    const isOwner = !!userId && userId === sess.user_id;
    const hasValidShare = !!shareToken && shareToken === sess.share_token;
    const isCompleted = (sess.status ?? '') === 'completed';

    if (!isOwner && !hasValidShare && !isCompleted) {
      return withCors(
        req,
        new Response(JSON.stringify({ error: 'forbidden' }), {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }),
      );
    }

    const { data: profile, error: pErr } = await admin
      .from('profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (pErr || !profile) {
      return withCors(
        req,
        new Response(JSON.stringify({ error: 'not_found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        }),
      );
    }

    return withCors(
      req,
      new Response(
        JSON.stringify({
          profile,
          session: { id: sess.id, status: sess.status ?? 'completed' },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
  } catch (e) {
    return withCors(
      req,
      new Response(
        JSON.stringify({ error: 'internal', detail: (e as Error).message }),
        { status: 500, headers: { 'content-type': 'application/json' } },
      ),
    );
  }
});

