import { supabase } from '@/integrations/supabase/client';
import { rescoreSession } from './rescoreSession';

export async function rescoreAllUNKSessions() {
  try {
    console.log('🔍 Finding UNK sessions...');
    
    // Get all sessions with UNK type
    const { data: unkProfiles, error } = await supabase
      .from('profiles')
      .select('session_id, created_at')
      .eq('type_code', 'UNK')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching UNK sessions:', error);
      return { success: false, error };
    }
    
    if (!unkProfiles?.length) {
      console.log('✅ No UNK sessions found');
      return { success: true, message: 'No UNK sessions to rescore' };
    }
    
    console.log(`🎯 Found ${unkProfiles.length} UNK sessions to rescore`);
    
    const results = [];
    
    // Rescore each session
    for (const profile of unkProfiles) {
      console.log(`🔄 Rescoring session ${profile.session_id}...`);
      const result = await rescoreSession(profile.session_id);
      results.push({
        session_id: profile.session_id,
        ...result
      });
      
      // Small delay to avoid overwhelming the edge function
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Update dashboard statistics after rescoring
    console.log('📊 Updating dashboard statistics...');
    const { error: updateError } = await supabase.rpc('update_dashboard_statistics');
    
    if (updateError) {
      console.error('Error updating dashboard stats:', updateError);
    } else {
      console.log('✅ Dashboard statistics updated');
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Rescoring complete: ${successCount}/${results.length} successful`);
    
    return {
      success: true,
      totalSessions: unkProfiles.length,
      successCount,
      results
    };
    
  } catch (err) {
    console.error('Rescoring failed:', err);
    return { success: false, error: err };
  }
}