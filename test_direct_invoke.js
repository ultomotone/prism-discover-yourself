// Direct Function Invocation Test
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gnkuikentdtnatazeriu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function testDirectInvocation() {
  console.log('🔬 DIRECT FUNCTION INVOCATION TEST');
  console.log('==================================');
  
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
  
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  
  try {
    console.log(`📞 Invoking finalizeAssessment...`);
    console.log(`   Session: ${sessionId}`);
    console.log(`   FC Version: ${fcVersion}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    const { data, error } = await serviceClient.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId,
        fc_version: fcVersion
      }
    });
    
    if (error) {
      console.log('❌ Function error:', error);
      
      // Detailed error analysis
      if (error.message) {
        console.log('   Error message:', error.message);
      }
      if (error.status) {
        console.log('   HTTP status:', error.status);
      }
      if (error.statusText) {
        console.log('   Status text:', error.statusText);
      }
      
      return { success: false, error, data: null };
    }
    
    console.log('✅ Function invoked successfully!');
    console.log('   Response keys:', Object.keys(data || {}));
    
    if (data?.status) {
      console.log('   Status:', data.status);
    }
    
    if (data?.results_url) {
      console.log('   Results URL length:', data.results_url.length);
    }
    
    if (data?.share_token) {
      console.log('   Share token present:', !!data.share_token);
    }
    
    if (data?.profile) {
      console.log('   Profile created:', !!data.profile);
      console.log('   Profile keys:', Object.keys(data.profile || {}));
    }
    
    return { success: true, data, error: null };
    
  } catch (err) {
    console.log('❌ Exception during invocation:', err.message);
    console.log('   Error type:', err.constructor.name);
    
    if (err.cause) {
      console.log('   Cause:', err.cause);
    }
    
    return { success: false, error: err, data: null };
  }
}

// Execute test
testDirectInvocation()
  .then(result => {
    console.log('\n📊 DIRECT TEST RESULTS');
    console.log('======================');
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('✅ Function is accessible and executable');
      console.log('✅ Service role authentication working');
      
      if (result.data?.profile) {
        console.log('✅ Profile creation successful');
      } else {
        console.log('⚠️ Profile creation may have failed');
      }
    } else {
      console.log('❌ Function execution failed');
      console.log('   Investigation required for deployment/auth/RLS issues');
    }
  })
  .catch(err => {
    console.error('💥 TEST EXECUTION FAILED:', err);
  });