import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-store'
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { session_id, share_token } = await req.json()
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ ok: false, reason: 'session_id_required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create service role client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get current user from request
    const authHeader = req.headers.get('Authorization')
    const { data: { user } } = authHeader 
      ? await createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!).auth.getUser(authHeader.replace('Bearer ', ''))
      : { data: { user: null } }

    console.log('getResultsBySession called:', { session_id, has_share_token: !!share_token, user_id: user?.id })

    // Fetch session with service role permissions
    const { data: sessionData, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('id, status, user_id, share_token, completed_at, email')
      .eq('id', session_id)
      .single()

    if (sessionError || !sessionData) {
      console.error('Session fetch failed:', sessionError)
      return new Response(
        JSON.stringify({ ok: false, reason: 'session_not_found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check access permissions
    const isCompleted = sessionData.status === 'completed'
    const isOwner = sessionData.user_id && user?.id === sessionData.user_id
    const hasValidShareToken = share_token && sessionData.share_token === share_token
    
    console.log('Access check:', { 
      isCompleted, 
      isOwner, 
      hasValidShareToken,
      session_status: sessionData.status,
      session_user_id: sessionData.user_id,
      current_user_id: user?.id
    })

    if (!isCompleted && !isOwner && !hasValidShareToken) {
      return new Response(
        JSON.stringify({ ok: false, reason: 'access_denied' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch profile data if session is accessible
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', session_id)
      .single()

    if (profileError || !profileData) {
      console.error('Profile fetch failed:', profileError)
      return new Response(
        JSON.stringify({ ok: false, reason: 'profile_not_found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        session: sessionData, 
        profile: profileData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in getResultsBySession:', error)
    return new Response(
      JSON.stringify({ ok: false, reason: 'internal_error', error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})