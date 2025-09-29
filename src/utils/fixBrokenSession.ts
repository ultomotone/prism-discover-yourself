import { supabase } from '@/lib/supabaseClient';

export async function fixBrokenSession(sessionId: string): Promise<boolean> {
  console.log(`🔧 Attempting to fix session: ${sessionId}`);
  
  try {
    // First trigger scoring
    const { data: scoringData, error: scoringError } = await supabase.functions.invoke('force-score-session', {
      body: { session_id: sessionId }
    });

    if (scoringError) {
      console.error('❌ Scoring failed:', scoringError);
      return false;
    }

    console.log('✅ Scoring triggered:', scoringData);
    
    // Wait for scoring to complete
    console.log('⏳ Waiting 5 seconds for scoring to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('session_id, type_code, computed_at')
      .eq('session_id', sessionId)
      .maybeSingle();
      
    if (profileError) {
      console.error('❌ Profile check error:', profileError);
      return false;
    }
    
    if (profile) {
      console.log('✅ Session fixed! Profile created:', profile);
      return true;
    } else {
      console.log('⚠️ Profile not found yet, may need more time...');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Fix session error:', error);
    return false;
  }
}

// Auto-fix on import if we're on the results page for the broken session
if (typeof window !== 'undefined' && window.location.pathname.includes('/results/76d52e00-3d17-424d-86ee-949a8e8ea8a3')) {
  console.log('🚀 Auto-fixing broken session...');
  fixBrokenSession('76d52e00-3d17-424d-86ee-949a8e8ea8a3').then(success => {
    if (success) {
      console.log('✅ Session fixed! Reloading page...');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.log('❌ Failed to fix session automatically');
    }
  });
}