import { admin as supabase } from '../../supabase/admin';

// Execute full recomputation immediately
console.log('🚀 Triggering full recomputation of all sessions...');

supabase.functions.invoke('recompute-all-sessions', {
  body: {}
})
.then(({ data, error }) => {
  if (error) {
    console.error('❌ Recomputation failed:', error);
  } else {
    console.log('✅ Recomputation completed successfully!');
    console.log('📊 Results:', data);
    console.log('🔄 Refresh your results page to see the updated enhanced scoring!');
  }
})
.catch((e) => {
  console.error('💥 Recomputation error:', e);
});

export {};