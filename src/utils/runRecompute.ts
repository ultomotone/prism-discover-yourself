// Quick trigger to recompute all sessions immediately
import { recomputeAllSessions } from './recomputeAllSessions';

console.log('🚀 STARTING IMMEDIATE RECOMPUTATION OF ALL SESSIONS');
console.log('================================================');

recomputeAllSessions()
  .then((result) => {
    console.log('\n🎉 RECOMPUTATION COMPLETED!');
    console.log('============================');
    console.log(`✅ Successfully processed: ${result.processed}/${result.total} sessions`);
    
    if (result.failed && result.failed.length > 0) {
      console.log(`⚠️  Failed sessions: ${result.failed.length}`);
      console.log('Failed session IDs:', result.failed);
    } else {
      console.log('🔥 All sessions processed successfully!');
    }
    
    console.log('\n📊 Your results should now show:');
    console.log('• Real distance-based softmax scores (not uniform 6.3%)');
    console.log('• Varied fit scores (not flat 85 for all types)');
    console.log('• Proper confidence calculations');
    console.log('• Enhanced per-type and per-function data');
  })
  .catch((error) => {
    console.error('💥 RECOMPUTATION FAILED:', error);
  });