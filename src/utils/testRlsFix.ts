// Test script to verify RLS fix works with score_prism edge function
import { admin as supabase } from '../../supabase/admin';

export async function testRlsFix() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  
  console.log('🧪 Testing RLS Fix - Session:', sessionId);
  console.log('=========================================');
  
  // Check current state
  console.log('1. Checking current state...');
  const { data: beforeState } = await supabase
    .from('profiles')
    .select('id, results_version, type_code')
    .eq('session_id', sessionId)
    .maybeSingle();
  
  console.log('Profile before test:', beforeState || 'No profile found');
  
  // Test score_prism edge function directly
  console.log('\n2. Testing score_prism edge function...');
  try {
    const { data, error } = await supabase.functions.invoke('score_prism', {
      body: { session_id: sessionId }
    });
    
    if (error) {
      console.error('❌ score_prism error:', error);
      return { success: false, step: 'score_prism', error };
    }
    
    console.log('✅ score_prism success:', data);
    
    // Check if profile was created
    console.log('\n3. Checking if profile was created...');
    const { data: afterState } = await supabase
      .from('profiles')
      .select('id, results_version, type_code, created_at')
      .eq('session_id', sessionId)
      .maybeSingle();
    
    if (afterState && !beforeState) {
      console.log('✅ NEW PROFILE CREATED!');
      console.log('Profile details:', afterState);
      
      if (afterState.results_version === 'v1.2.1') {
        console.log('✅ Version stamping correct (v1.2.1)');
      } else {
        console.log(`⚠️ Version unexpected: ${afterState.results_version} (expected v1.2.1)`);
      }
      
      // Test finalizeAssessment now that profile exists
      console.log('\n4. Testing finalizeAssessment...');
      const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalizeAssessment', {
        body: { session_id: sessionId }
      });
      
      if (finalizeError) {
        console.error('❌ finalizeAssessment error:', finalizeError);
      } else {
        console.log('✅ finalizeAssessment success:', finalizeData);
      }
      
      return { 
        success: true, 
        profileCreated: true,
        profileData: afterState,
        finalizeResult: finalizeData 
      };
    } else {
      console.log('❌ Profile was not created - RLS fix may not be working');
      return { success: false, step: 'profile_creation', profileCreated: false };
    }
    
  } catch (err) {
    console.error('❌ Exception during test:', err);
    return { success: false, step: 'exception', error: err };
  }
}

// Export for direct usage
export { testRlsFix as default };