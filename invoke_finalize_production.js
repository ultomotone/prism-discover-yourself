// Production finalizeAssessment invocation for evidence collection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gnkuikentdtnatazeriu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function invokeFinalizeAssessment() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  
  console.log('🚀 PHASE 2: Invoking finalizeAssessment');
  console.log('Session ID:', sessionId);
  console.log('FC Version:', fcVersion);
  console.log('Environment: Production');
  
  try {
    console.log('\n📞 Calling finalizeAssessment edge function...');
    
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId,
        fc_version: fcVersion
      }
    });

    if (error) {
      console.error('❌ finalizeAssessment error:', error);
      return { success: false, error, data: null };
    }

    console.log('✅ finalizeAssessment response received');
    console.log('Response keys:', Object.keys(data || {}));
    
    if (data?.results_url) {
      console.log('✅ Results URL generated:', data.results_url.substring(0, 50) + '...');
    }
    
    if (data?.share_token) {
      console.log('✅ Share token present:', data.share_token.substring(0, 8) + '...');
    }

    return { success: true, data, error: null };
    
  } catch (err) {
    console.error('❌ Exception during finalizeAssessment:', err);
    return { success: false, error: err, data: null };
  }
}

// Execute
invokeFinalizeAssessment()
  .then(result => {
    console.log('\n🏁 PHASE 2 COMPLETE');
    console.log('Success:', result.success);
    
    if (result.success && result.data) {
      console.log('✅ Function executed successfully');
    } else {
      console.log('❌ Function execution failed');
    }
  })
  .catch(err => {
    console.error('💥 PHASE 2 FAILED:', err);
    process.exit(1);
  });