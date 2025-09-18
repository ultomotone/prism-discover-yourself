import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-audit-key',
};

// Allow-listed tables for diagnostics
const ALLOWED_TABLES = new Set([
  'assessment_sessions',
  'profiles', 
  'scoring_results',
  'assessment_responses',
  'fc_scores',
  'change_requests'
]);

// Rate limiting (simple in-memory)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  
  if (!entry || now > entry.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const auditKey = req.headers.get('X-Audit-Key');
    const expectedAuditKey = Deno.env.get('AUDIT_KEY');
    
    if (!auditKey || auditKey !== expectedAuditKey) {
      return new Response(JSON.stringify({ ok: false, code: 'UNAUTHORIZED', message: 'Invalid audit key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting
    const clientIP = req.headers.get('CF-Connecting-IP') || 
                    req.headers.get('X-Forwarded-For') || 
                    'unknown';
    
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ ok: false, code: 'RATE_LIMIT', message: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create client with service role for metadata access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get tables metadata
    const { data: tables, error: tablesError } = await supabase.rpc('pg_execute', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });
    
    if (tablesError) throw tablesError;

    const allowedTablesList = (tables || [])
      .map((t: any) => t.table_name)
      .filter((name: string) => ALLOWED_TABLES.has(name));

    // Get columns for allowed tables
    const columns: Record<string, any[]> = {};
    
    for (const tableName of allowedTablesList) {
      const { data: cols, error: colsError } = await supabase.rpc('pg_execute', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position;
        `,
        params: [tableName]
      });
      
      if (!colsError && cols) {
        columns[tableName] = cols;
      }
    }

    // Get RLS policies for allowed tables  
    const policies: Record<string, any[]> = {};
    
    for (const tableName of allowedTablesList) {
      const { data: pols, error: polsError } = await supabase.rpc('pg_execute', {
        query: `
          SELECT polname, polcmd, polroles::text, qual, with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1;
        `,
        params: [tableName]
      });
      
      if (!polsError && pols) {
        policies[tableName] = pols;
      }
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      tables: allowedTablesList,
      columns,
      policies,
      metadata: {
        allowed_tables_count: allowedTablesList.length,
        total_policies: Object.values(policies).flat().length
      }
    };

    return new Response(JSON.stringify(diagnostics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Diagnostics function error:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      code: 'INTERNAL_ERROR', 
      message: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});