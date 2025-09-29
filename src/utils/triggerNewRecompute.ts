// Trigger the new two-pass recomputation system
import { supabase } from '@/integrations/supabase/client';

console.log('🚀 Starting new two-pass recomputation system...');
console.log('==================================================');

// First do a small dry run to test
console.log('🔍 Running dry run on first 5 sessions...');

supabase.functions.invoke('recompute-batch', {
  body: { 
    limit: 5, 
    dry_run: true 
  }
})
.then(({ data, error }) => {
  if (error) {
    console.error('❌ Dry run failed:', error);
    return;
  }
  
  console.log('✅ Dry run completed successfully!');
  console.log('📊 Dry run results:', data);
  
  // Now run the full recomputation
  console.log('\n🔥 Starting full recomputation...');
  
  return supabase.functions.invoke('recompute-batch', {
    body: { 
      limit: 500, 
      dry_run: false 
    }
  });
})
.then(({ data, error }) => {
  if (error) {
    console.error('❌ Full recomputation failed:', error);
    return;
  }
  
  console.log('\n🎉 RECOMPUTATION COMPLETED!');
  console.log('============================');
  console.log(`✅ Sessions processed: ${data?.scanned || 0}`);
  console.log(`✅ Successful: ${data?.ok || 0}`);
  console.log(`❌ Failed: ${data?.fail || 0}`);
  
  console.log('\n📊 Your results should now show:');
  console.log('• Normalized response values in assessment_responses');
  console.log('• Updated unified scoring results');
  console.log('• Consistent scoring across all sessions');
})
.catch((error) => {
  console.error('💥 RECOMPUTATION ERROR:', error);
});

export {};