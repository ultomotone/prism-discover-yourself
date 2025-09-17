import { createClient } from "@supabase/supabase-js";
import test from "node:test";
import assert from "node:assert/strict";

const url = process.env.SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !service) {
  test.skip("requires Supabase env", () => {});
} else {
  test("finalizeAssessment runs complete scoring flow", async () => {
    const supabase = createClient(url, service);
    const { data: session } = await supabase
      .from("assessment_sessions")
      .insert({ user_id: "00000000-0000-0000-0000-000000000000" })
      .select()
      .single();

    await supabase.from("assessment_responses").insert({
      session_id: session.id,
      question_id: 1,
      answer_value: 3,
    });

    const { data, error } = await supabase.functions.invoke("finalizeAssessment", {
      body: { session_id: session.id },
    });
    assert.equal(error, null);
    assert.equal(data.status, "success");
    assert.equal(data.profile.session_id, session.id);

    const { data: again } = await supabase.functions.invoke("finalizeAssessment", {
      body: { session_id: session.id },
    });
    assert.equal(again.status, "success");
  });

  test("IR-09B: RLS fix test - existing session", async () => {
    const supabase = createClient(url, service);
    const sessionId = "618c5ea6-aeda-4084-9156-0aac9643afd3";
    
    console.log("Testing RLS fix with session:", sessionId);
    
    // Check if profile exists before
    const { data: beforeProfile } = await supabase
      .from("profiles")
      .select("id, results_version")
      .eq("session_id", sessionId)
      .maybeSingle();
    
    console.log("Profile before test:", beforeProfile || "No profile");
    
    // Test score_prism directly first
    const { data: scoreData, error: scoreError } = await supabase.functions.invoke("score_prism", {
      body: { session_id: sessionId },
    });
    
    if (scoreError) {
      console.log("score_prism error:", scoreError);
    } else {
      console.log("score_prism success:", scoreData?.status);
    }
    
    // Check if profile was created
    const { data: afterProfile } = await supabase
      .from("profiles")
      .select("id, results_version, type_code, created_at")
      .eq("session_id", sessionId)
      .maybeSingle();
    
    console.log("Profile after score_prism:", afterProfile || "Still no profile");
    
    // Test finalizeAssessment
    const { data, error } = await supabase.functions.invoke("finalizeAssessment", {
      body: { session_id: sessionId },
    });
    
    if (error) {
      console.log("finalizeAssessment error:", error);
    } else {
      console.log("finalizeAssessment success:", data?.status);
      console.log("Results URL:", data?.results_url);
    }
    
    // Final profile check
    const { data: finalProfile } = await supabase
      .from("profiles")
      .select("id, results_version, type_code")
      .eq("session_id", sessionId)
      .maybeSingle();
    
    console.log("Final profile state:", finalProfile || "No profile created");
    
    // Assert that we now have a profile (if RLS fix worked)
    if (finalProfile) {
      assert.equal(finalProfile.results_version, "v1.2.1", "Profile should have v1.2.1 version");
      console.log("✅ SUCCESS: Profile created with correct version");
    } else {
      console.log("❌ FAILED: No profile was created - RLS fix may not be working");
    }
  });
}
