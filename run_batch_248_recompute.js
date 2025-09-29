// Run full batch recompute for all sessions with 248+ questions and emails
const { createClient } = require('@supabase/supabase-js');

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(
  'https://gnkuikentdtnatazeriu.supabase.co',
  SERVICE_ROLE_KEY
);

async function runFullBatchRecompute() {
  console.log('🚀 Running Full Batch Recompute for 248+ Questions');
  console.log('=================================================');
  console.log('⚠️  This will recompute ALL completed sessions with 248+ questions and emails');
  console.log('⏰ This may take several minutes...\n');
  
  try {
    // Run the batch recompute
    const { data, error } = await supabase.functions.invoke('recompute-completed-248', {
      body: { 
        limit: 1000,  // Process up to 1000 sessions
        dry_run: false
      }
    });
    
    if (error) {
      console.error('❌ Batch recompute failed:', error);
      return false;
    }
    
    console.log('✅ Batch recompute completed!');
    console.log('📊 Results:', {
      total_scanned: data.scanned,
      successful: data.ok,
      failed: data.fail,
      success_rate: `${Math.round((data.ok / (data.ok + data.fail)) * 100)}%`
    });
    
    if (data.failed_sessions?.length > 0) {
      console.log('⚠️  Failed sessions (first 10):', data.failed_sessions);
    }
    
    if (data.successful_sessions?.length > 0) {
      console.log('✅ Sample successful sessions:', data.successful_sessions.slice(0, 5));
    }
    
    // Verify some results were created
    console.log('\n🔍 Verifying results in database...');
    const { data: countCheck } = await supabase
      .from('scoring_results')
      .select('session_id', { count: 'exact' })
      .gte('computed_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Last 10 minutes
      
    console.log(`📈 New scoring results created: ${countCheck?.length || 0}`);
    
    // Check profiles table too
    const { data: profilesCheck } = await supabase
      .from('profiles')
      .select('session_id', { count: 'exact' })
      .eq('results_version', 'v1.2.1')
      .gte('computed_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());
      
    console.log(`👤 Profiles updated: ${profilesCheck?.length || 0}`);
    
    return true;
    
  } catch (err) {
    console.error('💥 Batch recompute failed with exception:', err);
    return false;
  }
}

// Confirmation prompt
console.log('⚠️  WARNING: This will recompute potentially hundreds of assessment sessions.');
console.log('   This operation cannot be undone and will use significant resources.');
console.log('   Make sure you have tested the system first with test_fixed_recompute.js\n');

// Run with a small delay to let user read the warning
setTimeout(() => {
  runFullBatchRecompute().then(success => {
    if (success) {
      console.log('\n🎉 Batch recompute completed successfully!');
      console.log('💫 All completed sessions with 248+ questions should now show up in user accounts.');
    } else {
      console.log('\n❌ Batch recompute failed. Please check the errors above.');
    }
  });
}, 2000);