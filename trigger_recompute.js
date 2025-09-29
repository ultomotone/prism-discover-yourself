// Trigger recompute function
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gnkuikentdtnatazeriu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
);

async function triggerRecompute() {
  console.log('🚀 Triggering recompute function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('recompute-completed-248', {
      body: {
        limit: 100,
        dry_run: false
      }
    });
    
    if (error) {
      console.error('❌ Function error:', error);
      return;
    }
    
    console.log('✅ Recompute completed successfully!');
    console.log('📊 Results:', JSON.stringify(data, null, 2));
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

triggerRecompute();