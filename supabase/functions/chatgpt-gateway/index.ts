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
    // Normalize path for both domains:
    // - https://<proj>.supabase.co/functions/v1/chatgpt-gateway/...
    // - https://<proj>.functions.supabase.co/chatgpt-gateway/...
    let path = url.pathname;
    path = path.replace('/functions/v1/chatgpt-gateway', '').replace('/chatgpt-gateway', '') || '/';
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
          .maybeSingle();

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
        try {
          const { data, error } = await supabase
            .from('v_quality')
            .select('*')
            .order('session_id')
            .limit(1000);

          if (error) throw error;
          
          return new Response(JSON.stringify({ data, source: 'v_quality' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (e) {
          console.warn('v_quality unavailable, falling back to v_kpi_quality:', e?.message || e);
          const { data, error } = await supabase
            .from('v_kpi_quality')
            .select('*')
            .limit(1);

          if (error) throw error;
          
          return new Response(JSON.stringify({ data, source: 'v_kpi_quality' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
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

      // PUT /config - Bulk update scoring configuration
      case path === '/config' && method === 'PUT': {
        let body: any = null;
        try {
          body = await req.json();
        } catch (_) {
          return new Response(JSON.stringify({ error: "Invalid JSON body. Send an object: { \"key\": value, ... }" }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return new Response(JSON.stringify({ error: "Body must be a JSON object of key: value pairs" }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const nowIso = new Date().toISOString();
        const rows = Object.entries(body).map(([k, v]) => ({ key: k, value: v, updated_at: nowIso }));

        if (rows.length === 0) {
          return new Response(JSON.stringify({ error: "No keys provided" }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('scoring_config')
          .upsert(rows)
          .select();

        if (error) throw error;

        console.log(`Bulk updated scoring config keys: ${rows.map(r => r.key).join(', ')}`);
        return new Response(JSON.stringify({ data, updated: rows.map(r => r.key) }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT|POST /config-set/:key/:value - Update single configuration via URL (no body)
      case path.startsWith('/config-set/') && (method === 'PUT' || method === 'POST'): {
        const parts = path.split('/').filter(Boolean); // ['config-set', ':key', ':value']
        const key = decodeURIComponent(parts[1] || '');
        const raw = decodeURIComponent(parts[2] || '');

        if (!key || raw === undefined || raw === '') {
          return new Response(JSON.stringify({ 
            error: "Provide key and value in URL: /config-set/:key/:value",
            example: "/config-set/flag_duration_threshold_minutes/60"
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let value: any = raw;
        // Coerce common primitives
        if (raw === 'null') value = null;
        else if (raw === 'true' || raw === 'false') value = raw === 'true';
        else if (!Number.isNaN(Number(raw)) && raw.trim() !== '') value = Number(raw);
        else {
          // Try JSON if looks like an object/array
          if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
            try { value = JSON.parse(raw); } catch (_) { /* keep as string */ }
          }
        }

        const { data, error } = await supabase
          .from('scoring_config')
          .upsert({ key, value, updated_at: new Date().toISOString() })
          .select()
          .single();

        if (error) throw error;
        console.log(`URL-set scoring config: ${key}=${JSON.stringify(value)}`);
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /config/:key - Fetch single scoring configuration
      case path.startsWith('/config/') && method === 'GET': {
        const key = decodeURIComponent(path.replace('/config/', ''));
        if (!key) {
          return new Response(JSON.stringify({ error: 'Missing key in path' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const { data, error } = await supabase
          .from('scoring_config')
          .select('*')
          .eq('key', key)
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /config/:key - Update single scoring configuration
      case path.startsWith('/config/') && method === 'PUT': {
        const key = decodeURIComponent(path.replace('/config/', ''));

        // Accept both { value: ... } and raw JSON values (e.g., 60, "on", true)
        let value: any = undefined;
        let parsed: any = undefined;
        let textBody = '';
        try {
          textBody = await req.text();
          parsed = textBody ? JSON.parse(textBody) : undefined;
        } catch (_) {
          parsed = undefined;
        }

        if (parsed !== undefined) {
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.prototype.hasOwnProperty.call(parsed, 'value')) {
            value = parsed.value;
          } else {
            // If a JSON primitive or object without "value" was sent, store it directly
            value = parsed;
          }
        }

        if (!key || value === undefined) {
          return new Response(JSON.stringify({ 
            error: "Missing 'value'. Send either { \"value\": ... } or a raw JSON value in the body.",
            example_single: { value: 60 },
          }), {
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
            'GET /quality': 'Quality metrics (v_quality or fallback to v_kpi_quality)',
            'GET /config': 'Get all scoring configuration',
            'GET /config/:key': 'Get a single scoring configuration key',
            'PUT /config': 'Bulk update scoring configuration (JSON object of key:value)',
            'PUT /config/:key': 'Update a single scoring configuration key from JSON body',
            'PUT|POST /config-set/:key/:value': 'Update a single key via URL (accepts numeric, boolean, null, JSON)',
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