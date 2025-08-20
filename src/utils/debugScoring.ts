import { supabase } from "@/integrations/supabase/client";

export async function debugScoreSession(sessionId: string) {
  console.log(`Debugging session: ${sessionId}`);
  
  const { data, error } = await supabase.functions.invoke('score_prism', {
    body: { session_id: sessionId, debug: true }
  });

  if (error) {
    console.error('Debug scoring error:', error);
    return { error };
  }

  console.log('Debug scoring result:', JSON.stringify(data, null, 2));
  return data;
}

// Removed auto-run to prevent loading issues