import { createClient } from "npm:@supabase/supabase-js@2";
import postgres from "https://esm.sh/postgres@3.4.3";
import { z } from "npm:zod@3.25.76";

const URL   = Deno.env.get("SUPABASE_URL")!;
const SRK   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DB_URL = Deno.env.get("SUPABASE_DB_URL")!; // e.g. postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres
const VERSION = Deno.env.get("SCORING_VERSION") ?? "vX";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

console.info("recompute-profiles: server started");

interface ProcessResult {
  session: string;
  ok: boolean;
  error?: string;
  profileId?: string;
  dryRun?: boolean;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
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
        JSON.stringify({ error: "invalid_body", detail: parsed.error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { sessionId, dryRun = false } = parsed.data;

    // Supabase admin client (used only to find targets)
    const admin = createClient(URL, SRK, {
      global: { headers: { Prefer: "tx=commit" } } // force commit for writes if PostgREST is used elsewhere
    });

    // Direct Postgres connection for running the admin function (bypasses PostgREST read-only paths)
    const sql = !dryRun
      ? postgres(DB_URL, { prepare: false })
      : null;

    // Build target list
    console.log(`Looking for session: ${sessionId ? sessionId : 'all recent sessions'}`);
    
    const targetsQuery = admin
      .from("assessment_sessions")
      .select("id, status")
      .in("status", ["completed"])
      .order("created_at", { ascending: false })
      .limit(2000);

    const { data: targetData, error: targetError } = sessionId
      ? await admin.from("assessment_sessions").select("id, status").eq("id", sessionId)
      : await targetsQuery;

    console.log('Target query result:', { targetData, targetError, sessionId });

    if (targetError) {
      console.error("Target query error:", targetError);
      return new Response(
        JSON.stringify({ error: "target_query_failed", detail: targetError?.message ?? "unknown" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targets: Array<{ id: string }> = targetData ?? [];
    console.log(`Found ${targets.length} target sessions:`, targets.map(t => ({ id: t.id, status: (t as any).status })));

    const processTarget = async (t: { id: string }): Promise<ProcessResult | null> => {
      if (!t?.id) return null;

      if (!dryRun) {
        try {
          // Call the DB function directly; returns the (re)computed profile id
          // Adjust the select list if your function returns different columns.
          const rows = await sql!<{ id: string }[]>`
            select id
            from admin_recompute_profile(${t.id}::uuid, ${VERSION});
          `;
          return { session: t.id, ok: true, profileId: rows?.[0]?.id };
        } catch (err) {
          return { session: t.id, ok: false, error: (err as Error)?.message ?? "unknown" };
        }
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

    if (sql) {
      try { await sql.end(); } catch { /* no-op */ }
    }

    return new Response(
      JSON.stringify({ count: results.length, version: VERSION, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json", Connection: "keep-alive" } }
    );
  } catch (e) {
    console.error("Error in recompute-profiles:", e);
    return new Response(
      JSON.stringify({ error: "internal", detail: (e as any)?.message ?? "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
