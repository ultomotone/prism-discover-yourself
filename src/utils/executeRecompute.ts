import { recomputeAllSessions } from './recomputeAllSessions';

// Execute the recompute immediately
console.log('🚀 Starting immediate recompute of all sessions...');

recomputeAllSessions()
  .then((result) => {
    if (result.success) {
      console.log(`🎉 Recompute completed successfully!`);
      console.log(`📊 Results: ${result.processed}/${result.total} sessions processed`);
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