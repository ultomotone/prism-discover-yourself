/**
 * Recompute Split-Half (SB) and Item Discrimination for all active scales.
 * Safe: read-only on responses; writes only to psychometrics_external + psychometrics_item_stats.
 * Default results_version: 'v1.2.1'
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Row = Record<string, number>; // wide row: question_id -> numeric value (1..5 adjusted)

function pearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, m = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i], yi = y[i];
    if (Number.isFinite(xi) && Number.isFinite(yi)) {
      sx += xi; sy += yi; sxx += xi * xi; syy += yi * yi; sxy += xi * yi; m++;
    }
  }
  if (m < 3) return NaN;
  const cov = sxy - (sx * sy) / m;
  const vx = sxx - (sx * sx) / m;
  const vy = syy - (sy * sy) / m;
  return (vx <= 0 || vy <= 0) ? NaN : cov / Math.sqrt(vx * vy);
}

function spearmanBrown(r: number) { return (2 * r) / (1 + r); }

function splitHalfSB(matrix: number[][], seed = 42, B = 200) {
  const rows = matrix.length, cols = matrix[0]?.length ?? 0;
  if (rows < 3 || cols < 2) return { rho: null, n: rows };
  
  // deterministic PRNG
  let s = seed >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0, (s & 0xffffffff) / 0x100000000);
  const idx = [...Array(cols).keys()];
  const rhos: number[] = [];
  
  // precompute column sums per row helper
  const rowSum = (colsIdx: number[]) => {
    const out = new Array(rows).fill(0);
    for (const j of colsIdx) {
      for (let i = 0; i < rows; i++) {
        const v = matrix[i][j];
        out[i] += Number.isFinite(v) ? v : 0;
      }
    }
    return out;
  };
  
  for (let b = 0; b < B; b++) {
    // shuffle indices
    for (let k = cols - 1; k > 0; k--) { 
      const r = Math.floor(rnd() * (k + 1)); 
      [idx[k], idx[r]] = [idx[r], idx[k]]; 
    }
    const A = idx.filter((_, k) => k % 2 === 0), Bidx = idx.filter((_, k) => k % 2 === 1);
    if (!A.length || !Bidx.length) continue;
    const s1 = rowSum(A), s2 = rowSum(Bidx);
    const r = pearson(s1, s2);
    if (Number.isFinite(r)) rhos.push(spearmanBrown(r));
  }
  if (!rhos.length) return { rho: null, n: rows };
  rhos.sort((a, b) => a - b);
  const med = rhos[Math.floor(rhos.length / 2)];
  return { rho: Math.max(-1, Math.min(1, med)), n: rows };
}

function itemDiscrimination(matrix: number[][]) {
  const rows = matrix.length, cols = matrix[0]?.length ?? 0;
  if (rows < 3 || cols < 2) return Array(cols).fill(null);
  const totals = matrix.map(r => r.reduce((a, v) => a + (Number.isFinite(v) ? v : 0), 0));
  const out: (number | null)[] = [];
  for (let j = 0; j < cols; j++) {
    const col = matrix.map(r => r[j]);
    const totMinus = totals.map((t, i) => t - (Number.isFinite(col[i]) ? col[i] : 0));
    const r = pearson(col as number[], totMinus as number[]);
    out.push(Number.isFinite(r) ? r : null);
  }
  return out;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supaSrv = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    let body: any = {};
    try { body = await req.json(); } catch { }
    const resultsVersion = (body?.results_version ?? "v1.2.1") as string;

    console.log(`[recompute-psych-lite] Starting computation for version ${resultsVersion}`);

    // 1) Get active scale→item map (weight sign indicates reverse-keying)
    const { data: map, error: eMap } = await supaSrv
      .from("v_active_scale_items")
      .select("scale_code,question_id,weight");
    if (eMap) {
      console.error("[recompute-psych-lite] Error fetching scale items:", eMap);
      return new Response(JSON.stringify({ error: eMap.message }), { 
        status: 500, 
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    // group items by scale
    const byScale = new Map<string, { qid: number, weight: number }[]>();
    for (const r of map ?? []) {
      const sc = r.scale_code as string;
      const qid = Number(r.question_id);
      const w = Number(r.weight ?? 0);
      if (!byScale.has(sc)) byScale.set(sc, []);
      byScale.get(sc)!.push({ qid, weight: w });
    }

    console.log(`[recompute-psych-lite] Found ${byScale.size} scales to process`);

    // 2) Pull responses (answer_numeric 1..5)
    const { data: resp, error: eResp } = await supaSrv
      .from("assessment_responses")
      .select("session_id, question_id, answer_numeric");
    if (eResp) {
      console.error("[recompute-psych-lite] Error fetching responses:", eResp);
      return new Response(JSON.stringify({ error: eResp.message }), { 
        status: 500, 
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    console.log(`[recompute-psych-lite] Loaded ${resp?.length ?? 0} responses`);

    // 3) Build per-scale matrices with **complete cases** only
    const results: any = [];
    for (const [scale, items] of byScale.entries()) {
      const qids = items.map(i => i.qid);
      const qidSet = new Set(qids);

      // session -> row accumulator
      const rows = new Map<string, Row>();

      for (const r of resp ?? []) {
        const qid = Number(r.question_id);
        if (!qidSet.has(qid)) continue;
        const raw = Number(r.answer_numeric ?? NaN);
        if (!Number.isFinite(raw)) continue;

        // find weight for this item to determine reverse-keying
        const w = (items.find(x => x.qid === qid)?.weight ?? 0);
        // reverse-code if weight < 0: 1..5 -> 5..1
        const adj = w < 0 ? (6 - raw) : raw;

        const sid = String(r.session_id);
        if (!rows.has(sid)) rows.set(sid, {});
        rows.get(sid)![qid] = adj;
      }

      // keep only complete rows (all items present)
      const complete: number[][] = [];
      for (const row of rows.values()) {
        if (qids.every(qid => Number.isFinite(row[qid]))) {
          complete.push(qids.map(qid => row[qid]));
        }
      }

      console.log(`[recompute-psych-lite] Scale ${scale}: ${complete.length} complete cases from ${rows.size} sessions`);

      // compute SB + r_it
      const sb = splitHalfSB(complete, 42, 200);
      const rits = itemDiscrimination(complete);

      // 5) Persist
      // 5a) per-scale SB
      const { error: eSB } = await supaSrv
        .from("psychometrics_external")
        .upsert({
          results_version: resultsVersion,
          scale_code: scale,
          split_half_sb: sb.rho,
          split_half_n: sb.n,
          cohort_start: '2024-01-01',
          cohort_end: new Date().toISOString().split('T')[0],
          n_respondents: complete.length
        }, { onConflict: "results_version,scale_code" });

      if (eSB) {
        console.error(`[recompute-psych-lite] Error upserting SB for ${scale}:`, eSB);
      }

      // 5b) per-item r_it
      const upserts = (rits ?? []).map((r_it, j) => ({
        results_version: resultsVersion,
        scale_code: scale,
        question_id: qids[j],
        r_it,
        n_used: complete.length,
        computed_at: new Date().toISOString()
      }));
      
      if (upserts.length) {
        const { error: eRit } = await supaSrv.from("psychometrics_item_stats")
          .upsert(upserts, { onConflict: "results_version,question_id" });
        if (eRit) {
          console.error(`[recompute-psych-lite] Error upserting r_it for ${scale}:`, eRit);
        }
      }

      results.push({ scale, items: qids.length, n: complete.length, sb: sb.rho });
    }

    // 6) Refresh views (best-effort)
    console.log("[recompute-psych-lite] Refreshing materialized views...");
    await supaSrv.rpc("refresh_psych_kpis").catch((e) => {
      console.warn("[recompute-psych-lite] View refresh warning:", e);
    });

    console.log("[recompute-psych-lite] Computation complete!");

    return new Response(
      JSON.stringify({ 
        ok: true, 
        results_version: resultsVersion, 
        scales_processed: results.length,
        details: results 
      }), {
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  } catch (err) {
    console.error("[recompute-psych-lite] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" },
        status: 500
      }
    );
  }
});
