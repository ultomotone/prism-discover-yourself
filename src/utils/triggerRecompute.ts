// Simple trigger script for recomputing all sessions
import { recomputeAllSessions } from './recomputeAllSessions';

async function main() {
  console.log('🚀 Triggering recompute of all sessions...');
  const result = await recomputeAllSessions();
  
  if (result.success) {
    console.log(`🎉 Successfully processed ${result.processed}/${result.total} sessions`);
    if (result.failed && result.failed.length > 0) {
      console.warn(`⚠️  ${result.failed.length} sessions failed to recompute`);
    }
  } else {
    console.error('❌ Recompute failed:', result.error);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as triggerRecompute };