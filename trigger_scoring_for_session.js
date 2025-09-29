// Quick script to trigger scoring for the problematic session
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gnkuikentdtnatazeriu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3Vpa2VudGR0bmF0YXplcml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI2MDQsImV4cCI6MjA2OTMwODYwNH0.wCk8ngoDqGW4bMIAjH5EttXsoBwdk4xnIViJZCezs-U'
);

async function triggerScoring() {
  console.log('🚀 Triggering scoring for session 76d52e00-3d17-424d-86ee-949a8e8ea8a3...');
  
  try {
    const { data, error } = await supabase.functions.invoke('force-score-session', {
      body: {
        session_id: '76d52e00-3d17-424d-86ee-949a8e8ea8a3'
      }
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Scoring result:', data);
    
    // Wait a bit and then check if profile was created
    console.log('⏳ Waiting 3 seconds for scoring to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('session_id, type_code, computed_at')
      .eq('session_id', '76d52e00-3d17-424d-86ee-949a8e8ea8a3')
      .maybeSingle();
      
    if (profileError) {
      console.error('❌ Profile check error:', profileError);
      return;
    }
    
    if (profileCheck) {
      console.log('✅ Profile created successfully!', profileCheck);
    } else {
      console.log('⚠️ No profile found yet, scoring may still be in progress...');
    }
    
  } catch (error) {
    console.error('❌ Trigger error:', error);
  }
}

triggerScoring();