// PHASE 1: Execute Comprehensive Production Test
const { createClient } = require('@supabase/supabase-js');

const PROJECT_REF = 'gnkuikentdtnatazeriu';
const FUNCTION_NAME = 'finalizeAssessment';
const SESSION_ID = '618c5ea6-aeda-4084-9156-0aac9643afd3';
const FC_VERSION = 'v1.2';

const supabaseUrl = `https://${PROJECT_REF}.supabase.co`;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U';

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const endpoints = [
  `https://${PROJECT_REF}.functions.supabase.co/${FUNCTION_NAME}`,
  `https://${PROJECT_REF}.supabase.co/functions/v1/${FUNCTION_NAME}`
];

async function testEndpoint(url, method = 'OPTIONS') {
  try {
    console.log(`\n📡 Testing ${method} ${url}`);
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const corsHeaders = {};
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('allow')) {
        corsHeaders[key] = value;
      }
    }
    
    if (Object.keys(corsHeaders).length > 0) {
      console.log('   CORS Headers:', corsHeaders);
    }
    
    return {
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      corsHeaders
    };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      url,
      method,
      error: error.message
    };
  }
}

async function invokeFunction(useServiceRole = true) {
  const client = createClient(
    supabaseUrl, 
    useServiceRole ? serviceRoleKey : anonKey
  );
  
  const keyType = useServiceRole ? 'SERVICE_ROLE' : 'ANON';
  
  try {
    console.log(`\n🔑 Invoking with ${keyType} key...`);
    console.log(`   Session ID: ${SESSION_ID}`);
    console.log(`   FC Version: ${FC_VERSION}`);
    
    const startTime = Date.now();
    
    const { data, error } = await client.functions.invoke(FUNCTION_NAME, {
      body: { 
        session_id: SESSION_ID,
        fc_version: FC_VERSION
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (error) {
      console.log(`   ❌ ${keyType} invoke error:`, error);
      return { 
        success: false, 
        error, 
        data: null, 
        keyType,
        duration,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log(`   ✅ ${keyType} invoke success! (${duration}ms)`);
    console.log(`   Response keys:`, Object.keys(data || {}));
    
    if (data?.results_url) {
      console.log(`   ✅ Results URL: ${data.results_url.substring(0, 60)}...`);
    }
    
    if (data?.share_token) {
      console.log(`   ✅ Share token: ${data.share_token.substring(0, 8)}...`);
    }
    
    if (data?.profile?.id) {
      console.log(`   ✅ Profile ID: ${data.profile.id}`);
    }
    
    return { 
      success: true, 
      data, 
      error: null, 
      keyType,
      duration,
      timestamp: new Date().toISOString()
    };
    
  } catch (err) {
    console.log(`   ❌ ${keyType} invoke exception:`, err.message);
    return { 
      success: false, 
      error: err, 
      data: null, 
      keyType,
      duration: 0,
      timestamp: new Date().toISOString()
    };
  }
}

async function runComprehensiveTest() {
  console.log('🚀 COMPREHENSIVE PRODUCTION TEST');
  console.log('=================================');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`Function: ${FUNCTION_NAME}`);
  console.log(`Session: ${SESSION_ID}`);
  console.log(`FC Version: ${FC_VERSION}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Test endpoints
  console.log('\n📋 PHASE 1A: Endpoint Discovery');
  console.log('================================');
  
  const endpointResults = [];
  for (const endpoint of endpoints) {
    const optionsResult = await testEndpoint(endpoint, 'OPTIONS');
    const headResult = await testEndpoint(endpoint, 'HEAD');
    
    endpointResults.push({ endpoint, options: optionsResult, head: headResult });
  }
  
  // Test invocations
  console.log('\n📋 PHASE 1B: Function Invocation');
  console.log('================================');
  
  const anonResult = await invokeFunction(false);
  const serviceResult = await invokeFunction(true);
  
  // Summary
  console.log('\n📋 COMPREHENSIVE TEST SUMMARY');
  console.log('=============================');
  
  console.log('\nEndpoint Tests:');
  endpointResults.forEach(({ endpoint, options, head }) => {
    console.log(`${endpoint}:`);
    console.log(`  OPTIONS: ${options.status || 'ERROR'} ${options.statusText || options.error || ''}`);
    console.log(`  HEAD: ${head.status || 'ERROR'} ${head.statusText || head.error || ''}`);
  });
  
  console.log('\nInvocation Tests:');
  console.log(`ANON: ${anonResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`SERVICE: ${serviceResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (serviceResult.success) {
    console.log('\n🎉 FUNCTION EXECUTION SUCCESSFUL!');
    console.log(`Duration: ${serviceResult.duration}ms`);
    console.log(`Timestamp: ${serviceResult.timestamp}`);
    
    if (serviceResult.data?.results_url) {
      console.log(`Results URL generated successfully`);
    }
  } else {
    console.log('\n❌ FUNCTION EXECUTION FAILED');
    if (serviceResult.error) {
      console.log('Error details:', serviceResult.error);
    }
  }
  
  return {
    endpointResults,
    anonResult,
    serviceResult,
    summary: {
      endpointsWorking: endpointResults.some(r => r.options.status && r.options.status < 500),
      anonSuccess: anonResult.success,
      serviceSuccess: serviceResult.success,
      functionExecuted: serviceResult.success && serviceResult.data
    }
  };
}

// Execute the test
runComprehensiveTest()
  .then(results => {
    console.log('\n📄 TEST EXECUTION COMPLETE');
    console.log('Results available for Phase 2-5 analysis');
    
    // Export key data for evidence collection
    if (results.serviceResult.success) {
      console.log('\n💾 EVIDENCE DATA:');
      console.log(`- Execution timestamp: ${results.serviceResult.timestamp}`);
      console.log(`- Response received: ${!!results.serviceResult.data}`);
      console.log(`- Profile data: ${!!results.serviceResult.data?.profile}`);
    }
  })
  .catch(error => {
    console.error('💥 COMPREHENSIVE TEST FAILED:', error);
    process.exit(1);
  });