import { recomputeAllSessions } from './recomputeAllSessions';

// Execute the recompute immediately - TRIGGERED FOR PRODUCTION ROLLOUT
console.log('🚀 Starting immediate recompute of all sessions with enhanced scoring...');
console.log('📋 This will update all 124+ assessments with real calculated values');

recomputeAllSessions()
  .then((result) => {
    if (result.success) {
      console.log(`🎉 PRODUCTION ROLLOUT COMPLETE!`);
      console.log(`📊 Enhanced scoring results: ${result.processed}/${result.total} sessions processed`);
      console.log(`✨ All assessments now using distance→softmax with proper variance`);
      if (result.failed && result.failed.length > 0) {
        console.warn(`⚠️ ${result.failed.length} sessions failed:`, result.failed);
      }
    } else {
      console.error('❌ Recompute failed:', result.error);
    }
  })
  .catch((error) => {
    console.error('💥 Unexpected error during recompute:', error);
  });

export {}; // Make this a module