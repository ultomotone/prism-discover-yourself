// supabase/functions/compare_runs/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUNCS = ["Ti","Te","Fi","Fe","Ni","Ne","Si","Se"] as const;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { session_a, session_b, person_key, latest = false } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnon) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RLS-aware client using the caller's JWT
    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    let a = session_a as string | undefined;
    let b = session_b as string | undefined;

    if (latest && person_key) {
      const { data, error } = await supabase
        .from("profiles")
        .select("session_id")
        .eq("person_key", person_key)
        .order("created_at", { ascending: false })
        .limit(2);
      if (error) throw error;
      if (!data || data.length < 2) {
        return new Response(JSON.stringify({ error: "Not enough runs to compare" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      a = data[1].session_id;
      b = data[0].session_id;
    }

    if (!a || !b) {
      return new Response(JSON.stringify({ error: "session_a and session_b required (or latest=true with person_key)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fetchOne = async (sid: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("type_code, strengths, dimensions, neuroticism, overlay, created_at, run_index, top_types, blocks_norm, type_scores, conf_calibrated")
        .eq("session_id", sid)
        .maybeSingle();
      if (error) throw error;
      return data;
    };

    const P = await fetchOne(a);
    const C = await fetchOne(b);
    if (!P || !C) {
      return new Response(JSON.stringify({ error: "Sessions not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Safe accessor helper
    const safe = (o: any, p: string, d: any = null) => (o && o[p] !== undefined ? o[p] : d);
    const fitFrom = safe(P, 'type_scores', {})?.[P.type_code]?.fit_abs ?? null;
    const fitTo = safe(C, 'type_scores', {})?.[C.type_code]?.fit_abs ?? null;

    const dS: Record<string, number> = {};
    const dD: Record<string, number> = {};
    for (const f of FUNCS) {
      dS[f] = Number(((C.strengths?.[f] || 0) - (P.strengths?.[f] || 0)).toFixed(3));
      dD[f] = (C.dimensions?.[f] || 0) - (P.dimensions?.[f] || 0);
    }

    const result = {
      from: { session_id: a, type: P.type_code, overlay: P.overlay, created_at: P.created_at, run_index: P.run_index },
      to:   { session_id: b, type: C.type_code, overlay: C.overlay, created_at: C.created_at, run_index: C.run_index },
      deltas: {
        strengths: dS,
        dimensions: dD,
        neuro: {
          mean: Number(((C.neuroticism?.raw_mean || 0) - (P.neuroticism?.raw_mean || 0)).toFixed(3)),
          z: Number(((C.neuroticism?.z || 0) - (P.neuroticism?.z || 0)).toFixed(3)),
          overlay_from: P.overlay,
          overlay_to: C.overlay,
        },
        type_changed: P.type_code !== C.type_code,
        fit_abs: Number(((fitTo ?? 0) - (fitFrom ?? 0)).toFixed(2)),
        confidence_delta: Number((((C.conf_calibrated ?? 0) - (P.conf_calibrated ?? 0))).toFixed(4)),
      },
    };

    return new Response(JSON.stringify({ status: "success", comparison: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("compare_runs error:", e?.message || e);
    return new Response(JSON.stringify({ status: "error", error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});