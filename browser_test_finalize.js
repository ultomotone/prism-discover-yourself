// Browser Test for finalizeAssessment - Can be run in console
async function testFinalizeAssessment() {
  // Use the existing Supabase client from the application
  const serviceRoleKey = 'sb_service_role_key_needed'; // Would need actual key
  
  // For this test, we'll use the existing client that should be available
  const client = window.supabase || (await import('@/integrations/supabase/client')).supabase;
  
  if (!client) {
    console.error('❌ No Supabase client available');
    return;
  }
  
  console.log('🔬 Testing finalizeAssessment function...');
  console.log('Time:', new Date().toISOString());
  
  try {
    const result = await client.functions.invoke('finalizeAssessment', {
      body: {
        session_id: '618c5ea6-aeda-4084-9156-0aac9643afd3',
        fc_version: 'v1.2'
      }
    });
    
    console.log('📊 RESULT:', result);
    
    if (result.error) {
      console.log('❌ Error details:', result.error);
    } else {
      console.log('✅ Success!');
      console.log('Data keys:', Object.keys(result.data || {}));
      
      if (result.data?.profile) {
        console.log('Profile created:', result.data.profile);
      }
      
      if (result.data?.results_url) {
        console.log('Results URL:', result.data.results_url);
      }
    }
    
    return result;
    
  } catch (error) {
    console.log('❌ Exception:', error);
    return { error };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.testFinalizeAssessment = testFinalizeAssessment;
  console.log('💡 Test function available as window.testFinalizeAssessment()');
}

export { testFinalizeAssessment };