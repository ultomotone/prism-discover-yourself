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
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        
        const { data, error } = await supabase
          .from('v_latest_assessments_v11')
          .select('*')
          .order('finished_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PROFILES CRUD
      // GET /profiles - All profiles with pagination
      case path === '/profiles' && method === 'GET': {
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /profiles - Create profile
      case path === '/profiles' && method === 'POST': {
        const body = await req.json();
        const { data, error } = await supabase
          .from('profiles')
          .insert(body)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /profiles/:id - Update profile
      case path.startsWith('/profiles/') && method === 'PUT': {
        const id = path.replace('/profiles/', '');
        const body = await req.json();
        const { data, error } = await supabase
          .from('profiles')
          .update(body)
          .eq('id', id)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DELETE /profiles/:id - Delete profile
      case path.startsWith('/profiles/') && method === 'DELETE': {
        const id = path.replace('/profiles/', '');
        const { data, error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ASSESSMENT SESSIONS CRUD
      // GET /sessions - All sessions with pagination
      case path === '/sessions' && method === 'GET': {
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        
        const { data, error } = await supabase
          .from('assessment_sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /sessions - Create session
      case path === '/sessions' && method === 'POST': {
        const body = await req.json();
        const { data, error } = await supabase
          .from('assessment_sessions')
          .insert(body)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /sessions/:id - Update session
      case path.startsWith('/sessions/') && method === 'PUT': {
        const id = path.replace('/sessions/', '');
        const body = await req.json();
        const { data, error } = await supabase
          .from('assessment_sessions')
          .update(body)
          .eq('id', id)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DELETE /sessions/:id - Delete session
      case path.startsWith('/sessions/') && method === 'DELETE': {
        const id = path.replace('/sessions/', '');
        const { data, error } = await supabase
          .from('assessment_sessions')
          .delete()
          .eq('id', id)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ASSESSMENT RESPONSES CRUD
      // GET /responses - All responses with pagination
      case path === '/responses' && method === 'GET': {
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const sessionId = url.searchParams.get('session_id');
        
        let query = supabase
          .from('assessment_responses')
          .select('*')
          .order('created_at', { ascending: false });

        if (sessionId) {
          query = query.eq('session_id', sessionId);
        }

        const { data, error } = await query.range(offset, offset + limit - 1);

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /responses - Create response
      case path === '/responses' && method === 'POST': {
        const body = await req.json();
        const { data, error } = await supabase
          .from('assessment_responses')
          .insert(body)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /responses/:id - Update response
      case path.startsWith('/responses/') && method === 'PUT': {
        const id = path.replace('/responses/', '');
        const body = await req.json();
        const { data, error } = await supabase
          .from('assessment_responses')
          .update(body)
          .eq('id', id)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DELETE /responses/:id - Delete response
      case path.startsWith('/responses/') && method === 'DELETE': {
        const id = path.replace('/responses/', '');
        const { data, error } = await supabase
          .from('assessment_responses')
          .delete()
          .eq('id', id)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ASSESSMENT SCORING KEY CRUD
      // GET /scoring-key - All scoring keys
      case path === '/scoring-key' && method === 'GET': {
        const { data, error } = await supabase
          .from('assessment_scoring_key')
          .select('*')
          .order('question_id');

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /scoring-key - Create scoring key
      case path === '/scoring-key' && method === 'POST': {
        const body = await req.json();
        const { data, error } = await supabase
          .from('assessment_scoring_key')
          .insert(body)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /scoring-key/:id - Update scoring key
      case path.startsWith('/scoring-key/') && method === 'PUT': {
        const questionId = path.replace('/scoring-key/', '');
        const body = await req.json();
        const { data, error } = await supabase
          .from('assessment_scoring_key')
          .update(body)
          .eq('question_id', questionId)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // KB DEFINITIONS CRUD
      // GET /kb-definitions - All KB definitions
      case path === '/kb-definitions' && method === 'GET': {
        const { data, error } = await supabase
          .from('kb_definitions')
          .select('*')
          .order('key');

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /kb-definitions - Create KB definition
      case path === '/kb-definitions' && method === 'POST': {
        const body = await req.json();
        const { data, error } = await supabase
          .from('kb_definitions')
          .insert(body)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /kb-definitions/:key - Update KB definition
      case path.startsWith('/kb-definitions/') && method === 'PUT': {
        const key = decodeURIComponent(path.replace('/kb-definitions/', ''));
        const body = await req.json();
        const { data, error } = await supabase
          .from('kb_definitions')
          .update(body)
          .eq('key', key)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DELETE /kb-definitions/:key - Delete KB definition
      case path.startsWith('/kb-definitions/') && method === 'DELETE': {
        const key = decodeURIComponent(path.replace('/kb-definitions/', ''));
        const { data, error } = await supabase
          .from('kb_definitions')
          .delete()
          .eq('key', key)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // KB TYPES CRUD
      // GET /kb-types - All KB types
      case path === '/kb-types' && method === 'GET': {
        const { data, error } = await supabase
          .from('kb_types')
          .select('*')
          .order('code');

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /kb-types - Create KB type
      case path === '/kb-types' && method === 'POST': {
        const body = await req.json();
        const { data, error } = await supabase
          .from('kb_types')
          .insert(body)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /kb-types/:code - Update KB type
      case path.startsWith('/kb-types/') && method === 'PUT': {
        const code = path.replace('/kb-types/', '');
        const body = await req.json();
        const { data, error } = await supabase
          .from('kb_types')
          .update(body)
          .eq('code', code)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DELETE /kb-types/:code - Delete KB type
      case path.startsWith('/kb-types/') && method === 'DELETE': {
        const code = path.replace('/kb-types/', '');
        const { data, error } = await supabase
          .from('kb_types')
          .delete()
          .eq('code', code)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DASHBOARD STATISTICS CRUD
      // GET /dashboard-stats - All dashboard statistics
      case path === '/dashboard-stats' && method === 'GET': {
        const { data, error } = await supabase
          .from('dashboard_statistics')
          .select('*')
          .order('stat_date', { ascending: false });

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /dashboard-stats - Create dashboard statistic
      case path === '/dashboard-stats' && method === 'POST': {
        const body = await req.json();
        const { data, error } = await supabase
          .from('dashboard_statistics')
          .insert(body)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // PUT /dashboard-stats/:id - Update dashboard statistic
      case path.startsWith('/dashboard-stats/') && method === 'PUT': {
        const id = path.replace('/dashboard-stats/', '');
        const body = await req.json();
        const { data, error } = await supabase
          .from('dashboard_statistics')
          .update(body)
          .eq('id', id)
          .select();

        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ALL VIEWS ACCESS
      // GET /views/:view_name - Access any view
      case path.startsWith('/views/') && method === 'GET': {
        const viewName = path.replace('/views/', '');
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        
        const { data, error } = await supabase
          .from(viewName)
          .select('*')
          .range(offset, offset + limit - 1);

        if (error) throw error;
        
        return new Response(JSON.stringify({ data, view: viewName }), {
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

      // GET /quality - Quality metrics summary for dashboard cards
      case path === '/quality' && method === 'GET': {
        const { data, error } = await supabase
          .from('v_quality_summary')
          .select('*')
          .maybeSingle();
        
        if (error) {
          console.warn('v_quality_summary unavailable, falling back to v_kpi_quality:', error.message);
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('v_kpi_quality')
            .select('*')
            .maybeSingle();
          if (fallbackError) throw fallbackError;
          return new Response(JSON.stringify({ summary: fallbackData, source: 'v_kpi_quality' }), { headers });
        }
        
        return new Response(JSON.stringify({ 
          summary: data, 
          source: 'v_quality_summary' 
        }), { headers });
      }

      // GET /types - Type distribution for dashboard  
      case path === '/types' && method === 'GET': {
        const { data, error } = await supabase
          .from('v_type_distribution')
          .select('*');
        
        if (error) throw error;
        
        return new Response(JSON.stringify({ data }), { headers });
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
        const { data, error } = await supabase.functions.invoke('recompute-profiles');

        if (error) {
          console.error('Recompute error:', error);
          throw error;
        }
        
        console.log('Triggered recompute-profiles');
        return new Response(JSON.stringify({ 
          message: 'Recompute triggered successfully',
          data 
        }), {
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
          message: 'ChatGPT Gateway API - Full CRUD Access',
          core_endpoints: {
            'GET /assessments': 'Latest assessments (pagination: ?limit=100&offset=0)',
            'GET /kpi': 'KPI overview from v_kpi_overview_30d_v11',
            'GET /metrics': 'Detailed metrics from v_kpi_metrics_v11',
            'GET /quality': 'Quality metrics (v_quality or fallback to v_kpi_quality)',
            'POST /recompute': 'Trigger profile recomputation',
            'GET /country-stats': 'Country activity statistics'
          },
          profiles_crud: {
            'GET /profiles': 'All profiles (pagination: ?limit=100&offset=0)',
            'POST /profiles': 'Create new profile',
            'PUT /profiles/:id': 'Update profile by ID',
            'DELETE /profiles/:id': 'Delete profile by ID'
          },
          sessions_crud: {
            'GET /sessions': 'All assessment sessions (pagination: ?limit=100&offset=0)',
            'POST /sessions': 'Create new session',
            'PUT /sessions/:id': 'Update session by ID',
            'DELETE /sessions/:id': 'Delete session by ID'
          },
          responses_crud: {
            'GET /responses': 'All assessment responses (pagination: ?limit=100&offset=0, filter: ?session_id=uuid)',
            'POST /responses': 'Create new response',
            'PUT /responses/:id': 'Update response by ID',
            'DELETE /responses/:id': 'Delete response by ID'
          },
          scoring_crud: {
            'GET /scoring-key': 'All scoring keys',
            'POST /scoring-key': 'Create new scoring key',
            'PUT /scoring-key/:question_id': 'Update scoring key by question ID'
          },
          kb_crud: {
            'GET /kb-definitions': 'All KB definitions',
            'POST /kb-definitions': 'Create new KB definition',
            'PUT /kb-definitions/:key': 'Update KB definition by key',
            'DELETE /kb-definitions/:key': 'Delete KB definition by key',
            'GET /kb-types': 'All KB types',
            'POST /kb-types': 'Create new KB type',
            'PUT /kb-types/:code': 'Update KB type by code',
            'DELETE /kb-types/:code': 'Delete KB type by code'
          },
          dashboard_crud: {
            'GET /dashboard-stats': 'All dashboard statistics',
            'POST /dashboard-stats': 'Create new dashboard statistic',
            'PUT /dashboard-stats/:id': 'Update dashboard statistic by ID'
          },
          config_crud: {
            'GET /config': 'Get all scoring configuration',
            'PUT /config': 'Bulk update scoring configuration (JSON object of key:value)',
            'GET /config/:key': 'Get a single scoring configuration key',
            'PUT /config/:key': 'Update a single scoring configuration key from JSON body',
            'PUT|POST /config-set/:key/:value': 'Update a single key via URL (accepts numeric, boolean, null, JSON)'
          },
          views_access: {
            'GET /views/:view_name': 'Access any database view (pagination: ?limit=100&offset=0)'
          },
          authentication: 'Include x-bot-token header with your bot token',
          note: 'All endpoints support full CRUD operations where applicable. Use pagination parameters for large datasets.'
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