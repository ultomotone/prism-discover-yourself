import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupRequest {
  dry_run?: boolean;
  user_id?: string;
  email?: string;
}

interface DuplicateSession {
  id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  completed_questions: number;
  total_questions: number;
  email?: string;
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json() as CleanupRequest;
    const { dry_run = true, user_id, email } = body;

    console.log('Starting duplicate session cleanup:', { dry_run, user_id, email });

    // Find duplicate sessions
    let query = supabase
      .from('assessment_sessions')
      .select('id, status, started_at, completed_at, completed_questions, total_questions, email, user_id')
      .eq('status', 'in_progress');

    // Filter by specific user if provided
    if (user_id) {
      query = query.eq('user_id', user_id);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data: sessions, error } = await query.order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No sessions found',
        duplicates_found: 0,
        sessions_cleaned: 0
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Group sessions by user (user_id or email)
    const userGroups = new Map<string, DuplicateSession[]>();
    
    for (const session of sessions) {
      const sessionTyped = session as DuplicateSession;
      const identifier = sessionTyped.user_id || sessionTyped.email || 'anonymous';
      
      if (!userGroups.has(identifier)) {
        userGroups.set(identifier, []);
      }
      userGroups.get(identifier)!.push(sessionTyped);
    }

    // Find users with multiple sessions
    const duplicateGroups = Array.from(userGroups.entries())
      .filter(([_, sessions]) => sessions.length > 1);

    console.log(`Found ${duplicateGroups.length} users with duplicate sessions`);

    const cleanupResults = [];
    let totalCleaned = 0;

    for (const [identifier, userSessions] of duplicateGroups) {
      // Sort sessions to find the best one to keep
      const sortedSessions = userSessions.sort((a, b) => {
        // Prioritize by completed questions (higher is better)
        if (a.completed_questions !== b.completed_questions) {
          return b.completed_questions - a.completed_questions;
        }
        // Then by most recent started_at
        return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
      });

      const keepSession = sortedSessions[0];
      const sessionsToRemove = sortedSessions.slice(1);

      console.log(`User ${identifier}: Keeping session ${keepSession.id} (${keepSession.completed_questions} questions), removing ${sessionsToRemove.length} duplicates`);

      if (!dry_run) {
        // Mark duplicate sessions as abandoned
        const sessionIdsToRemove = sessionsToRemove.map(s => s.id);
        const { error: updateError } = await supabase
          .from('assessment_sessions')
          .update({ status: 'abandoned' })
          .in('id', sessionIdsToRemove);

        if (updateError) {
          console.error(`Failed to update sessions for user ${identifier}:`, updateError);
          continue;
        }
      }

      cleanupResults.push({
        user_identifier: identifier,
        kept_session: {
          id: keepSession.id,
          completed_questions: keepSession.completed_questions,
          started_at: keepSession.started_at
        },
        removed_sessions: sessionsToRemove.map(s => ({
          id: s.id,
          completed_questions: s.completed_questions,
          started_at: s.started_at
        }))
      });

      totalCleaned += sessionsToRemove.length;
    }

    return new Response(JSON.stringify({
      success: true,
      dry_run,
      duplicates_found: duplicateGroups.length,
      sessions_cleaned: totalCleaned,
      cleanup_details: cleanupResults
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in cleanup-duplicate-sessions:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
