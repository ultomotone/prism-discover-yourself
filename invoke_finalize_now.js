// Direct invocation of finalizeAssessment for production evidence
import { createClient } from '@supabase/supabase-js';

const url = 'https://gnkuikentdtnatazeriu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

async function invokeFinalizeAssessment() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  
  console.log('🔄 INVOKING finalizeAssessment in Production');
  console.log('Project:', 'gnkuikentdtnatazeriu');
  console.log('Session ID:', sessionId);
  console.log('FC Version:', fcVersion);
  console.log('Timestamp:', new Date().toISOString());
  console.log('Auth:', 'service_role');

  try {
    // Invoke finalizeAssessment
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId, 
        fc_version: fcVersion 
      }
    });

    console.log('\n📊 RESPONSE:');
    if (error) {
      console.error('❌ Error:', JSON.stringify(error, null, 2));
      console.log('Data:', JSON.stringify(data, null, 2));
    } else {
      console.log('✅ Success:', JSON.stringify(data, null, 2));
    }

    // Immediately check profile creation
    console.log('\n🔍 POST-INVOKE PROFILE CHECK:');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('results_version, version, created_at, updated_at')
      .eq('session_id', sessionId);

    console.log('Profiles found:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log('Profile data:', JSON.stringify(profiles[0], null, 2));
    }

    return { 
      invokeSuccess: !error,
      response: data,
      error,
      profiles,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('❌ Exception:', err);
    return { invokeSuccess: false, error: err };
  }
}

invokeFinalizeAssessment().then(result => {
  console.log('\n🎯 SUMMARY:');
  console.log('Invoke Success:', result.invokeSuccess);
  console.log('Profile Created:', result.profiles && result.profiles.length > 0);
});