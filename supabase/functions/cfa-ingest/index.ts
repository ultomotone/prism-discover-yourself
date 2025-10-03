import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cfa-ingest-token',
};

interface LoadingRow {
  results_version: string;
  scale_tag: string;
  question_id: number;
  lambda_std: number;
  theta: number | null;
}

interface FitRow {
  results_version: string;
  model_name: string;
  n: number;
  cfi: number;
  tli: number;
  rmsea: number;
  rmsea_lo?: number | null;
  rmsea_hi?: number | null;
  srmr: number;
}

interface InvarianceRow {
  results_version: string;
  level: "configural" | "metric" | "scalar";
  delta_cfi: number | null;
  delta_rmsea: number | null;
  pass: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Verify ingest token
    const token = req.headers.get("x-cfa-ingest-token");
    const expectedToken = Deno.env.get("CFA_INGEST_TOKEN");
    
    if (!expectedToken || token !== expectedToken) {
      console.error("[cfa-ingest] Unauthorized attempt");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: 'Bad JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { loadings, fit, invariance } = body as { 
      loadings: LoadingRow[]; 
      fit: FitRow; 
      invariance?: InvarianceRow[] 
    };

    console.log(`[cfa-ingest] Received loadings: ${loadings?.length || 0}, fit: ${fit ? 'yes' : 'no'}, invariance: ${invariance?.length || 0}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert loadings
    if (Array.isArray(loadings) && loadings.length > 0) {
      const { error: e1 } = await supabase
        .from("cfa_loadings")
        .upsert(loadings, { 
          onConflict: "results_version,scale_tag,question_id" 
        });
      
      if (e1) {
        console.error("[cfa-ingest] Loadings upsert error:", e1);
        return new Response(JSON.stringify({ error: `Loadings upsert error: ${e1.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log(`[cfa-ingest] ✅ Upserted ${loadings.length} loadings`);
    }

    // Upsert global fit
    if (fit) {
      const { error: e2 } = await supabase
        .from("cfa_fit")
        .upsert([fit], { onConflict: "results_version,model_name" });
      
      if (e2) {
        console.error("[cfa-ingest] Fit upsert error:", e2);
        return new Response(JSON.stringify({ error: `Fit upsert error: ${e2.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log("[cfa-ingest] ✅ Upserted fit indices");
    }

    // Upsert invariance (optional)
    if (Array.isArray(invariance) && invariance.length > 0) {
      const { error: e3 } = await supabase
        .from("invariance_results")
        .upsert(invariance, { onConflict: "results_version,level" });
      
      if (e3) {
        console.error("[cfa-ingest] Invariance upsert error:", e3);
        return new Response(JSON.stringify({ error: `Invariance upsert error: ${e3.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log(`[cfa-ingest] ✅ Upserted ${invariance.length} invariance rows`);
    }

    // Refresh dependent materialized views
    console.log("[cfa-ingest] Refreshing psychometric views...");
    const { error: e4 } = await supabase.rpc("refresh_psych_kpis");
    
    if (e4) {
      console.error("[cfa-ingest] Refresh error:", e4);
      // Don't fail the ingest if refresh fails
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Ingest OK but refresh failed', 
        refresh_error: e4.message 
      }), {
        status: 202,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("[cfa-ingest] ✅ Complete");
    return new Response(JSON.stringify({ success: true, message: 'Ingest OK' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("[cfa-ingest] Error:", err);
    return new Response(JSON.stringify({ 
      error: String(err),
      message: "CFA ingest failed"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
