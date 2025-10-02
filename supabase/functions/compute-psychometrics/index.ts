import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobType } = await req.json();
    
    console.log(`[compute-psychometrics] Starting job: ${jobType}`);
    
    const DATABASE_URL = Deno.env.get('SUPABASE_DB_URL');
    if (!DATABASE_URL) {
      throw new Error('SUPABASE_DB_URL not configured');
    }

    // Run the appropriate Python script
    let scriptPath: string;
    let result: any;

    if (jobType === 'reliability') {
      scriptPath = '/var/task/edge-jobs/psychometrics/compute_reliability.py';
      
      // Execute reliability computation
      const process = Deno.run({
        cmd: ['python3', scriptPath],
        env: {
          DATABASE_URL,
          RESULTS_VER: 'v1.2.1',
          COHORT_START: '2025-09-01',
          COHORT_END: new Date().toISOString().split('T')[0], // today
        },
        stdout: 'piped',
        stderr: 'piped',
      });

      const [status, stdout, stderr] = await Promise.all([
        process.status(),
        process.output(),
        process.stderrOutput(),
      ]);

      const output = new TextDecoder().decode(stdout);
      const error = new TextDecoder().decode(stderr);

      console.log('[compute-psychometrics] Reliability output:', output);
      if (error) console.error('[compute-psychometrics] Reliability stderr:', error);

      result = { success: status.success, output, error };

    } else if (jobType === 'retest') {
      scriptPath = '/var/task/edge-jobs/psychometrics/compute_retest.py';
      
      // Execute retest computation
      const process = Deno.run({
        cmd: ['python3', scriptPath],
        env: {
          DATABASE_URL,
          RESULTS_VER: 'v1.2.1',
        },
        stdout: 'piped',
        stderr: 'piped',
      });

      const [status, stdout, stderr] = await Promise.all([
        process.status(),
        process.output(),
        process.stderrOutput(),
      ]);

      const output = new TextDecoder().decode(stdout);
      const error = new TextDecoder().decode(stderr);

      console.log('[compute-psychometrics] Retest output:', output);
      if (error) console.error('[compute-psychometrics] Retest stderr:', error);

      result = { success: status.success, output, error };

    } else {
      throw new Error(`Unknown job type: ${jobType}`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[compute-psychometrics] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
