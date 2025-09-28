// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Filters = {
  overlays?: string[];
  types?: string[];
  devices?: string[];
};

type RequestBody = {
  lookbackDays?: number;
  tz?: string;
  filters?: Filters;
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function pct(numer: number, denom: number): number {
  if (!denom) return 0;
  return Math.round((1000 * numer) / denom) / 10;
}

function toDayKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lookbackDays = 30, filters = {} } = 
      (await req.json().catch(() => ({}))) as RequestBody;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const now = new Date();
    const since = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

    console.log(`Computing metrics for window: ${since.toISOString()} to ${now.toISOString()}`);

    // 1) Sessions started in window (for completion rate denominator)
    const { data: startedSessions, error: startedError } = await supabase
      .from("assessment_sessions")
      .select("id, started_at, completed_at, status")
      .gte("started_at", since.toISOString())
      .lte("started_at", now.toISOString());

    if (startedError) {
      console.error("Error fetching started sessions:", startedError);
      throw startedError;
    }

    // 2) Sessions completed in window
    let completedQuery = supabase
      .from("assessment_sessions")
      .select("id, started_at, completed_at, status, email, user_id")
      .eq("status", "completed")
      .gte("completed_at", since.toISOString())
      .lte("completed_at", now.toISOString());

    const { data: completedSessions, error: completedError } = await completedQuery;
    
    if (completedError) {
      console.error("Error fetching completed sessions:", completedError);
      throw completedError;
    }

    const completedIds = (completedSessions || []).map(s => s.id);
    console.log(`Found ${completedIds.length} completed sessions`);

    // 3) Profiles for completed sessions
    let profilesQuery = supabase
      .from("profiles")
      .select(`
        session_id, 
        type_code, 
        top_gap, 
        score_fit_calibrated, 
        conf_calibrated, 
        validity_status, 
        overlay,
        created_at
      `)
      .in("session_id", completedIds);

    if (filters.overlays?.length) {
      profilesQuery = profilesQuery.in("overlay", filters.overlays);
    }
    if (filters.types?.length) {
      profilesQuery = profilesQuery.in("type_code", filters.types);
    }

    const { data: profiles, error: profilesError } = await profilesQuery;
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${(profiles || []).length} profiles`);

    // Create session lookup
    const sessionById = new Map();
    for (const s of completedSessions || []) {
      sessionById.set(s.id, s);
    }

    // Calculate durations (minutes), clamped to [1, 180]
    const durations: number[] = [];
    let stallers = 0, speeders = 0;
    
    for (const s of completedSessions || []) {
      if (!s.started_at || !s.completed_at) continue;
      
      const startTime = new Date(s.started_at).getTime();
      const endTime = new Date(s.completed_at).getTime();
      
      if (!isFinite(startTime) || !isFinite(endTime) || endTime <= startTime) continue;
      
      const durationMinutes = clamp((endTime - startTime) / 60000, 1, 180);
      durations.push(durationMinutes);
      
      if (durationMinutes > 60) stallers++;
      if (durationMinutes < 12) speeders++;
    }

    // Profile-derived metrics
    const usableProfiles = profiles || [];
    const completions = usableProfiles.length;

    let validityPass = 0, closeCalls = 0;
    const topGaps: number[] = [];
    const top1Fits: number[] = [];
    const confidences: number[] = [];
    const overlayCounts = new Map<string, number>();
    const typeCounts = new Map<string, number>();

    for (const p of usableProfiles) {
      if (p.validity_status === "pass") validityPass++;
      
      if (p.top_gap != null) {
        topGaps.push(p.top_gap);
        if (p.top_gap < 3) closeCalls++;
      }
      
      if (p.score_fit_calibrated != null) {
        top1Fits.push(p.score_fit_calibrated);
      }
      
      if (p.conf_calibrated != null) {
        confidences.push(p.conf_calibrated);
      }
      
      if (p.overlay) {
        overlayCounts.set(p.overlay, (overlayCounts.get(p.overlay) || 0) + 1);
      }
      
      if (p.type_code) {
        typeCounts.set(p.type_code, (typeCounts.get(p.type_code) || 0) + 1);
      }
    }

    // Duplicates calculation: same email/user with multiple sessions
    const completedWithIdentifier = (completedSessions || []).filter(s => s.email || s.user_id);
    const byIdentifier = new Map<string, any[]>();
    
    for (const s of completedWithIdentifier) {
      const key = s.user_id || (s.email ? s.email.toLowerCase() : '');
      if (!key) continue;
      
      if (!byIdentifier.has(key)) byIdentifier.set(key, []);
      byIdentifier.get(key)!.push(s);
    }
    
    let duplicateCount = 0;
    for (const [, sessions] of byIdentifier) {
      if (sessions.length > 1) duplicateCount += sessions.length - 1;
    }

    // Daily trend
    const dailyCounts = new Map<string, number>();
    for (const s of completedSessions || []) {
      if (!s.completed_at) continue;
      const dayKey = toDayKey(new Date(s.completed_at));
      dailyCounts.set(dayKey, (dailyCounts.get(dayKey) || 0) + 1);
    }
    
    const dailyTrend = Array.from(dailyCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, count]) => ({ day, count }));

    // Confidence histogram (10 bins from 0 to 1)
    const confBins = Array.from({ length: 10 }, () => 0);
    for (const c of confidences) {
      const binIndex = Math.min(9, Math.max(0, Math.floor(c * 10)));
      confBins[binIndex]++;
    }

    // Completion rate
    const startedCount = (startedSessions || []).length;
    const completionRate = pct(completions, startedCount);

    const result = {
      ok: true,
      generated_at: now.toISOString(),
      window: {
        since: since.toISOString(),
        until: now.toISOString(),
        lookback_days: lookbackDays
      },
      totals: {
        total_started: startedCount,
        total_completed: completions,
        completion_rate: completionRate
      },
      durations: {
        median_duration_min: median(durations),
        stallers_pct: pct(stallers, durations.length),
        speeders_pct: pct(speeders, durations.length)
      },
      validity: {
        validity_pass_rate: pct(validityPass, completions)
      },
      fit: {
        top_gap_median: median(topGaps),
        close_calls_pct: pct(closeCalls, completions),
        top1_fit_median: median(top1Fits),
        confidence_margin_median: confidences.length ? 
          Math.round(median(confidences.map(c => c * 100)) * 10) / 10 : 0
      },
      duplicates: {
        duplicates_pct: pct(duplicateCount, completedWithIdentifier.length)
      },
      distributions: {
        overlay: Array.from(overlayCounts.entries()).map(([overlay, count]) => ({ overlay, count })),
        types: Array.from(typeCounts.entries()).map(([type_code, count]) => ({ type_code, count })),
        confidence_bins: confBins
      },
      trends: {
        daily: dailyTrend
      }
    };

    console.log("Metrics computed successfully:", {
      completions,
      median_duration: result.durations.median_duration_min,
      close_calls_pct: result.fit.close_calls_pct,
      stallers_pct: result.durations.stallers_pct
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Error in admin-get-metrics:", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
});