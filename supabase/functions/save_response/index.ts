// @ts-nocheck
import { createServiceClient } from "../_shared/supabaseClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();

    const body = await req.json();

    // Accept a flexible payload matching assessment_responses schema
    const {
      session_id,
      question_id,
      // Optional but typically provided
      question_text,
      question_type,
      question_section,
      response_time_ms,
      // Possible answer representations
      answer_value,
      answer_numeric,
      answer_array,
      answer_object,
      // Optional extras
      value_coded,
      pair_group,
      section_id,
      valid_bool,
    } = body || {};

    if (!session_id || !question_id) {
      return new Response(
        JSON.stringify({ error: "session_id and question_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic session sanity check
    const { data: session, error: sErr } = await supabase
      .from("assessment_sessions")
      .select("id, status")
      .eq("id", session_id)
      .maybeSingle();

    if (sErr || !session) {
      return new Response(JSON.stringify({ error: "Invalid session_id" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build upsert payload
    const upsertPayload: any = {
      session_id,
      question_id,
    };

    if (question_text) upsertPayload.question_text = question_text;
    if (question_type) upsertPayload.question_type = question_type;
    if (question_section) upsertPayload.question_section = question_section;
    if (response_time_ms !== undefined) upsertPayload.response_time_ms = response_time_ms;

    if (answer_value !== undefined) upsertPayload.answer_value = String(answer_value);
    if (answer_numeric !== undefined) upsertPayload.answer_numeric = answer_numeric;
    if (answer_array !== undefined) upsertPayload.answer_array = answer_array;
    if (answer_object !== undefined) upsertPayload.answer_object = answer_object;

    if (value_coded !== undefined) upsertPayload.value_coded = value_coded;
    if (pair_group !== undefined) upsertPayload.pair_group = pair_group;
    if (section_id !== undefined) upsertPayload.section_id = section_id;
    if (valid_bool !== undefined) upsertPayload.valid_bool = valid_bool;

    const { error: upErr } = await supabase
      .from("assessment_responses")
      .upsert(upsertPayload, { onConflict: "session_id,question_id" });

    if (upErr) {
      console.error("save_response upsert error:", upErr);
      return new Response(JSON.stringify({ error: upErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("save_response fatal:", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
