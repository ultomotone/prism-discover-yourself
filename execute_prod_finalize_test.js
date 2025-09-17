const { createClient } = require('@supabase/supabase-js');

async function executeProductionTest() {
  const supabaseUrl = 'https://gnkuikentdtnatazeriu.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  console.log('🔄 PRODUCTION FINALIZE TEST - EXECUTING');
  console.log('Session ID: 618c5ea6-aeda-4084-9156-0aac9643afd3');
  console.log('FC Version: v1.2');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Step 1: Invoke finalizeAssessment function
    console.log('\n📞 STEP 1: Invoking finalizeAssessment...');
    const { data: functionResponse, error: functionError } = await supabase.functions.invoke('finalizeAssessment', {
      body: {
        session_id: '618c5ea6-aeda-4084-9156-0aac9643afd3',
        fc_version: 'v1.2'
      }
    });

    if (functionError) {
      console.error('❌ Function invocation error:', functionError);
      return { success: false, error: functionError };
    }

    console.log('✅ Function Response:', JSON.stringify(functionResponse, null, 2));

    // Step 2: Check FC Scores
    console.log('\n🔍 STEP 2: Checking FC Scores...');
    const { data: fcScores, error: fcError } = await supabase
      .from('fc_scores')
      .select('version, created_at')
      .eq('session_id', '618c5ea6-aeda-4084-9156-0aac9643afd3')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fcError) {
      console.error('❌ FC Scores query error:', fcError);
    } else {
      console.log('✅ FC Scores:', fcScores);
    }

    // Step 3: Check Profiles
    console.log('\n👤 STEP 3: Checking Profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('results_version, version, created_at, updated_at')
      .eq('session_id', '618c5ea6-aeda-4084-9156-0aac9643afd3');

    if (profileError) {
      console.error('❌ Profiles query error:', profileError);
    } else {
      console.log('✅ Profiles:', profiles);
    }

    // Step 4: Test Results URL access (if available)
    if (functionResponse?.results_url) {
      console.log('\n🌐 STEP 4: Testing HTTP Access...');
      console.log('Results URL:', functionResponse.results_url);
      
      try {
        const response = await fetch(functionResponse.results_url);
        console.log('✅ Results URL Status:', response.status);
      } catch (httpError) {
        console.error('❌ Results URL test failed:', httpError.message);
      }

      // Test without token
      const baseUrl = functionResponse.results_url.split('?')[0];
      try {
        const noTokenResponse = await fetch(baseUrl);
        console.log('✅ No Token Status:', noTokenResponse.status);
      } catch (httpError) {
        console.error('❌ No token test failed:', httpError.message);
      }
    }

    return {
      success: true,
      functionResponse,
      fcScores,
      profiles,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return { success: false, error };
  }
}

// Execute if run directly
if (require.main === module) {
  executeProductionTest().then(result => {
    console.log('\n📋 FINAL RESULT:', result.success ? 'SUCCESS' : 'FAILED');
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { executeProductionTest };