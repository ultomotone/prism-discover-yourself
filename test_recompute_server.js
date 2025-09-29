// Server-side test for recompute functions using service role key
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

async function testRecomputeSystem() {
  console.log('🧪 Testing recompute system with service role key...');
  console.log('==================================================');
  
  const sessionId = '76d52e00-3d17-424d-86ee-949a8e8ea8a3';
  
  try {
    // Test single session recomputation (dry run)
    console.log('🔍 Testing single session recomputation (dry run)...');
    const { data: singleData, error: singleError } = await supabase.functions.invoke('recompute-session', {
      body: { 
        session_id: sessionId,
        dry_run: true
      }
    });
    
    if (singleError) {
      console.error('❌ Single session recompute failed:', singleError);
    } else {
      console.log('✅ Single session recompute success:', singleData);
    }
    
    // Test batch recomputation (dry run, small batch)
    console.log('\n🔍 Testing batch recomputation (dry run)...');
    const { data: batchData, error: batchError } = await supabase.functions.invoke('recompute-batch', {
      body: { 
        limit: 2,
        dry_run: true
      }
    });
    
    if (batchError) {
      console.error('❌ Batch recompute failed:', batchError);
    } else {
      console.log('✅ Batch recompute success:', batchData);
    }
    
    // Test actual recomputation for the specific session
    console.log('\n🔥 Running actual recomputation for your session...');
    const { data: actualData, error: actualError } = await supabase.functions.invoke('recompute-session', {
      body: { 
        session_id: sessionId,
        dry_run: false
      }
    });
    
    if (actualError) {
      console.error('❌ Actual recompute failed:', actualError);
    } else {
      console.log('✅ Actual recompute success:', actualData);
      
      // Check if results were created
      console.log('\n📊 Checking scoring_results table...');
      const { data: resultsCheck } = await supabase
        .from('scoring_results')
        .select('session_id, version, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (resultsCheck?.[0]) {
        console.log('✅ New scoring result found:', {
          session_id: resultsCheck[0].session_id,
          version: resultsCheck[0].version,
          created_at: resultsCheck[0].created_at
        });
      } else {
        console.log('⚠️  No new scoring results found in table');
      }
    }
    
  } catch (err) {
    console.error('💥 Test failed with exception:', err);
  }
}

// Run the test
testRecomputeSystem();