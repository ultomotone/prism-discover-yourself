// IR-09B: Smoke Test for Session 618c5ea6-aeda-4084-9156-0aac9643afd3
// Tests if RLS fix restored profile creation

import { createClient } from '@supabase/supabase-js';

const url = 'https://gnkuikentdtnatazeriu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function runSmokeTest() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  console.log('🧪 IR-09B Smoke Test - Post RLS Fix');
  console.log('=====================================');
  console.log(`Target Session: ${sessionId}`);
  console.log('');

  // Step 1: Invoke finalizeAssessment
  console.log('1. Testing finalizeAssessment...');
  try {
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { session_id: sessionId }
    });

    if (error) {
      console.log('❌ finalizeAssessment ERROR:', error);
      return { success: false, error };
    }

    console.log('✅ finalizeAssessment SUCCESS');
    console.log('Response:', JSON.stringify(data, null, 2));
    
    // Check for expected fields
    const hasExpectedFields = data?.ok && data?.session_id && data?.share_token && data?.results_url;
    console.log(`Expected fields present: ${hasExpectedFields ? '✅' : '❌'}`);
    
  } catch (err) {
    console.log('❌ finalizeAssessment EXCEPTION:', err);
    return { success: false, error: err };
  }

  // Step 2: Check if profile was created
  console.log('\n2. Checking profile creation...');
  const { data: profileCheck } = await supabase
    .from('profiles')
    .select('id, results_version, type_code, created_at')
    .eq('session_id', sessionId)
    .single();

  if (profileCheck) {
    console.log('✅ Profile created successfully');
    console.log('Profile data:', profileCheck);
    
    if (profileCheck.results_version === 'v1.2.1') {
      console.log('✅ Version stamping correct (v1.2.1)');
    } else {
      console.log(`❌ Version mismatch. Got: ${profileCheck.results_version}, Expected: v1.2.1`);
    }
  } else {
    console.log('❌ No profile found - RLS fix may not be working');
  }

  // Step 3: Check FC scores
  console.log('\n3. Checking FC scores...');
  const { data: fcScores } = await supabase
    .from('fc_scores')
    .select('version, fc_kind, blocks_answered, created_at')
    .eq('session_id', sessionId);

  if (fcScores && fcScores.length > 0) {
    console.log('✅ FC scores found:', fcScores);
  } else {
    console.log('⚠️  No FC scores found (expected - FC infrastructure not seeded yet)');
  }

  // Step 4: Check session share_token 
  console.log('\n4. Checking share token...');
  const { data: sessionData } = await supabase
    .from('assessment_sessions')
    .select('share_token, share_token_expires_at')
    .eq('id', sessionId)
    .single();

  if (sessionData?.share_token) {
    console.log(`✅ Share token present: ${sessionData.share_token}`);
    console.log(`Expires: ${sessionData.share_token_expires_at || 'No expiry set'}`);
  } else {
    console.log('❌ No share token found');
  }

  console.log('\n=====================================');
  console.log('🧪 Smoke Test Complete');
  
  return { success: true };
}

// Run the test
runSmokeTest().catch(console.error);