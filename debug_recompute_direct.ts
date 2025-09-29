// Debug recompute function directly
import { supabase } from './src/integrations/supabase/client';

console.log('🐛 Testing recompute-session directly...');

// Test with the user's specific session  
supabase.functions.invoke('recompute-session', {
  body: { 
    session_id: '76d52e00-3d17-424d-86ee-949a8e8ea8a3',
    dry_run: true
  }
})
.then(({ data, error }) => {
  console.log('📊 Recompute session result:');
  console.log('Data:', data);
  console.log('Error:', error);
  
  if (error) {
    console.error('❌ Function error details:', JSON.stringify(error, null, 2));
  }
})
.catch(error => {
  console.error('💥 Exception caught:', error);
});

export {};