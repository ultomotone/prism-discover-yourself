import { createClient } from "npm:@supabase/supabase-js@2.39.7";

interface RequestParams {
  sessionId: string;
  shareToken?: string | null;
}

Deno.serve(async (req: Request) => {
  try {
    // CORS headers for browser requests
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    // Create Supabase client using environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { sessionId, shareToken } = (await req.json()) as RequestParams;

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { headers, status: 400 }
      );
    }

    // Get the session data
    const { data: session, error: sessionError } = await supabase
      .from("prism_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve session data" }),
        { headers, status: 500 }
      );
    }

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { headers, status: 404 }
      );
    }

    // Check if share token is required and valid
    if (session.requires_share_token && shareToken !== session.share_token) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing share token" }),
        { headers, status: 403 }
      );
    }

    // Get the profile data
    const { data: profile, error: profileError } = await supabase
      .from("prism_profiles")
      .select("*")
      .eq("id", session.profile_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve profile data" }),
        { headers, status: 500 }
      );
    }

    // Get answers if needed
    const { data: answers, error: answersError } = await supabase
      .from("prism_answers")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_id", { ascending: true });

    if (answersError) {
      console.error("Error fetching answers:", answersError);
      // Continue without answers, not critical
    }

    // Return the combined data
    return new Response(
      JSON.stringify({
        session,
        profile,
        answers: answers || [],
      }),
      { headers, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
