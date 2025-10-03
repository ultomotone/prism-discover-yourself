import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Answer {
  item_code: string;
  value_numeric?: number;
  value_text?: string;
}

interface SubmitPayload {
  assessment_session_id: string;
  version: string;
  answers: Answer[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SubmitPayload = await req.json();
    const { assessment_session_id, version, answers } = payload;

    console.log(`[post-survey-submit] Processing submission for session: ${assessment_session_id}`);

    if (!assessment_session_id || !version || !answers) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user_id from auth header if available
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id || null;
      } catch (e) {
        console.log('[post-survey-submit] No authenticated user');
      }
    }

    // Validate answers against question metadata
    const { data: questions, error: questionsError } = await supabase
      .from('post_survey_questions')
      .select('item_code, response_type, required')
      .eq('version', version);

    if (questionsError) {
      console.error('[post-survey-submit] Error fetching questions:', questionsError);
      throw questionsError;
    }

    // Validate each answer
    for (const answer of answers) {
      const question = questions?.find(q => q.item_code === answer.item_code);
      if (!question) continue;

      // Validate Likert scale (1-5)
      if (question.response_type === 'LIKERT_5' && answer.value_numeric) {
        if (answer.value_numeric < 1 || answer.value_numeric > 5) {
          return new Response(
            JSON.stringify({ error: `Invalid Likert value for ${answer.item_code}: must be 1-5` }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
      }

      // Validate NPS (0-10)
      if (question.response_type === 'NPS_0_10' && answer.value_numeric !== undefined) {
        if (answer.value_numeric < 0 || answer.value_numeric > 10) {
          return new Response(
            JSON.stringify({ error: `Invalid NPS value for ${answer.item_code}: must be 0-10` }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
      }

      // Validate Boolean (0 or 1)
      if (question.response_type === 'BOOLEAN' && answer.value_numeric !== undefined) {
        if (answer.value_numeric !== 0 && answer.value_numeric !== 1) {
          return new Response(
            JSON.stringify({ error: `Invalid boolean value for ${answer.item_code}: must be 0 or 1` }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
      }

      // Validate text length
      if (question.response_type === 'TEXT' && answer.value_text) {
        if (answer.value_text.length > 4000) {
          return new Response(
            JSON.stringify({ error: `Text too long for ${answer.item_code}: max 4000 characters` }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }
      }
    }

    // Create post_survey_sessions record
    const sessionId = crypto.randomUUID();
    const { error: sessionError } = await supabase
      .from('post_survey_sessions')
      .upsert({
        id: sessionId,
        assessment_session_id,
        version,
        user_id: userId,
        started_at: new Date().toISOString(),
      }, {
        onConflict: 'assessment_session_id'
      });

    if (sessionError) {
      console.error('[post-survey-submit] Error creating session:', sessionError);
      throw sessionError;
    }

    // Get the actual session_id (in case of conflict)
    const { data: sessionData } = await supabase
      .from('post_survey_sessions')
      .select('id')
      .eq('assessment_session_id', assessment_session_id)
      .single();

    const actualSessionId = sessionData?.id || sessionId;

    // Upsert responses
    const responsesToInsert = answers.map(answer => ({
      session_id: actualSessionId,
      item_code: answer.item_code,
      value_numeric: answer.value_numeric || null,
      value_text: answer.value_text || null,
    }));

    const { error: responsesError } = await supabase
      .from('post_survey_responses')
      .upsert(responsesToInsert, {
        onConflict: 'session_id,item_code'
      });

    if (responsesError) {
      console.error('[post-survey-submit] Error inserting responses:', responsesError);
      throw responsesError;
    }

    // Call compute_post_survey_score function
    const { error: computeError } = await supabase.rpc('compute_post_survey_score', {
      p_session: actualSessionId
    });

    if (computeError) {
      console.error('[post-survey-submit] Error computing scores:', computeError);
      throw computeError;
    }

    // Fetch computed scores
    const { data: scores, error: scoresError } = await supabase
      .from('post_survey_scores')
      .select('*')
      .eq('session_id', actualSessionId)
      .single();

    if (scoresError) {
      console.error('[post-survey-submit] Error fetching scores:', scoresError);
      throw scoresError;
    }

    console.log('[post-survey-submit] Successfully processed submission');

    return new Response(
      JSON.stringify({
        success: true,
        session_id: actualSessionId,
        scores,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[post-survey-submit] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
