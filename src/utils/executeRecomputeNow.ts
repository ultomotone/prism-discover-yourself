import { admin as supabase } from '../../supabase/admin';

async function executeRecomputeNow() {
  console.log('🚀 EXECUTING IMMEDIATE RECOMPUTATION OF ALL SESSIONS');
  console.log('==================================================');
  
  try {
    console.log('📡 Calling recompute-all-sessions edge function...');
    
    const { data, error } = await supabase.functions.invoke('recompute-all-sessions', {
      body: {}
    });
    
    if (error) {
      console.error('❌ Recomputation failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ RECOMPUTATION COMPLETED SUCCESSFULLY!');
    console.log('📊 Results:', data);
    console.log('🔄 Your results page should now show enhanced scoring!');
    
    return { success: true, data };
    
  } catch (e) {
    console.error('💥 Unexpected error:', e);
    return { success: false, error: e };
  }
}

// Execute immediately
executeRecomputeNow()
  .then((result) => {
    if (result.success) {
      console.log('🎉 ALL DONE! Enhanced scoring is now live for all sessions.');
    } else {
      console.error('💥 Failed to complete recomputation:', result.error);
    }
  })
  .catch(console.error);