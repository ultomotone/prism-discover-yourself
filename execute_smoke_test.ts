// Manual execution of FC smoke test
import { supabase } from "@/integrations/supabase/client";

const testSession1 = '618c5ea6-aeda-4084-9156-0aac9643afd3';
const testSession2 = '070d9bf2-516f-44ee-87fc-017c7db9d29c';

console.log('🚀 FC SMOKE TEST EXECUTION');
console.log('===========================');

// Test session 1
console.log(`\n🧪 Testing session: ${testSession1.substring(0,8)}...`);

async function testSession(sessionId: string) {
  try {
    console.log(`  🎯 Invoking score_fc_session for ${sessionId.substring(0,8)}...`);
    
    const { data, error } = await supabase.functions.invoke('score_fc_session', {
      body: {
        session_id: sessionId,
        basis: 'functions',
        version: 'v1.2'
      }
    });
    
    if (error) {
      console.log(`  ❌ Error:`, error);
      return false;
    }
    
    console.log(`  ✅ Response:`, data);
    return true;
    
  } catch (err) {
    console.log(`  ❌ Exception:`, err);
    return false;
  }
}

// Execute tests
Promise.all([
  testSession(testSession1),
  testSession(testSession2)
]).then(results => {
  const passed = results.filter(Boolean).length;
  console.log(`\n📊 Results: ${passed}/${results.length} passed`);
});