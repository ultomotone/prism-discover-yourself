// Comprehensive Production finalizeAssessment Test
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gnkuikentdtnatazeriu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U';

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
const fcVersion = 'v1.2';

async function testEndpoints() {
  console.log('🔍 PHASE A: Endpoint Discovery');
  console.log('==============================');
  
  const endpoints = [
    'https://gnkuikentdtnatazeriu.functions.supabase.co/finalizeAssessment',
    'https://gnkuikentdtnatazeriu.supabase.co/functions/v1/finalizeAssessment'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      
      // OPTIONS request
      const optionsResp = await fetch(endpoint, { method: 'OPTIONS' });
      console.log(`  OPTIONS: ${optionsResp.status} ${optionsResp.statusText}`);
      
      // HEAD request  
      const headResp = await fetch(endpoint, { method: 'HEAD' });
      console.log(`  HEAD: ${headResp.status} ${headResp.statusText}`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
}

async function testWithAnonKey() {
  console.log('\n🔓 PHASE C1: Anonymous Key Test');
  console.log('===============================');
  
  const anonClient = createClient(supabaseUrl, anonKey);
  
  try {
    const { data, error } = await anonClient.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId,
        fc_version: fcVersion
      }
    });

    if (error) {
      console.log('❌ Anon invoke error:', error);
      return { success: false, error, data: null };
    }

    console.log('✅ Anon invoke success:', Object.keys(data || {}));
    return { success: true, data, error: null };
    
  } catch (err) {
    console.log('❌ Anon invoke exception:', err.message);
    return { success: false, error: err, data: null };
  }
}

async function testWithServiceRole() {
  console.log('\n🔑 PHASE C2: Service Role Test');
  console.log('==============================');
  
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    console.log('📞 Invoking finalizeAssessment with service role...');
    
    const { data, error } = await serviceClient.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId,
        fc_version: fcVersion
      }
    });

    if (error) {
      console.log('❌ Service invoke error:', error);
      return { success: false, error, data: null };
    }

    console.log('✅ Service invoke success!');
    console.log('Response keys:', Object.keys(data || {}));
    
    if (data?.results_url) {
      console.log('✅ Results URL generated:', data.results_url.substring(0, 60) + '...');
    }
    
    if (data?.share_token) {
      console.log('✅ Share token present:', data.share_token.substring(0, 8) + '...');
    }

    return { success: true, data, error: null };
    
  } catch (err) {
    console.log('❌ Service invoke exception:', err.message);
    return { success: false, error: err, data: null };
  }
}

async function collectDbEvidence(serviceClient) {
  console.log('\n📊 PHASE D: Database Evidence');
  console.log('=============================');
  
  try {
    // Check fc_scores
    const { data: fcScores, error: fcError } = await serviceClient
      .from('fc_scores')
      .select('version, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('FC Scores:', fcScores);
    if (fcError) console.log('FC Error:', fcError);

    // Check profiles  
    const { data: profiles, error: profileError } = await serviceClient
      .from('profiles')
      .select('results_version, version, created_at, updated_at')
      .eq('session_id', sessionId);

    console.log('Profiles:', profiles);
    if (profileError) console.log('Profile Error:', profileError);
    
    return { fcScores, profiles };
    
  } catch (err) {
    console.log('❌ DB Evidence error:', err);
    return { error: err };
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Production finalizeAssessment Comprehensive Test');
  console.log('===================================================');
  console.log(`Session ID: ${sessionId}`);
  console.log(`FC Version: ${fcVersion}`);
  console.log(`Environment: Production (gnkuikentdtnatazeriu)`);
  
  // Phase A: Endpoint Discovery
  await testEndpoints();
  
  // Phase C: Authentication Tests
  const anonResult = await testWithAnonKey();
  const serviceResult = await testWithServiceRole();
  
  // Phase D: Database Evidence (if service call succeeded)
  let dbEvidence = null;
  if (serviceResult.success) {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    dbEvidence = await collectDbEvidence(serviceClient);
  }
  
  // Final Summary
  console.log('\n🏁 COMPREHENSIVE TEST SUMMARY');
  console.log('=============================');
  console.log('Anon Test:', anonResult.success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Service Test:', serviceResult.success ? '✅ SUCCESS' : '❌ FAILED');
  
  if (serviceResult.success && serviceResult.data) {
    console.log('✅ Function executed successfully');
    console.log('✅ Response data received');
    
    if (dbEvidence?.profiles?.length > 0) {
      console.log('✅ Profile created in database');
    } else {
      console.log('❌ Profile NOT created in database');
    }
  } else {
    console.log('❌ Function execution failed');
    console.log('❌ Need to investigate deployment or function issues');
  }
  
  return {
    anonResult,
    serviceResult,
    dbEvidence
  };
}

// Execute the comprehensive test
runComprehensiveTest()
  .then(results => {
    console.log('\n📄 FULL RESULTS AVAILABLE FOR ANALYSIS');
    
    // Save key results for evidence collection
    if (results.serviceResult.success) {
      console.log('\n💾 SAVING EVIDENCE...');
      console.log('Response data keys:', Object.keys(results.serviceResult.data || {}));
    }
  })
  .catch(error => {
    console.error('💥 COMPREHENSIVE TEST FAILED:', error);
    process.exit(1);
  });