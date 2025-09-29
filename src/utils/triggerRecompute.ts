import { invokeEdge } from '@/lib/edge-functions';

export async function triggerRecompute() {
  console.log('🚀 Starting recompute process...');
  
  try {
    const response = await invokeEdge('recompute-completed-248', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 100,
        dry_run: false
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Recompute failed:', response.status, errorText);
      return { success: false, error: errorText };
    }
    
    const result = await response.json();
    console.log('✅ Recompute completed successfully!');
    console.log('📊 Results:', result);
    
    return { success: true, data: result };
    
  } catch (error) {
    console.error('❌ Recompute error:', error);
    return { success: false, error: error.message };
  }
}

// Auto-trigger on import for immediate execution
if (typeof window !== 'undefined') {
  triggerRecompute();
}