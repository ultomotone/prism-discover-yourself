// Quick test to verify RLS bypass is working
import { supabase } from "@/integrations/supabase/client";

export async function testRlsBypass() {
  console.log('🧪 Testing RLS Bypass...');
  
  const tests = [
    {
      name: 'Assessment Sessions',
      test: () => supabase.from('assessment_sessions').select('id, email, status').limit(3)
    },
    {
      name: 'Profiles',
      test: () => supabase.from('profiles').select('session_id, type_code, overlay').limit(3)
    },
    {
      name: 'Assessment Responses',
      test: () => supabase.from('assessment_responses').select('session_id, question_id').limit(3)
    },
    {
      name: 'Scoring Results',
      test: () => supabase.from('scoring_results').select('session_id, type_code').limit(3)
    }
  ];

  const results = [];
  
  for (const { name, test } of tests) {
    try {
      const { data, error } = await test();
      const success = !error;
      console.log(`${success ? '✅' : '❌'} ${name}: ${success ? `${data?.length || 0} rows` : error?.message}`);
      results.push({ name, success, data, error });
    } catch (e) {
      console.log(`❌ ${name}: Exception - ${e}`);
      results.push({ name, success: false, error: e });
    }
  }
  
  const allPassed = results.every(r => r.success);
  console.log(`\n🎯 RLS Bypass Test: ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  if (allPassed) {
    console.log('🎉 All tables accessible! RLS bypass working correctly.');
  } else {
    console.log('⚠️ Some tables still restricted. Check individual results above.');
  }
  
  return { allPassed, results };
}

// Test specific session data
export async function testSessionData(sessionId: string) {
  console.log(`🔍 Testing session data for: ${sessionId}`);
  
  try {
    // Check if session exists
    const { data: sessionData, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (sessionError) {
      console.log('❌ Session not found:', sessionError);
      return { found: false, error: sessionError };
    }
    
    console.log('✅ Session found:', {
      id: sessionData.id,
      status: sessionData.status,
      email: sessionData.email,
      share_token: sessionData.share_token
    });
    
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single();
      
    if (profileError) {
      console.log('❌ Profile not found for session:', profileError);
      console.log('🔧 This session needs to be scored to generate a profile.');
      return { 
        found: true, 
        session: sessionData, 
        profile: null, 
        needsScoring: true 
      };
    }
    
    console.log('✅ Profile found:', {
      type_code: profileData.type_code,
      overlay: profileData.overlay,
      confidence: profileData.confidence
    });
    
    return { 
      found: true, 
      session: sessionData, 
      profile: profileData, 
      needsScoring: false 
    };
    
  } catch (e) {
    console.error('❌ Exception testing session data:', e);
    return { found: false, error: e };
  }
}

// Export for console use
(window as any).testRlsBypass = testRlsBypass;
(window as any).testSessionData = testSessionData;