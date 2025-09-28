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
  'item_stats': 'v_item_stats',
  'v_kpi_overview_30d_v11': 'v_kpi_overview_30d_v11',
  'v_kpi_quality': 'v_kpi_quality',
  'v_conf_dist': 'v_conf_dist',
  'v_overlay_conf': 'v_overlay_conf',
  'v_kpi_throughput': 'v_kpi_throughput',
  'v_sessions': 'v_profiles_ext',
  'v_fit_ranks': 'v_fit_ranks',
  'v_fc_coverage': 'v_fc_coverage',
  'v_share_entropy': 'v_fc_analytics',
  'v_dim_coverage': 'v_dim_coverage',
  'v_section_times': 'v_section_times'
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

    // Apply filters if provided
    if (filters && typeof filters === 'object') {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined && value !== 'all') {
          // Handle date range filters
          if (key === 'dateRange' && typeof value === 'object' && value.from && value.to) {
            const fromDate = new Date(value.from).toISOString();
            const toDate   = new Date(value.to).toISOString();

            // Map views to their date/timestamp column. If none, skip filtering to avoid 42703 errors.
            const dateColMap: Record<string, string> = {
              'v_kpi_throughput': 'd',
              'v_latest_assessments_v11': 'finished_at',
              'v_profiles_ext': 'created_at',
              'v_kpi_metrics_v11': 'created_at',
              'v_overlay_invariance': 'created_at'
            };
            const dateCol = dateColMap[actualViewName];
            if (dateCol) {
              query = query.gte(dateCol, fromDate).lte(dateCol, toDate);
            } else {
              console.log(`no_date_column_for_view:${actualViewName}, skipping dateRange filter`);
            }
          } else if (typeof value === 'string' && value !== 'all') {
            // Simple equality filter for non-'all' values
            query = query.eq(key, value);
          }
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
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        } 
      }
    );

  } catch (error) {
    console.error('Error in getView function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});