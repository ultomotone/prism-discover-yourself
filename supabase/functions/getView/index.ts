import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ViewRequest {
  view_name: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
}

// Whitelist of allowed views for security
const ALLOWED_VIEWS = {
  'questions': 'assessment_questions_view',
  'profiles': 'v_profiles_ext',
  'kpi_metrics': 'v_kpi_metrics_v11',
  'latest_assessments': 'v_latest_assessments_v11',
  'quality': 'v_quality',
  'recent_assessments': 'v_recent_assessments_safe',
  'item_stats': 'v_item_stats'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { view_name, limit = 1000, offset = 0, filters }: ViewRequest = await req.json();

    if (!view_name) {
      return new Response(
        JSON.stringify({ error: 'view_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security: check if view is allowed
    const actualViewName = ALLOWED_VIEWS[view_name as keyof typeof ALLOWED_VIEWS];
    if (!actualViewName) {
      return new Response(
        JSON.stringify({ 
          error: `View '${view_name}' not allowed. Allowed views: ${Object.keys(ALLOWED_VIEWS).join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`getView called for: ${view_name} -> ${actualViewName}`);

    // Build query
    let query = supabaseClient
      .from(actualViewName)
      .select('*', { count: 'exact', head: false })
      .range(offset, offset + limit - 1);

    // Apply basic filters if provided (simple equality only for security)
    if (filters && typeof filters === 'object') {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(`Error fetching view ${actualViewName}:`, error);
      return new Response(
        JSON.stringify({ error: `Failed to fetch view: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        view_name,
        data,
        count: count || data?.length || 0,
        limit,
        offset,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in getView function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});