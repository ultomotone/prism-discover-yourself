import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SessionGroup {
  user_identifier: string;
  sessions: {
    id: string;
    status: string;
    completed_at: string | null;
    started_at: string;
    user_id: string | null;
    email: string | null;
  }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Starting duplicate session cleanup...');

    // Find sessions grouped by user (user_id or email) within last 90 days
    const { data: sessions, error: fetchError } = await supabase
      .from('assessment_sessions')
      .select('id, status, completed_at, started_at, user_id, email')
      .gte('started_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('started_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching sessions:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group sessions by user identifier (user_id or email)
    const sessionGroups: Map<string, SessionGroup> = new Map();
    
    for (const session of sessions || []) {
      const identifier = session.user_id || session.email;
      if (!identifier) continue;

      if (!sessionGroups.has(identifier)) {
        sessionGroups.set(identifier, {
          user_identifier: identifier,
          sessions: []
        });
      }
      sessionGroups.get(identifier)!.sessions.push(session);
    }

    const deletedSessions: string[] = [];
    let processedGroups = 0;

    // Process each user's sessions
    for (const group of sessionGroups.values()) {
      if (group.sessions.length < 2) continue; // Skip if only one session

      // Sort sessions by start date
      group.sessions.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());

      // Find sessions within 30 days of each other
      for (let i = 0; i < group.sessions.length - 1; i++) {
        const currentSession = group.sessions[i];
        const nextSession = group.sessions[i + 1];

        const daysDiff = (new Date(nextSession.started_at).getTime() - new Date(currentSession.started_at).getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 30) {
          console.log(`📅 Found sessions within 30 days for ${group.user_identifier}: ${daysDiff.toFixed(1)} days apart`);
          
          let sessionToDelete: string | null = null;

          // Apply deletion logic
          if (currentSession.status === 'completed' && nextSession.status === 'completed') {
            // Both completed: delete the second (keep first)
            sessionToDelete = nextSession.id;
            console.log(`🔄 Both completed: keeping first session ${currentSession.id}, deleting ${nextSession.id}`);
          } else if (currentSession.status !== 'completed' && nextSession.status === 'completed') {
            // First incomplete, second completed: delete first (keep completed)
            sessionToDelete = currentSession.id;
            console.log(`✅ First incomplete, second completed: deleting first ${currentSession.id}, keeping ${nextSession.id}`);
          } else if (currentSession.status === 'completed' && nextSession.status !== 'completed') {
            // First completed, second incomplete: delete second (keep completed)
            sessionToDelete = nextSession.id;
            console.log(`✅ First completed, second incomplete: keeping first ${currentSession.id}, deleting ${nextSession.id}`);
          }

          // Delete the identified session
          if (sessionToDelete) {
            const { error: deleteError } = await supabase.rpc('delete_specific_session', {
              p_session_id: sessionToDelete
            });

            if (deleteError) {
              console.error(`❌ Failed to delete session ${sessionToDelete}:`, deleteError);
            } else {
              deletedSessions.push(sessionToDelete);
              console.log(`🗑️ Successfully deleted session ${sessionToDelete}`);
              
              // Remove deleted session from array to avoid processing it again
              group.sessions = group.sessions.filter(s => s.id !== sessionToDelete);
              
              // Adjust index if we deleted the current session
              if (sessionToDelete === currentSession.id) {
                i--; // Stay at same index since we removed current session
              }
            }
          }
        }
      }
      processedGroups++;
    }

    console.log(`✅ Cleanup completed: processed ${processedGroups} user groups, deleted ${deletedSessions.length} sessions`);

    return new Response(
      JSON.stringify({
        success: true,
        processed_groups: processedGroups,
        deleted_sessions: deletedSessions,
        deleted_count: deletedSessions.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
