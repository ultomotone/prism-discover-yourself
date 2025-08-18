import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function invertLikert(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return (max + 1) - value; // e.g., 6 - v for 1..5; 8 - v for 1..7
}

function topTwo<T extends Record<string, number>>(m: T) {
  const arr = Object.entries(m).sort((a, b) => b[1] - a[1]);
  return {
    top: arr[0]?.[0] ?? null,
    second: arr[1]?.[0] ?? null,
    topVal: arr[0]?.[1] ?? 0,
    secondVal: arr[1]?.[1] ?? 0,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ status: 'error', error: 'session_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars');
      return new Response(JSON.stringify({ status: 'error', error: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1) Load responses for this session
    const { data: responses, error: respErr } = await supabase
      .from('assessment_responses')
      .select('question_id, answer_numeric, answer_value, question_type')
      .eq('session_id', session_id);

    if (respErr) {
      console.error('Error fetching responses', respErr);
      return new Response(JSON.stringify({ status: 'error', error: 'Failed to fetch responses' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!responses || responses.length === 0) {
      return new Response(JSON.stringify({ status: 'success', profile: { empty: true } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const qids = [...new Set(responses.map((r) => r.question_id).filter((x) => typeof x === 'number'))];

    // 2) Load scoring key for these questions
    const { data: keyRows, error: keyErr } = await supabase
      .from('assessment_scoring_key')
      .select('*')
      .in('question_id', qids);

    if (keyErr) {
      console.error('Error fetching scoring key', keyErr);
      return new Response(JSON.stringify({ status: 'error', error: 'Failed to fetch scoring key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const keyById = new Map<number, any>();
    keyRows?.forEach((k) => keyById.set(k.question_id, k));

    // Aggregates
    const tagScores: Record<string, number> = {};
    const blockScores: Record<string, number> = { Core: 0, Critic: 0, Instinct: 0, Hidden: 0 };
    const functionVotes: Record<string, number> = { Ti: 0, Te: 0, Fi: 0, Fe: 0, Ni: 0, Ne: 0, Si: 0, Se: 0 };
    let sdSum = 0, sdCount = 0;

    const pairBuckets = new Map<string, Array<{ qid: number; value: number }>>();

    for (const r of responses) {
      const sk = keyById.get(r.question_id);
      if (!sk) continue;

      const scale: string = sk.scale_type;
      const tag: string | null = sk.tag;
      const reverse: boolean = !!sk.reverse_scored;
      const weight: number = Number(sk.weight ?? 1) || 1;
      const pairGroup: string | null = sk.pair_group;
      const isSD: boolean = !!sk.social_desirability;
      const fcMap: Record<string, string> | null = sk.fc_map || null;

      // Handle forced-choice separately
      if (scale?.startsWith('FORCED_CHOICE')) {
        const raw = (r.answer_value ?? '').toString().trim();
        const letter = raw.toUpperCase();
        const mapped = fcMap ? fcMap[letter] : undefined;
        if (mapped) {
          if (['Core', 'Critic', 'Instinct', 'Hidden'].includes(mapped)) {
            blockScores[mapped] = (blockScores[mapped] || 0) + 1;
          } else if (['Ti','Te','Fi','Fe','Ni','Ne','Si','Se'].includes(mapped)) {
            functionVotes[mapped] = (functionVotes[mapped] || 0) + 1;
          }
        }
        continue;
      }

      // Numeric scales
      let val = Number(r.answer_numeric ?? 0);
      if (!Number.isFinite(val) || val <= 0) continue;

      if (scale === 'LIKERT_1_5') {
        if (reverse) val = invertLikert(val, 5);
      } else if (scale === 'LIKERT_1_7' || scale === 'STATE_1_7') {
        if (reverse) val = invertLikert(val, 7);
      } else if (scale === 'CATEGORICAL_5' || scale === 'FREQUENCY') {
        // Treat as numeric if provided; otherwise skip aggregation
      }

      // Pair bucket for inconsistency
      if (pairGroup) {
        const arr = pairBuckets.get(pairGroup) ?? [];
        arr.push({ qid: r.question_id as number, value: val });
        pairBuckets.set(pairGroup, arr);
      }

      // Social desirability
      if (isSD) {
        sdSum += val;
        sdCount += 1;
      }

      // Tag scoring
      if (tag) {
        tagScores[tag] = (tagScores[tag] || 0) + val * weight;
      }
    }

    // Inconsistency flags
    const inconsistencyFlags: Array<{ group: string; delta: number }> = [];
    for (const [group, arr] of pairBuckets.entries()) {
      if (arr.length >= 2) {
        const [a, b] = arr;
        const delta = Math.abs((a?.value ?? 0) - (b?.value ?? 0));
        if (delta >= 3) inconsistencyFlags.push({ group, delta });
      }
    }

    // Derive simple profile
    const { top: topBlock, second: secondBlock, topVal: topBlockVal, secondVal: secondBlockVal } = topTwo(blockScores);
    const { top: topFunc, second: secondFunc, topVal: topFuncVal, secondVal: secondFuncVal } = topTwo(functionVotes);

    const blockTotal = Object.values(blockScores).reduce((a, b) => a + b, 0) || 1;
    const confidence = Math.max(0, Math.min(100, ((topBlockVal - secondBlockVal) / blockTotal) * 100));

    const profile = {
      type: topFunc && secondFunc ? `${topFunc}-${secondFunc}` : (topBlock ?? 'Unknown'),
      base: topBlock,
      creative: secondBlock,
      confidence,
      tag_scores: tagScores,
      block_scores: blockScores,
      function_votes: functionVotes,
      social_desirability_index: sdCount ? sdSum / sdCount : null,
      inconsistency_flags: inconsistencyFlags,
    } as const;

    return new Response(JSON.stringify({ status: 'success', profile }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('score_prism error', err);
    return new Response(JSON.stringify({ status: 'error', error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
