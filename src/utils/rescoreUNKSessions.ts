import { admin as supabase } from '@/lib/supabase/admin';
import { rescoreSession } from './rescoreSession';

export async function rescoreSpecificSessions() {
  const sessionIds = [
    'e5694ee7-73e7-4786-ad0b-3d9899d327fb',
    '73ae2ff4-3a4e-4c1f-a6da-806b2ee2e44c'
  ];
  
  console.log('🔄 Rescoring specific UNK sessions...');
  
  const results = [];
  for (const sessionId of sessionIds) {
    console.log(`Rescoring ${sessionId}...`);
    const result = await rescoreSession(sessionId);
    results.push({ session_id: sessionId, ...result });
  }
  
  // Update dashboard statistics
  await supabase.rpc('update_dashboard_statistics');
  
  return { 
    success: true, 
    results,
    successCount: results.filter(r => r.success).length 
  };
}