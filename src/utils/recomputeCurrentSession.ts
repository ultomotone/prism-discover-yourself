import { admin as supabase } from '../../supabase/admin';

const sessionId = '76d52e00-3d17-424d-86ee-949a8e8ea8a3';

console.log(`🔄 Recomputing current session: ${sessionId}`);

supabase.functions.invoke('enhanced-score-engine', {
  body: { session_id: sessionId }
})
.then(({ data, error }) => {
  if (error) {
    console.error('❌ Recomputation failed:', error);
  } else {
    console.log('✅ Session recomputed successfully!', data);
    console.log('🔄 Refresh the page to see updated results');
  }
})
.catch(console.error);