import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { session_id } = await req.json();
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get count of answered questions for this session
    const { count: answeredCount, error: answeredError } = await supabase
      .from("assessment_responses")
      .select("question_id", { count: "exact", head: true })
      .eq("session_id", session_id);

    if (answeredError) {
      console.error("Error getting answered count:", answeredError);
      throw answeredError;
    }

    // Get total questions from assessment_questions
    const { count: totalCount, error: totalError } = await supabase
      .from("assessment_questions")
      .select("id", { count: "exact", head: true });

    if (totalError) {
      console.error("Error getting total count:", totalError);
      throw totalError;
    }

    // Also get the actual responses for the frontend
    const { data: responses, error: responsesError } = await supabase
      .from("assessment_responses")
      .select("question_id, answer_value, answer_numeric, answer_array")
      .eq("session_id", session_id)
      .order("question_id");

    if (responsesError) {
      console.error("Error getting responses:", responsesError);
      throw responsesError;
    }

    return new Response(
      JSON.stringify({
        status: "success",
        answered: answeredCount ?? 0,
        total: totalCount ?? 0,
        responses: responses || []
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (e) {
    console.error("get_progress error:", e);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        error: String(e?.message || e) 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});