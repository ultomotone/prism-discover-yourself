// Temporary test script to trigger recompute
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gnkuikentdtnatazeriu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczMjYwNCwiZXhwIjoyMDY5MzA4NjA0fQ.aKVaHcrhDdQP9X0e_dZrhfrKDPWqhmKKfWNkCWjJLTM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function forceRecompute() {
  try {
    const { data, error } = await supabase.functions.invoke('force-recompute-session', {
      body: { 
        session_id: '11652dac-e085-4dd6-85f6-b9a660932345',
        force_recompute: true
      }
    });
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

forceRecompute();