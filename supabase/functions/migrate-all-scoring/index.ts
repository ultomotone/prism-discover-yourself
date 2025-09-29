import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🚀 Starting comprehensive scoring migration...')

    // Step 1: Find sessions with 248+ responses that aren't marked complete
    const { data: incompleteSessionsData } = await supabase
      .from('assessment_sessions')
      .select(`
        id,
        completed_questions,
        status,
        email
      `)
      .gte('completed_questions', 248)
      .neq('status', 'completed')

    console.log(`📊 Found ${incompleteSessionsData?.length || 0} sessions to mark as completed`)

    // Step 2: Mark them as completed
    if (incompleteSessionsData && incompleteSessionsData.length > 0) {
      for (const session of incompleteSessionsData) {
        await supabase
          .from('assessment_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id)

        console.log(`✅ Marked session ${session.id} as completed`)
      }
    }

    // Step 3: Find all completed sessions that need current scoring
    const { data: completedSessions } = await supabase
      .from('assessment_sessions')
      .select(`
        id,
        user_id,
        email,
        created_at
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    console.log(`📈 Found ${completedSessions?.length || 0} completed sessions to migrate`)

    // Step 4: Check which ones don't have current scoring (v1.2.1)
    const sessionsToMigrate = []
    if (completedSessions) {
      for (const session of completedSessions) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('results_version')
          .eq('session_id', session.id)
          .single()

        if (!existingProfile || existingProfile.results_version !== 'v1.2.1') {
          sessionsToMigrate.push(session)
        }
      }
    }

    console.log(`🔄 Need to migrate ${sessionsToMigrate.length} sessions to current scoring`)

    // Step 5: Process sessions in batches
    const batchSize = 10
    let processed = 0
    let successful = 0
    let failed = 0

    for (let i = 0; i < sessionsToMigrate.length; i += batchSize) {
      const batch = sessionsToMigrate.slice(i, i + batchSize)
      
      for (const session of batch) {
        try {
          console.log(`Processing session ${session.id}...`)

          // Call the score_prism function for current scoring
          const { error: scoringError } = await supabase.functions.invoke('score_prism', {
            body: { session_id: session.id }
          })

          if (scoringError) {
            console.error(`❌ Scoring error for ${session.id}:`, scoringError)
            failed++
          } else {
            console.log(`✅ Successfully scored session ${session.id}`)
            successful++
          }

          processed++

          // Small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error) {
          console.error(`💥 Error processing session ${session.id}:`, error)
          failed++
          processed++
        }
      }

      // Log progress
      console.log(`Progress: ${processed}/${sessionsToMigrate.length} sessions processed (${successful} successful, ${failed} failed)`)
      
      // Longer delay between batches
      if (i + batchSize < sessionsToMigrate.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Step 6: Update dashboard statistics
    await supabase.rpc('update_dashboard_statistics')

    const result = {
      success: true,
      summary: {
        sessions_marked_complete: incompleteSessionsData?.length || 0,
        total_completed_sessions: completedSessions?.length || 0,
        sessions_migrated: sessionsToMigrate.length,
        successful_migrations: successful,
        failed_migrations: failed
      },
      message: `Migration complete! ${successful} sessions now have current scoring.`
    }

    console.log('🎉 Migration completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('💥 Migration failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        message: 'Migration failed - check logs for details'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})