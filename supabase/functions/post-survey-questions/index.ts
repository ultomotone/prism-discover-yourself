import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const version = url.searchParams.get('version') || 'psv1.0';

    console.log(`[post-survey-questions] Fetching questions for version: ${version}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch questions for the specified version
    const { data: questions, error } = await supabase
      .from('post_survey_questions')
      .select('item_code, item_text, response_type, position, reverse_scored, required')
      .eq('version', version)
      .order('position', { ascending: true });

    if (error) {
      console.error('[post-survey-questions] Database error:', error);
      throw error;
    }

    console.log(`[post-survey-questions] Retrieved ${questions?.length || 0} questions`);

    return new Response(
      JSON.stringify({ version, questions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[post-survey-questions] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
