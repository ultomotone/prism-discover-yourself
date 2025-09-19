import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
}).refine((value) => Boolean(value.sessionId || value.userId), {
  message: "Either sessionId or userId required",
});

interface SessionRow {
  id: string;
  user_id: string | null;
  status: string;
  completed_at: string | null;
}

export interface CompletenessCounts {
  types: number;
  functions: number;
  state: number;
}

export interface RecomputeResult {
  sessionId: string;
  invoked: boolean;
  status: "updated" | "skipped" | "failed";
  reason?: "already_complete" | "no_responses" | "fc_failed" | "prism_failed" | "v2_rows_incomplete" | string;
}

export interface RecomputeSummary {
  ok: boolean;
  updatedCount: number;
  results: RecomputeResult[];
}

interface InvocationResult {
  ok: boolean;
  error?: string;
}

interface PipelineDependencies {
  listSessions: (filter: { sessionId?: string; userId?: string }) => Promise<SessionRow[]>;
  fetchCompleteness: (sessionId: string) => Promise<CompletenessCounts>;
  hasResponses: (sessionId: string) => Promise<boolean>;
  invokeScoreFc: (sessionId: string) => Promise<InvocationResult>;
  invokeScorePrism: (sessionId: string) => Promise<InvocationResult>;
}

export function needsRecompute(counts: CompletenessCounts): boolean {
  return !(counts.types === 16 && counts.functions === 8 && counts.state >= 1);
}

export function normalizeCompletenessPayload(raw: unknown): CompletenessCounts {
  if (Array.isArray(raw)) {
    return normalizeCompletenessPayload(raw[0] ?? null);
  }

  if (!raw || typeof raw !== "object") {
    return { types: 0, functions: 0, state: 0 };
  }

  const record = raw as Record<string, unknown>;
  const coerce = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return Math.trunc(parsed);
      }
    }
    return 0;
  };

  return {
    types: coerce(record.types),
    functions: coerce(record.functions),
    state: coerce(record.state),
  };
}

async function listSessionsForRecompute(client: SupabaseClient, filter: { sessionId?: string; userId?: string }): Promise<SessionRow[]> {
  let query = client
    .from("assessment_sessions")
    .select("id,user_id,status,completed_at")
    .eq("status", "completed");

  if (filter.sessionId) {
    query = query.eq("id", filter.sessionId);
  }
  if (filter.userId) {
    query = query.eq("user_id", filter.userId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`failed_to_fetch_sessions:${error.message}`);
  }
  return (data ?? []) as SessionRow[];
}

async function loadCompleteness(client: SupabaseClient, sessionId: string): Promise<CompletenessCounts> {
  const { data, error } = await client.rpc("v2_completeness", { p_session: sessionId });
  if (error) {
    throw new Error(`failed_to_fetch_completeness:${error.message}`);
  }
  return normalizeCompletenessPayload(data);
}

async function invokeFunction(
  client: SupabaseClient,
  name: string,
  sessionId: string,
  body: Record<string, unknown>,
): Promise<InvocationResult> {
  const { data, error } = await client.functions.invoke(name, { body });
  if (error) {
    return { ok: false, error: error.message };
  }
  if (data && typeof data === "object" && "error" in data && !("status" in data && data.status === "success")) {
    const err = (data as { error?: string }).error;
    return { ok: false, error: err ?? `${name}_failed` };
  }
  return { ok: true };
}

async function buildDependencies(client: SupabaseClient): Promise<PipelineDependencies> {
  return {
    listSessions: (filter) => listSessionsForRecompute(client, filter),
    fetchCompleteness: (sessionId) => loadCompleteness(client, sessionId),
    hasResponses: (sessionId) => hasAnyResponses(client, sessionId),
    invokeScoreFc: (sessionId) => invokeFunction(client, "score_fc_session", sessionId, { session_id: sessionId }),
    invokeScorePrism: (sessionId) => invokeFunction(client, "score_prism", sessionId, { session_id: sessionId }),
  };
}

async function hasAnyResponses(db: SupabaseClient, sessionId: string): Promise<boolean> {
  const { count, error } = await db
    .from("assessment_responses")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  if (error) {
    throw new Error(`responses_count_failed:${error.message}`);
  }

  return (count ?? 0) > 0;
}

export async function recomputeSessions(
  filter: { sessionId?: string; userId?: string },
  deps: PipelineDependencies,
): Promise<RecomputeSummary> {
  const sessions = await deps.listSessions(filter);
  const results: RecomputeResult[] = [];

  for (const session of sessions) {
    const completeness = await deps.fetchCompleteness(session.id);
    if (!needsRecompute(completeness)) {
      console.log(JSON.stringify({ evt: "recompute_skip_complete", session_id: session.id }));
      results.push({ sessionId: session.id, invoked: false, status: "skipped", reason: "already_complete" });
      continue;
    }

    const hasResponses = await deps.hasResponses(session.id);
    if (!hasResponses) {
      console.log(JSON.stringify({ evt: "recompute_skip_no_responses", session_id: session.id }));
      results.push({ sessionId: session.id, invoked: false, status: "skipped", reason: "no_responses" });
      continue;
    }

    console.log(JSON.stringify({ evt: "recompute_pipeline_start", session_id: session.id }));
    const fc = await deps.invokeScoreFc(session.id);
    if (!fc.ok) {
      console.error(JSON.stringify({ evt: "recompute_fc_failed", session_id: session.id, error: fc.error }));
      results.push({ sessionId: session.id, invoked: true, status: "failed", reason: "fc_failed" });
      continue;
    }

    const prism = await deps.invokeScorePrism(session.id);
    if (!prism.ok) {
      console.error(JSON.stringify({ evt: "recompute_prism_failed", session_id: session.id, error: prism.error }));
      results.push({ sessionId: session.id, invoked: true, status: "failed", reason: "prism_failed" });
      continue;
    }

    const postCompleteness = await deps.fetchCompleteness(session.id);
    if (needsRecompute(postCompleteness)) {
      console.error(JSON.stringify({ evt: "recompute_postcheck_incomplete", session_id: session.id, counts: postCompleteness }));
      results.push({ sessionId: session.id, invoked: true, status: "failed", reason: "v2_rows_incomplete" });
      continue;
    }

    console.log(JSON.stringify({ evt: "recompute_complete", session_id: session.id }));
    results.push({ sessionId: session.id, invoked: true, status: "updated" });
  }

  const updatedCount = results.filter((r) => r.status === "updated").length;
  return { ok: true, updatedCount, results };
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const text = await req.text();
    if (!text) {
      return new Response(JSON.stringify({ ok: false, error: "Either sessionId or userId required", updatedCount: 0 }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsedJson = JSON.parse(text);
    const parsed = requestSchema.safeParse(parsedJson);
    if (!parsed.success) {
      return new Response(JSON.stringify({ ok: false, error: parsed.error.errors[0]?.message ?? "Invalid payload", updatedCount: 0 }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const deps = await buildDependencies(client);
    const summary = await recomputeSessions(parsed.data, deps);
    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(JSON.stringify({ evt: "recompute_scoring_error", error: error instanceof Error ? error.message : String(error) }));
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unknown error", updatedCount: 0 }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

if (import.meta.main) {
  serve(handleRequest);
}
