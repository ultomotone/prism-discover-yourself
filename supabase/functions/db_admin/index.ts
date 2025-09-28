import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-key',
};

// Allow-listed tables for safety
const ALLOWED_TABLES = new Set([
  'public.assessment_sessions',
  'public.profiles', 
  'public.scoring_results',
  'public.assessment_responses',
  'public.fc_scores'
]);

function requireTable(table: string) {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`Table ${table} is not allow-listed`);
  }
}

interface AdminAction {
  action: string;
  params?: any;
}

interface AuditLog {
  action: string;
  params: any;
  status: string;
  result?: any;
  error_message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const adminKey = req.headers.get('X-Admin-Key');
    const expectedAdminKey = Deno.env.get('ADMIN_KEY');
    
    if (!adminKey || adminKey !== expectedAdminKey) {
      return new Response(JSON.stringify({ ok: false, code: 'UNAUTHORIZED', message: 'Invalid admin key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body: AdminAction = await req.json();
    
    // Validate action
    if (!body.action) {
      return new Response(JSON.stringify({ ok: false, code: 'BAD_REQUEST', message: 'Missing action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create audit log entry
    const auditLog: AuditLog = {
      action: body.action,
      params: body.params || {},
      status: 'received'
    };

    const { data: auditEntry } = await supabase
      .from('change_requests')
      .insert(auditLog)
      .select('id')
      .single();

    let result: any;
    let success = false;

    try {
      switch (body.action) {
        case 'toggle_rls':
          result = await toggleRls(supabase, body.params);
          break;
        case 'grant_table':
          result = await grantTable(supabase, body.params);
          break;
        case 'revoke_table':
          result = await revokeTable(supabase, body.params);
          break;
        case 'policy_owner_or_email':
          result = await policyOwnerOrEmail(supabase, body.params);
          break;
        case 'policy_service_role_profiles':
          result = await policyServiceRoleProfiles(supabase);
          break;
        case 'config_set':
          result = await configSet(supabase, body.params);
          break;
        case 'seed_sessions':
          result = await seedSessions(supabase, body.params);
          break;
        case 'backfill_profiles':
          result = await backfillProfiles(supabase, body.params);
          break;
        case 'recompute_session':
          result = await recomputeSession(supabase, body.params);
          break;
        case 'enable_realtime':
          result = await enableRealtime(supabase, body.params);
          break;
        default:
          throw new Error(`Unsupported action: ${body.action}`);
      }
      success = true;
    } catch (error) {
      result = { error: (error as Error).message };
    }

    // Update audit log
    if (auditEntry?.id) {
      await supabase
        .from('change_requests')
        .update({
          status: success ? 'completed' : 'failed',
          result,
          error_message: success ? null : result.error
        })
        .eq('id', auditEntry.id);
    }

    if (success) {
      return new Response(JSON.stringify({ ok: true, action: body.action, details: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ ok: false, code: 'EXECUTION_ERROR', message: result.error }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Admin function error:', error);
    return new Response(JSON.stringify({ ok: false, code: 'INTERNAL_ERROR', message: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function toggleRls(supabase: any, params: { table: string; enabled: boolean }) {
  requireTable(params.table);
  
  const { error } = await supabase.rpc('pg_execute', {
    query: `ALTER TABLE ${params.table} ${params.enabled ? 'ENABLE' : 'DISABLE'} ROW LEVEL SECURITY;`
  });
  
  if (error) throw error;
  return { table: params.table, rls_enabled: params.enabled };
}

async function grantTable(supabase: any, params: { table: string; grantee: string; privileges: string[] }) {
  requireTable(params.table);
  
  if (!['authenticated', 'anon'].includes(params.grantee)) {
    throw new Error('Grantee must be authenticated or anon');
  }
  
  const privs = params.privileges.join(', ');
  const { error } = await supabase.rpc('pg_execute', {
    query: `GRANT ${privs} ON ${params.table} TO ${params.grantee};`
  });
  
  if (error) throw error;
  return { table: params.table, grantee: params.grantee, privileges: params.privileges };
}

async function revokeTable(supabase: any, params: { table: string; grantee: string; privileges: string[] }) {
  requireTable(params.table);
  
  if (!['authenticated', 'anon'].includes(params.grantee)) {
    throw new Error('Grantee must be authenticated or anon');
  }
  
  const privs = params.privileges.join(', ');
  const { error } = await supabase.rpc('pg_execute', {
    query: `REVOKE ${privs} ON ${params.table} FROM ${params.grantee};`
  });
  
  if (error) throw error;
  return { table: params.table, grantee: params.grantee, privileges: params.privileges };
}

async function policyOwnerOrEmail(supabase: any, params: { table: string }) {
  requireTable(params.table);
  
  const policyName = `sess_select_owner_or_email`;
  
  const { error } = await supabase.rpc('pg_execute', {
    query: `
      ALTER TABLE ${params.table} ENABLE ROW LEVEL SECURITY;
      GRANT SELECT ON ${params.table} TO authenticated;
      DROP POLICY IF EXISTS ${policyName} ON ${params.table};
      CREATE POLICY ${policyName}
      ON ${params.table} FOR SELECT TO authenticated
      USING (
        user_id = auth.uid()
        OR (user_id IS NULL AND email IS NOT NULL
            AND lower(email) = lower(COALESCE(auth.jwt()->>'email','')))
      );
    `
  });
  
  if (error) throw error;
  return { table: params.table, policy: policyName };
}

async function policyServiceRoleProfiles(supabase: any) {
  const table = 'public.profiles';
  requireTable(table);
  
  const policyName = 'svc_manage_profiles';
  
  const { error } = await supabase.rpc('pg_execute', {
    query: `
      ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS ${policyName} ON ${table};
      CREATE POLICY ${policyName}
      ON ${table} FOR ALL TO public
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    `
  });
  
  if (error) throw error;
  return { table, policy: policyName };
}

async function configSet(supabase: any, params: { key: string; value: any }) {
  const { error } = await supabase
    .from('scoring_config')
    .upsert({
      key: params.key,
      value: params.value,
      updated_at: new Date().toISOString()
    });
  
  if (error) throw error;
  return { key: params.key, value: params.value };
}

async function seedSessions(supabase: any, params: { rows: number }) {
  const sessions = [];
  for (let i = 0; i < params.rows; i++) {
    sessions.push({
      id: crypto.randomUUID(),
      email: `test${i}@example.com`,
      status: Math.random() > 0.5 ? 'completed' : 'in_progress',
      started_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      share_token: crypto.randomUUID()
    });
  }
  
  const { error } = await supabase
    .from('assessment_sessions')
    .insert(sessions);
  
  if (error) throw error;
  return { inserted: params.rows };
}

async function backfillProfiles(supabase: any, params: { dryRun?: boolean; sinceDays?: number }) {
  const sinceDays = params.sinceDays || 30;
  const dryRun = params.dryRun || false;
  
  // Get completed sessions without profiles
  const { data: sessions, error } = await supabase
    .from('assessment_sessions')
    .select('id, email, completed_at')
    .eq('status', 'completed')
    .gte('completed_at', new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString())
    .not('id', 'in', 
      supabase
        .from('profiles')
        .select('session_id')
    );
  
  if (error) throw error;
  
  if (dryRun) {
    return { sessions_needing_profiles: sessions?.length || 0, dry_run: true };
  }
  
  let processed = 0;
  let errors = 0;
  
  for (const session of sessions || []) {
    try {
      // Call existing scoring function
      const { error: scoreError } = await supabase.functions.invoke('score_prism', {
        body: { session_id: session.id }
      });
      
      if (scoreError) {
        console.error(`Failed to score session ${session.id}:`, scoreError);
        errors++;
      } else {
        processed++;
      }
    } catch (err) {
      console.error(`Exception scoring session ${session.id}:`, err);
      errors++;
    }
  }
  
  return { total_found: sessions?.length || 0, processed, errors };
}

async function recomputeSession(supabase: any, params: { sessionId: string }) {
  const { data, error } = await supabase.functions.invoke('score_prism', {
    body: { session_id: params.sessionId }
  });
  
  if (error) throw error;
  return { session_id: params.sessionId, recomputed: true, result: data };
}

async function enableRealtime(supabase: any, params: { table: string }) {
  requireTable(params.table);
  
  const { error } = await supabase.rpc('pg_execute', {
    query: `ALTER PUBLICATION supabase_realtime ADD TABLE ${params.table};`
  });
  
  if (error) throw error;
  return { table: params.table, realtime_enabled: true };
}