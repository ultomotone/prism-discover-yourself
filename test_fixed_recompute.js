// Test fixed recompute system with service role key
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

async function testFixedRecompute() {
  console.log('🧪 Testing fixed recompute system...');
  console.log('==================================');
  
  const sessionId = '76d52e00-3d17-424d-86ee-949a8e8ea8a3';
  
  try {
    // Test single session recomputation (dry run first)
    console.log('🔍 Testing single session recomputation (dry run)...');
    const { data: dryData, error: dryError } = await supabase.functions.invoke('recompute-session', {
      body: { 
        session_id: sessionId,
        dry_run: true
      }
    });
    
    if (dryError) {
      console.error('❌ Dry run failed:', dryError);
      return false;
    } else {
      console.log('✅ Dry run success:', dryData);
    }
    
    // Test actual recomputation
    console.log('\n🔥 Running actual recomputation...');
    const { data: actualData, error: actualError } = await supabase.functions.invoke('recompute-session', {
      body: { 
        session_id: sessionId,
        dry_run: false
      }
    });
    
    if (actualError) {
      console.error('❌ Actual recompute failed:', actualError);
      return false;
    } else {
      console.log('✅ Actual recompute success:', actualData);
    }
    
    // Check if results were created
    console.log('\n📊 Checking scoring_results table...');
    const { data: resultsCheck } = await supabase
      .from('scoring_results')
      .select('session_id, scoring_version, computed_at')
      .eq('session_id', sessionId)
      .order('computed_at', { ascending: false })
      .limit(1);
      
    if (resultsCheck?.[0]) {
      console.log('✅ New scoring result found:', {
        session_id: resultsCheck[0].session_id,
        scoring_version: resultsCheck[0].scoring_version,
        computed_at: resultsCheck[0].computed_at
      });
    } else {
      console.log('⚠️  No scoring results found in table');
    }

    // Test the new batch function for 248+ questions (dry run)
    console.log('\n🔍 Testing batch recompute for 248+ questions (dry run)...');
    const { data: batchData, error: batchError } = await supabase.functions.invoke('recompute-completed-248', {
      body: { 
        limit: 5,
        dry_run: true
      }
    });
    
    if (batchError) {
      console.error('❌ Batch 248 dry run failed:', batchError);
    } else {
      console.log('✅ Batch 248 dry run success:', batchData);
    }

    return true;
    
  } catch (err) {
    console.error('💥 Test failed with exception:', err);
    return false;
  }
}

// Run the test
testFixedRecompute().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! System is ready for batch recompute.');
    console.log('\n📝 To run full batch recompute:');
    console.log('   node run_batch_248_recompute.js');
  } else {
    console.log('\n❌ Tests failed. Please check the errors above.');
  }
});