import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  keys: z.array(z.string().min(1)).optional(),
});

export const defaults = {
  results_version: "v1.2.1",
  fc_expected_min: 24,
  state_weights: {
    "N+": -0.15,
    "N0": 0,
    "N-": 0.15,
  },
  dim_thresholds: { one: 2.1, two: 3.0, three: 3.8 },
  neuro_norms: { mean: 3, sd: 1 },
  system_status: { status: "ok", message: "PRISM online", last_updated: null as string | null, updated_by: "admin" },
  required_question_tags: [
    "Ti_S",
    "Te_S",
    "Fi_S",
    "Fe_S",
    "Ni_S",
    "Ne_S",
    "Si_S",
    "Se_S",
    "N",
    "N_R",
    "SD",
    "INC_A",
    "INC_B",
    "AC_1",
  ],
} as const;

type ConfigDefaults = typeof defaults;

type ConfigRecords = Map<string, unknown>;

export function mergeConfigRecords(records: ConfigRecords): ConfigDefaults & Record<string, unknown> {
  const merged: Record<string, unknown> = { ...defaults };
  for (const [key, value] of records.entries()) {
    merged[key] = value;
  }
  return merged as ConfigDefaults & Record<string, unknown>;
}

function createAdminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  return createClient(url, key);
}

async function fetchConfigRecords(
  client: SupabaseClient,
  keys: string[] | undefined,
): Promise<ConfigRecords> {
  let query = client.from("scoring_config").select("key, value");
  if (keys && keys.length > 0) {
    query = query.in("key", keys);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`failed_to_fetch_configuration:${error.message}`);
  }

  const map: ConfigRecords = new Map();
  for (const row of data ?? []) {
    if (typeof row.key === "string") {
      map.set(row.key, row.value);
    }
  }
  return map;
}

function warnMissingKeys(requested: string[] | undefined, records: ConfigRecords) {
  if (!requested || requested.length === 0) return;
  for (const key of requested) {
    if (!records.has(key) && (defaults as Record<string, unknown>)[key] !== undefined) {
      console.warn(JSON.stringify({ evt: "config_missing_key", key }));
    }
  }
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const client = createAdminClient();
    let parsedBody: z.infer<typeof requestSchema> | undefined;

    if (req.method === "POST") {
      const text = await req.text();
      if (text.trim().length > 0) {
        const json = JSON.parse(text);
        const parsed = requestSchema.safeParse(json);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: "Invalid request payload" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        parsedBody = parsed.data;
      }
    }

    const keys = parsedBody?.keys;
    const records = await fetchConfigRecords(client, keys);
    warnMissingKeys(keys, records);
    const merged = mergeConfigRecords(records);

    return new Response(JSON.stringify({ config: merged, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in getConfig function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

if (import.meta.main) {
  serve(handleRequest);
}
