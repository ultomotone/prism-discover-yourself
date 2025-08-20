import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-bot-token',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const botToken = req.headers.get('x-bot-token');
    const expectedToken = Deno.env.get('BOT_TOKEN');
    
    if (!botToken || botToken !== expectedToken) {
      console.error('Authentication failed: Invalid or missing bot token');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/chatgpt-gateway', '');
    const method = req.method;

    console.log(`ChatGPT Gateway: ${method} ${path}`);

    // Route handling
    switch (true) {
      // GET /assessments - Latest assessments
      case path === '/assessments' && method === 'GET': {
        const { data, error } = await supabase
          .from('v_latest_assessments_v11')
          .select('*')
          .order('finished_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /kpi - KPI overview
      case path === '/kpi' && method === 'GET': {
        const { data, error } = await supabase
          .from('v_kpi_overview_30d_v11')
          .select('*')
          .single();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /metrics - Detailed metrics
      case path === '/metrics' && method === 'GET': {
        const { data, error } = await supabase
          .from('v_kpi_metrics_v11')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /quality - Quality metrics
      case path === '/quality' && method === 'GET': {
        const { data, error } = await supabase
          .from('v_quality')
          .select('*')
          .order('session_id')
          .limit(1000);

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /config - Scoring configuration
      case path === '/config' && method === 'GET': {
        const { data, error } = await supabase
          .from('scoring_config')
          .select('*')
          .order('key');

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /config/:key - Update scoring configuration
      case path.startsWith('/config/') && method === 'PUT': {
        const key = path.replace('/config/', '');
        const { value } = await req.json();

        if (!key || !value) {
          return new Response(JSON.stringify({ error: 'Missing key or value' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('scoring_config')
          .upsert({ key, value, updated_at: new Date().toISOString() })
          .select()
          .single();

        if (error) throw error;
        
        console.log(`Updated scoring config: ${key}`);
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /recompute - Trigger profile recomputation
      case path === '/recompute' && method === 'POST': {
        const { data, error } = await supabase.functions.invoke('recompute_profiles_v11');

        if (error) {
          console.error('Recompute error:', error);
          throw error;
        }
        
        console.log('Triggered recompute_profiles_v11');
        return new Response(JSON.stringify({ 
          message: 'Recompute triggered successfully',
          data 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /profiles - Recent profiles for analysis
      case path === '/profiles' && method === 'GET': {
        const limit = url.searchParams.get('limit') || '50';
        
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            session_id,
            created_at,
            type_code,
            overlay,
            confidence,
            fit_band,
            score_fit_calibrated,
            score_fit_raw,
            top_gap,
            results_version,
            invalid_combo_flag
          `)
          .eq('results_version', 'v1.1')
          .order('created_at', { ascending: false })
          .limit(parseInt(limit));

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /country-stats - Country activity statistics
      case path === '/country-stats' && method === 'GET': {
        const { data, error } = await supabase
          .from('v_activity_country_30d')
          .select('*')
          .order('sessions', { ascending: false })
          .limit(50);

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Default: List available endpoints
      default: {
        const endpoints = {
          message: 'ChatGPT Gateway API',
          available_endpoints: {
            'GET /assessments': 'Latest assessments from v_latest_assessments_v11',
            'GET /kpi': 'KPI overview from v_kpi_overview_30d_v11',
            'GET /metrics': 'Detailed metrics from v_kpi_metrics_v11',
            'GET /quality': 'Quality metrics from v_quality',
            'GET /config': 'Get all scoring configuration',
            'PUT /config/:key': 'Update scoring configuration key',
            'POST /recompute': 'Trigger profile recomputation',
            'GET /profiles': 'Recent profiles (add ?limit=N to control count)',
            'GET /country-stats': 'Country activity statistics'
          },
          authentication: 'Include x-bot-token header with your bot token'
        };

        return new Response(JSON.stringify(endpoints), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

  } catch (error) {
    console.error('ChatGPT Gateway error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});