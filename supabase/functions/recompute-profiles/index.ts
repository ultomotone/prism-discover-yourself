import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.25.76";

const URL = Deno.env.get('SUPABASE_URL')!;
const SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VERSION = Deno.env.get('SCORING_VERSION') ?? 'vX';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

console.info('Recompute profiles server started');

interface ProcessResult {
  session: string;
  ok: boolean;
  error?: string;
  profileId?: string;
  dryRun?: boolean;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = z.object({
      sessionId: z.string().uuid().optional(),
      dryRun: z.boolean().optional()
    }).safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'invalid_body', detail: parsed.error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, dryRun = false } = parsed.data;
    const admin = createClient(
      URL,
      SRK,
      {
        global: { headers: { Prefer: 'tx=commit' } }
      }
    );

    const rpcUrl = `${URL}/rest/v1/rpc/admin_recompute_profile`;

    const targetsQuery = admin
      .from('assessment_sessions')
      .select('id')
      .in('status', ['completed'])
      .order('created_at', { ascending: false })
      .limit(2000);

    const { data: targetData, error: targetError } = sessionId
      ? { data: [{ id: sessionId }], error: null }
      : await targetsQuery;

    if (targetError) {
      console.error('Target query error:', targetError);
      return new Response(
        JSON.stringify({ error: 'target_query_failed', detail: targetError?.message ?? 'unknown' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targets: Array<{ id: string }> = targetData ?? [];

    const processTarget = async (t: { id: string }): Promise<ProcessResult | null> => {
      if (!t?.id) return null;

      if (!dryRun) {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SRK,
            Authorization: `Bearer ${SRK}`,
            Prefer: 'tx=commit'
          },
          body: JSON.stringify({
            p_session_id: t.id,
            p_version: VERSION
          })
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: response.statusText }));
          return { session: t.id, ok: false, error: err?.message ?? 'unknown' };
        }

        const data = await response.json().catch(() => undefined);

        return {
          session: t.id,
          ok: true,
          profileId: data?.[0]?.id
        };
      }

      return { session: t.id, ok: true, dryRun: true };
    };

    const batchSize = 10;
    const results: ProcessResult[] = [];

    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processTarget));
      results.push(...batchResults.filter((r): r is ProcessResult => Boolean(r)));
    }

    return new Response(
      JSON.stringify({
        count: results.length,
        version: VERSION,
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' }
      }
    );
  } catch (e) {
    console.error('Error in recompute-profiles:', e);
    return new Response(
      JSON.stringify({ error: 'internal', detail: (e as Error)?.message ?? 'unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

