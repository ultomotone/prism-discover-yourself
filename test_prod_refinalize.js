// PHASE 1 - Re-invoke finalizeAssessment (Production)
import { admin as supabase } from './supabase/admin.js';

async function testProdRefinalize() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  
  console.log('🔄 PHASE 1: Re-invoking finalizeAssessment in Production');
  console.log('Session:', sessionId);
  console.log('FC Version:', fcVersion);
  console.log('Timestamp:', new Date().toISOString());

  try {
    // PHASE 1: Call finalizeAssessment function
    console.log('\n📞 Invoking finalizeAssessment...');
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId, 
        fc_version: fcVersion 
      }
    });

    console.log('\n📊 Raw Response:');
    if (error) {
      console.error('❌ Function Error:', error);
      console.log('Response Data:', data);
      return { success: false, error, data };
    }

    console.log('✅ Function Response:', JSON.stringify(data, null, 2));

    // PHASE 2: Check profile creation immediately
    console.log('\n🔍 PHASE 2: Checking Profile Creation...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('results_version, version, created_at, updated_at')
      .eq('session_id', sessionId);

    console.log('Profile Check Result:', profiles);
    if (profileError) {
      console.error('Profile Query Error:', profileError);
    }

    return { 
      success: true, 
      finalizeResponse: data,
      profiles,
      hasProfile: profiles && profiles.length > 0,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('❌ Test failed:', err);
    return { success: false, error: err };
  }
}

// Execute and report
testProdRefinalize().then(result => {
  console.log('\n📋 FINAL RESULT:');
  console.log('Success:', result.success);
  if (result.hasProfile) {
    console.log('✅ Profile Created Successfully');
  } else if (result.success) {
    console.log('⚠️ Function succeeded but profile not found - may need PHASE 3 admin fallback');
  }
});

export { testProdRefinalize };