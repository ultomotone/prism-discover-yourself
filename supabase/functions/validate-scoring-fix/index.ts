import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  
  try {
    const { session_id, use_enhanced = false } = await req.json();
    
    if (!session_id) {
      return new Response(JSON.stringify({ ok: false, error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`🔍 Validating scoring for session: ${session_id}`);
    console.log(`🚀 Using ${use_enhanced ? 'enhanced' : 'original'} scoring engine`);

    // Get the profile before scoring
    const { data: beforeProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("session_id", session_id)
      .maybeSingle();

    console.log("📊 Profile before scoring:", {
      exists: !!beforeProfile,
      type_code: beforeProfile?.type_code,
      top_gap: beforeProfile?.top_gap,
      strengths_sample: beforeProfile?.strengths ? Object.entries(beforeProfile.strengths).slice(0, 3) : null,
      dimensions_sample: beforeProfile?.dimensions ? Object.entries(beforeProfile.dimensions).slice(0, 3) : null,
      blocks: beforeProfile?.blocks_norm
    });

    // Call the appropriate scoring function
    const scoringFunction = use_enhanced ? 'enhanced-score-engine' : 'score_prism';
    const { data: scoringResult, error: scoringError } = await supabase.functions.invoke(scoringFunction, {
      body: { session_id }
    });

    if (scoringError) {
      console.error("❌ Scoring error:", scoringError);
      return new Response(JSON.stringify({ 
        ok: false, 
        error: scoringError.message,
        function_used: scoringFunction
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get the profile after scoring
    const { data: afterProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("session_id", session_id)
      .single();

    console.log("📊 Profile after scoring:", {
      type_code: afterProfile?.type_code,
      top_gap: afterProfile?.top_gap,
      strengths_sample: afterProfile?.strengths ? Object.entries(afterProfile.strengths).slice(0, 3) : null,
      dimensions_sample: afterProfile?.dimensions ? Object.entries(afterProfile.dimensions).slice(0, 3) : null,
      blocks: afterProfile?.blocks_norm,
      overlay: afterProfile?.overlay
    });

    // Analyze the results
    const analysis = analyzeProfile(afterProfile);
    
    console.log("🔍 Analysis results:", analysis);

    return new Response(JSON.stringify({
      ok: true,
      session_id,
      function_used: scoringFunction,
      before: beforeProfile ? {
        type_code: beforeProfile.type_code,
        top_gap: beforeProfile.top_gap,
        has_computed_strengths: Object.values(beforeProfile.strengths || {}).some((v: any) => v !== 0 && v !== 3.0),
        has_computed_dimensions: Object.values(beforeProfile.dimensions || {}).some((v: any) => v !== 0),
        has_computed_blocks: Object.values(beforeProfile.blocks_norm || {}).some((v: any) => v !== 0)
      } : null,
      after: {
        type_code: afterProfile.type_code,
        top_gap: afterProfile.top_gap,
        has_computed_strengths: Object.values(afterProfile.strengths || {}).some((v: any) => v !== 0 && v !== 3.0),
        has_computed_dimensions: Object.values(afterProfile.dimensions || {}).some((v: any) => v !== 0),
        has_computed_blocks: Object.values(afterProfile.blocks_norm || {}).some((v: any) => v !== 0)
      },
      analysis,
      scoring_result: scoringResult
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("❌ Validation error:", error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message || "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

function analyzeProfile(profile: any): any {
  if (!profile) return { issues: ["No profile found"] };
  
  const issues = [];
  const successes = [];
  
  // Check for uniform shares issue
  const topTypes = profile.top_types || [];
  if (topTypes.length >= 2) {
    const shares = topTypes.map((t: any) => t.share);
    const allSame = shares.every((s: number) => Math.abs(s - shares[0]) < 0.1);
    if (allSame) {
      issues.push("🚨 UNIFORM SHARES: All shares are nearly identical (~6.3%)");
    } else {
      successes.push("✅ SHARES VARIED: Different probabilities computed");
    }
    
    // Check top gap
    const gap = shares[0] - (shares[1] || 0);
    if (gap === 0 || gap < 0.01) {
      issues.push("🚨 ZERO GAP: Top-2 gap is 0 or near-zero");
    } else {
      successes.push(`✅ MEANINGFUL GAP: Top-2 gap = ${gap.toFixed(2)}%`);
    }
  }
  
  // Check for flat fit scores
  const top3Fits = profile.top_3_fits || [];
  if (top3Fits.length >= 2) {
    const fits = top3Fits.map((f: any) => f.fit);
    const allSameFit = fits.every((f: number) => Math.abs(f - fits[0]) < 1);
    if (allSameFit && fits[0] === 85) {
      issues.push("🚨 FLAT FIT: All fits are identical (85)");
    } else {
      successes.push("✅ VARIED FITS: Different fit scores computed");
    }
  }
  
  // Check strengths computation
  const strengths = profile.strengths || {};
  const strengthValues = Object.values(strengths) as number[];
  const allTypical = strengthValues.every((s: any) => Math.abs(s - 3.0) < 0.1);
  if (allTypical || strengthValues.every((s: any) => s === 0)) {
    issues.push("🚨 PLACEHOLDER STRENGTHS: All strengths are 3.0 or 0");
  } else {
    const variance = calculateVariance(strengthValues);
    successes.push(`✅ COMPUTED STRENGTHS: Variance = ${variance.toFixed(3)}`);
  }
  
  // Check dimensions computation
  const dimensions = profile.dimensions || {};
  const dimValues = Object.values(dimensions);
  if (dimValues.every((d: any) => d === 0)) {
    issues.push("🚨 MISSING DIMENSIONS: All dimensions are 0");
  } else {
    const distribution = dimValues.reduce((acc: any, val: any) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    successes.push(`✅ COMPUTED DIMENSIONS: Distribution = ${JSON.stringify(distribution)}`);
  }
  
  // Check blocks computation
  const blocks = profile.blocks_norm || {};
  const blockValues = Object.values(blocks);
  if (blockValues.every((b: any) => b === 0)) {
    issues.push("🚨 MISSING BLOCKS: All blocks are 0");
  } else {
    successes.push(`✅ COMPUTED BLOCKS: ${JSON.stringify(blocks)}`);
  }
  
  // Check overlay computation
  if (!profile.overlay || profile.overlay === '0' || profile.overlay === 'none') {
    issues.push("🚨 MISSING OVERLAY: No overlay computed");
  } else {
    successes.push(`✅ COMPUTED OVERLAY: ${profile.overlay}`);
  }
  
  return {
    score: issues.length === 0 ? "PERFECT" : issues.length < 3 ? "GOOD" : "NEEDS_WORK",
    issues,
    successes,
    summary: `${successes.length} successes, ${issues.length} issues`
  };
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return variance;
}