// Immediate Function Test - Run Now
const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://gnkuikentdtnatazeriu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
const fcVersion = 'v1.2';

console.log('🚀 IMMEDIATE FUNCTION TEST');
console.log('==========================');
console.log(`Timestamp: ${new Date().toISOString()}`);

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

async function runTest() {
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
  
  try {
    console.log(`📞 Invoking finalizeAssessment...`);
    console.log(`   Session: ${sessionId}`);
    console.log(`   FC Version: ${fcVersion}`);
    
    const startTime = Date.now();
    
    const { data, error } = await client.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId,
        fc_version: fcVersion
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Duration: ${duration}ms`);
    
    if (error) {
      console.log('❌ ERROR DETAILS:');
      console.log('   Message:', error.message || 'No message');
      console.log('   Status:', error.status || 'No status');
      console.log('   Full error:', JSON.stringify(error, null, 2));
      return false;
    }
    
    console.log('✅ SUCCESS!');
    console.log('   Response type:', typeof data);
    console.log('   Response keys:', Object.keys(data || {}));
    
    if (data?.status) {
      console.log('   Status:', data.status);
    }
    
    if (data?.profile) {
      console.log('   Profile created:', !!data.profile);
      console.log('   Profile ID:', data.profile.id);
      console.log('   Type code:', data.profile.type_code);
      console.log('   Results version:', data.profile.results_version);
    }
    
    if (data?.results_url) {
      console.log('   Results URL:', data.results_url);
    }
    
    return true;
    
  } catch (err) {
    console.log('❌ EXCEPTION:');
    console.log('   Type:', err.constructor.name);
    console.log('   Message:', err.message);
    console.log('   Stack:', err.stack?.split('\n')[0]);
    return false;
  }
}

// Execute immediately
runTest().then(success => {
  if (success) {
    console.log('\n🎉 FUNCTION WORKING!');
    console.log('Next: Check database for profile creation');
  } else {
    console.log('\n💥 FUNCTION FAILED');
    console.log('Next: Investigate deployment or configuration issues');
  }
}).catch(err => {
  console.error('💥 TEST CRASHED:', err);
});

// For browser testing
if (typeof window !== 'undefined') {
  window.testFinalizeAssessment = runTest;
}