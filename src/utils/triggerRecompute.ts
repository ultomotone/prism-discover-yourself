import { invokeEdge } from '@/lib/edge-functions';

export async function triggerRecompute() {
  console.warn('⚠️ Client-side recompute disabled. Use server-side call with service role key.');
  
  // Admin functions should only be called server-side with proper authentication
  // To call this function properly, use:
  // curl -X POST https://gnkuikentdtnatazeriu.functions.supabase.co/recompute-completed-248 \
  //   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  //   -H "Content-Type: application/json" \
  //   -d '{"limit": 100, "dry_run": false}'
  
  return { 
    success: false, 
    error: 'Admin function requires server-side call with service role key authentication' 
  };
}