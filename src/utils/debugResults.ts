// Debug utility for Results page
import { supabase } from "@/integrations/supabase/client";

export async function debugResultsAccess(sessionId: string, shareToken?: string) {
  console.log('🔍 Debug Results Access');
  console.log('SessionID:', sessionId);
  console.log('ShareToken:', shareToken);
  console.log('SessionID type:', typeof sessionId);
  console.log('SessionID length:', sessionId.length);
  
  // Test if RPC function exists
  try {
    console.log('📞 Testing RPC function...');
    const { data, error } = await supabase.rpc(
      "get_results_by_session",
      { session_id: sessionId, t: shareToken ?? null }
    );
    
    console.log('RPC Response:', { data, error });
    
    if (error) {
      console.error('RPC Error Details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }
    
    return { success: !error, data, error };
  } catch (e) {
    console.error('RPC Exception:', e);
    return { success: false, error: e };
  }
}

export async function debugDirectProfileAccess(sessionId: string) {
  console.log('🔍 Debug Direct Profile Access');
  
  try {
    // Try direct table access (should work with RLS disabled)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    console.log('Direct Profile Access:', { data, error });
    return { success: !error, data, error };
  } catch (e) {
    console.error('Direct Access Exception:', e);
    return { success: false, error: e };
  }
}

export async function debugSessionAccess(sessionId: string) {
  console.log('🔍 Debug Session Access');
  
  try {
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    console.log('Session Access:', { data, error });
    return { success: !error, data, error };
  } catch (e) {
    console.error('Session Access Exception:', e);
    return { success: false, error: e };
  }
}