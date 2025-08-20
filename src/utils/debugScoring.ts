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

// Auto-run debug on latest session
(async () => {
  const { data: latestProfile } = await supabase
    .from('profiles')
    .select('session_id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (latestProfile) {
    await debugScoreSession(latestProfile.session_id);
  }
})();