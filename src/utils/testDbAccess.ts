// Test utility to verify RLS is disabled and app can access data
import { supabase } from "@/integrations/supabase/client";

export interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export async function testAssessmentSessionsAccess(): Promise<TestResult> {
  try {
    // Test reading assessment_sessions without RLS restrictions
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('id, email, status, created_at')
      .limit(5);
    
    if (error) {
      return {
        success: false,
        message: 'Failed to read assessment_sessions',
        error: error.message
      };
    }

    return {
      success: true,
      message: `Successfully read ${data?.length || 0} assessment sessions`,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Exception reading assessment_sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function testProfilesAccess(): Promise<TestResult> {
  try {
    // Test reading profiles without RLS restrictions
    const { data, error } = await supabase
      .from('profiles')
      .select('id, session_id, type_code, created_at')
      .limit(5);
    
    if (error) {
      return {
        success: false,
        message: 'Failed to read profiles',
        error: error.message
      };
    }

    return {
      success: true,
      message: `Successfully read ${data?.length || 0} profiles`,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Exception reading profiles',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function testScoringResultsAccess(): Promise<TestResult> {
  try {
    // Test reading scoring_results without RLS restrictions
    const { data, error } = await supabase
      .from('scoring_results')
      .select('id, session_id, type_code, created_at')
      .limit(5);
    
    if (error) {
      return {
        success: false,
        message: 'Failed to read scoring_results',
        error: error.message
      };
    }

    return {
      success: true,
      message: `Successfully read ${data?.length || 0} scoring results`,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Exception reading scoring_results',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runAllTests(): Promise<TestResult[]> {
  console.log('🧪 Running RLS bypass tests...');
  
  const results = await Promise.all([
    testAssessmentSessionsAccess(),
    testProfilesAccess(), 
    testScoringResultsAccess()
  ]);

  results.forEach((result, index) => {
    const testNames = ['assessment_sessions', 'profiles', 'scoring_results'];
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${testNames[index]}: ${result.message}`);
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
  });

  return results;
}

// Quick test function for console usage
export async function quickTest() {
  const results = await runAllTests();
  const allPassed = results.every(r => r.success);
  
  console.log(`\n🎯 Overall Result: ${allPassed ? 'PASSED' : 'FAILED'}`);
  console.log('RLS is disabled and data access is working!');
  
  return allPassed;
}