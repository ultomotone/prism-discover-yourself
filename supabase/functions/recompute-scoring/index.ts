import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecomputeRequest {
  sessionId?: string;
  userId?: string;
}

interface RecomputeResponse {
  ok: boolean;
  updatedCount: number;
  sessionId?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Recompute scoring request received');
    
    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sessionId, userId } = await req.json() as RecomputeRequest;

    if (!sessionId && !userId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Either sessionId or userId required', updatedCount: 0 }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`🎯 Processing recompute for sessionId: ${sessionId}, userId: ${userId}`);

    // Build query for sessions to recompute
    let sessionsQuery = supabaseAdmin
      .from('assessment_sessions')
      .select(`
        id,
        user_id,
        email,
        status,
        completed_questions,
        created_at
      `)
      .eq('status', 'completed');

    if (sessionId) {
      sessionsQuery = sessionsQuery.eq('id', sessionId);
      if (userId) {
        // Cross-check: if both provided, ensure they match
        sessionsQuery = sessionsQuery.eq('user_id', userId);
      }
    } else if (userId) {
      sessionsQuery = sessionsQuery.eq('user_id', userId);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError);
      return new Response(
        JSON.stringify({ ok: false, error: sessionsError.message, updatedCount: 0 }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!sessions || sessions.length === 0) {
      console.log('⚠️ No sessions found for recomputation');
      return new Response(
        JSON.stringify({ ok: true, updatedCount: 0, error: 'No sessions found' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`📊 Found ${sessions.length} sessions to recompute`);

    let updatedCount = 0;
    const results: RecomputeResponse[] = [];

    // Process each session
    for (const session of sessions) {
      try {
        console.log(`🔍 Processing session ${session.id}`);

        // Fetch assessment responses for this session
        const { data: responses, error: responsesError } = await supabaseAdmin
          .from('assessment_responses')
          .select('question_id, answer_value, answer_numeric, created_at')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });

        if (responsesError) {
          console.error(`❌ Error fetching responses for session ${session.id}:`, responsesError);
          continue;
        }

        if (!responses || responses.length < 10) {
          console.log(`⚠️ Insufficient responses for session ${session.id} (${responses?.length || 0})`);
          continue;
        }

        // Compute scores based on responses
        const computedScores = await computeScoresFromResponses(responses, supabaseAdmin);
        
        if (!computedScores) {
          console.log(`⚠️ Could not compute scores for session ${session.id}`);
          continue;
        }

        // Upsert scoring results with retry logic
        const upsertResult = await upsertScoringResults(
          supabaseAdmin,
          session.id,
          session.user_id,
          computedScores
        );

        if (upsertResult.success) {
          updatedCount++;
          console.log(`✅ Updated scores for session ${session.id}`);
        } else {
          console.error(`❌ Failed to upsert scores for session ${session.id}:`, upsertResult.error);
        }

      } catch (sessionError) {
        console.error(`❌ Error processing session ${session.id}:`, sessionError);
        continue;
      }
    }

    const response: RecomputeResponse = {
      ok: true,
      updatedCount,
      sessionId: sessionId || undefined
    };

    console.log(`🎉 Recompute completed: ${updatedCount} sessions updated`);

    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('💥 Recompute scoring error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedCount: 0
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

/**
 * Compute scores from assessment responses
 */
async function computeScoresFromResponses(responses: any[], supabaseAdmin: any) {
  try {
    // Fetch scoring configuration
    const { data: scoringConfig } = await supabaseAdmin
      .from('scoring_config')
      .select('key, value');

    // Simple scoring algorithm (replace with your actual logic)
    const responseCount = responses.length;
    const numericResponses = responses.filter(r => r.answer_numeric !== null);
    const avgScore = numericResponses.length > 0 
      ? numericResponses.reduce((sum, r) => sum + (r.answer_numeric || 0), 0) / numericResponses.length 
      : 3;

    // Determine type code (simplified - replace with your logic)
    const typeCode = determineTypeCode(responses);
    const confidence = determineConfidence(avgScore, responseCount);
    const fitBand = determineFitBand(avgScore);
    const overlay = determineOverlay(responses);

    return {
      type_code: typeCode,
      confidence,
      fit_band: fitBand,
      overlay,
      score_fit_calibrated: Math.round(avgScore * 100) / 100,
      top_types: [
        {
          type: typeCode,
          fit_score: avgScore,
          confidence: confidence
        }
      ],
      dimensions: {
        response_count: responseCount,
        avg_score: avgScore,
        computed_at: new Date().toISOString()
      },
      validity_status: responseCount >= 20 ? 'pass' : 'incomplete',
      results_version: 'v1.2'
    };

  } catch (error) {
    console.error('❌ Error computing scores:', error);
    return null;
  }
}

/**
 * Determine personality type code from responses
 */
function determineTypeCode(responses: any[]): string {
  // Simplified type determination - replace with your actual algorithm
  const types = ['INTJ', 'INFJ', 'INFP', 'INTP', 'ENTJ', 'ENTP', 'ENFJ', 'ENFP', 
                 'ISTJ', 'ISFJ', 'ISFP', 'ISTP', 'ESTJ', 'ESFJ', 'ESFP', 'ESTP'];
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
}

/**
 * Determine confidence level
 */
function determineConfidence(avgScore: number, responseCount: number): string {
  if (responseCount < 20) return 'Low';
  if (avgScore >= 4) return 'High';
  if (avgScore >= 3) return 'Moderate';
  return 'Low';
}

/**
 * Determine fit band
 */
function determineFitBand(avgScore: number): string {
  if (avgScore >= 4) return 'High';
  if (avgScore >= 3) return 'Medium';
  return 'Low';
}

/**
 * Determine overlay
 */
function determineOverlay(responses: any[]): string | null {
  // Simplified overlay determination
  const positiveCount = responses.filter(r => r.answer_numeric && r.answer_numeric > 3).length;
  const totalCount = responses.filter(r => r.answer_numeric !== null).length;
  
  if (totalCount === 0) return null;
  
  const ratio = positiveCount / totalCount;
  if (ratio > 0.6) return '+';
  if (ratio < 0.4) return '–';
  return null;
}

/**
 * Upsert scoring results with exponential retry
 */
async function upsertScoringResults(
  supabaseAdmin: any, 
  sessionId: string, 
  userId: string | null, 
  scores: any,
  retries = 3
): Promise<{ success: boolean; error?: string }> {
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { error } = await supabaseAdmin
        .from('scoring_results')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          ...scores,
          computed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'session_id,user_id,results_version'
        });

      if (error) {
        throw error;
      }

      return { success: true };

    } catch (error) {
      console.error(`❌ Upsert attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}