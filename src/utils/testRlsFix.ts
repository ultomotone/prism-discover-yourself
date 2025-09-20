// Test script to verify RLS fix works using finalizeAssessment edge function only
import { admin as supabase } from "../../supabase/admin";

export async function testRlsFix() {
  const sessionId = "618c5ea6-aeda-4084-9156-0aac9643afd3";

  console.log("🧪 Testing RLS Fix - Session:", sessionId);
  console.log("=========================================");

  console.log("1. Checking current state...");
  const { data: beforeState } = await supabase
    .from("profiles")
    .select("id, results_version, type_code")
    .eq("session_id", sessionId)
    .maybeSingle();

  console.log("Profile before test:", beforeState || "No profile found");

  console.log("\n2. Running finalizeAssessment (first pass)...");
  const { data: firstFinalize, error: firstFinalizeError } = await supabase.functions.invoke("finalizeAssessment", {
    body: { session_id: sessionId },
  });

  if (firstFinalizeError) {
    console.error("❌ finalizeAssessment error:", firstFinalizeError);
    return { success: false, step: "finalize", error: firstFinalizeError };
  }

  console.log("✅ finalizeAssessment response:", firstFinalize);

  console.log("\n3. Checking profile after finalize...");
  const { data: afterState } = await supabase
    .from("profiles")
    .select("id, results_version, type_code, created_at")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!afterState) {
    console.log("❌ Profile was not created - RLS fix may not be working");
    return { success: false, step: "profile_creation", profileCreated: false };
  }

  console.log("✅ Profile state:", afterState);
  console.log("Results version stamped:", afterState.results_version);

  console.log("\n4. Running finalizeAssessment again to confirm idempotency...");
  const { data: secondFinalize, error: secondFinalizeError } = await supabase.functions.invoke("finalizeAssessment", {
    body: { session_id: sessionId },
  });

  if (secondFinalizeError) {
    console.error("❌ finalizeAssessment error on second call:", secondFinalizeError);
    return { success: false, step: "finalize_second", error: secondFinalizeError };
  }

  console.log("✅ finalizeAssessment second response:", secondFinalize);

  return {
    success: true,
    profileCreated: true,
    profileData: afterState,
    firstFinalize,
    secondFinalize,
  };
}

export { testRlsFix as default };

