// Test single session recomputation
import { supabase } from './src/integrations/supabase/client';

console.log('🧪 Testing single session recomputation...');

supabase.functions.invoke('recompute-session', {
  body: { 
    session_id: '76d52e00-3d17-424d-86ee-949a8e8ea8a3',
    dry_run: false
  }
})
.then(({ data, error }) => {
  if (error) {
    console.error('❌ Recompute failed:', error);
  } else {
    console.log('✅ Recompute success:', data);
  }
})
.catch(error => {
  console.error('💥 Exception:', error);
});

export {};