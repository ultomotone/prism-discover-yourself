import { admin as supabase } from '../../supabase/admin';

async function recomputeAll() {
  console.log('🚀 EXECUTING FULL RECOMPUTATION NOW');
  console.log('==================================');
  
  const currentSession = '76d52e00-3d17-424d-86ee-949a8e8ea8a3';
  
  // First recompute the current session for immediate feedback
  console.log(`🔄 Recomputing current session: ${currentSession}`);
  try {
    const { data, error } = await supabase.functions.invoke('enhanced-score-engine', {
      body: { session_id: currentSession }
    });
    
    if (error) {
      console.error('❌ Current session failed:', error);
    } else {
      console.log('✅ Current session updated! Refresh to see changes.');
    }
  } catch (e) {
    console.error('💥 Current session error:', e);
  }
  
  // Then recompute all sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('assessment_sessions')
    .select('id, completed_at')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError);
    return;
  }

  console.log(`\n📊 Processing ${sessions?.length || 0} total sessions...`);
  
  let processed = 0;
  let failed = 0;
  
  for (const [index, session] of (sessions || []).entries()) {
    if (session.id === currentSession) {
      console.log(`⏭️  Skipping current session (already processed)`);
      continue;
    }
    
    try {
      const progress = `${index + 1}/${sessions.length}`;
      console.log(`[${progress}] Processing: ${session.id}`);
      
      const { error: invokeError } = await supabase.functions.invoke('enhanced-score-engine', {
        body: { session_id: session.id }
      });
      
      if (invokeError) {
        console.error(`❌ Failed: ${invokeError.message || invokeError}`);
        failed++;
      } else {
        processed++;
        if (processed % 10 === 0) {
          console.log(`✅ Milestone: ${processed} sessions completed`);
        }
      }
      
    } catch (e) {
      console.error(`💥 Exception: ${e}`);
      failed++;
    }
    
    // Brief pause every 5 sessions
    if ((index + 1) % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Update dashboard statistics
  console.log('\n📈 Updating dashboard statistics...');
  await supabase.rpc('update_dashboard_statistics');
  
  console.log('\n🎉 RECOMPUTATION COMPLETE!');
  console.log('=========================');
  console.log(`✅ Processed: ${processed + 1}`); // +1 for current session
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${sessions?.length}`);
  console.log('\n🔄 Refresh your results page to see the enhanced scoring!');
}

// Execute immediately
recomputeAll().catch(console.error);

export {};