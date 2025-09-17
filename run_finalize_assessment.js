// Manual finalizeAssessment invocation for evidence collection
const { createClient } = require('@supabase/supabase-js');

// Production environment
const supabaseUrl = 'https://gnkuikentdtnatazeriu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function runFinalizeAssessmentEvidence() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  
  console.log('🔍 EVIDENCE RUN: finalizeAssessment');
  console.log('Session ID:', sessionId);
  console.log('FC Version:', fcVersion);
  console.log('Environment: Production');
  
  try {
    // Step 1: Invoke finalizeAssessment
    console.log('\n📞 Invoking finalizeAssessment function...');
    
    const { data: fnResponse, error: fnError } = await supabase.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId,
        fc_version: fcVersion
      }
    });

    if (fnError) {
      console.error('❌ finalizeAssessment error:', fnError);
      return { success: false, error: fnError };
    }

    console.log('✅ finalizeAssessment response:', JSON.stringify(fnResponse, null, 2));
    
    // Step 2: DB Proofs - fc_scores
    console.log('\n🔍 DB Proof 1: fc_scores verification...');
    const { data: fcScores, error: fcError } = await supabase
      .from('fc_scores')
      .select('version, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (fcError) {
      console.error('❌ fc_scores query error:', fcError);
    } else {
      console.log('✅ fc_scores result:', fcScores);
    }
    
    // Step 3: DB Proofs - profiles  
    console.log('\n🔍 DB Proof 2: profiles verification...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('results_version, version, created_at, updated_at, type_code, overlay')
      .eq('session_id', sessionId);
      
    if (profileError) {
      console.error('❌ profiles query error:', profileError);
    } else {
      console.log('✅ profiles result:', profiles);
    }

    // Compile results
    const results = {
      success: true,
      finalize_response: fnResponse,
      fc_scores: fcScores?.[0] || null,
      profiles: profiles?.[0] || null,
      results_url: fnResponse?.results_url || null,
      share_token: fnResponse?.share_token || null
    };
    
    console.log('\n📋 EVIDENCE SUMMARY:');
    console.log('- fc_scores version:', results.fc_scores?.version || 'NOT FOUND');
    console.log('- profiles results_version:', results.profiles?.results_version || 'NOT FOUND');
    console.log('- results_url present:', !!results.results_url);
    console.log('- share_token present:', !!results.share_token);
    
    return results;
    
  } catch (err) {
    console.error('❌ Exception during evidence run:', err);
    return { success: false, error: err };
  }
}

// Execute
runFinalizeAssessmentEvidence()
  .then(result => {
    console.log('\n🏁 FINAL EVIDENCE RESULT:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error('\n💥 EVIDENCE RUN FAILED:');
    console.error(err);
    process.exit(1);
  });