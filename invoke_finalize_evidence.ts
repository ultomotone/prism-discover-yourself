import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gnkuikentdtnatazeriu.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function invokeFinalizeEvidence() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  
  console.log('EVIDENCE: Invoking finalizeAssessment for session:', sessionId);
  console.log('EVIDENCE: FC Version:', fcVersion);
  
  try {
    // Call finalizeAssessment function with fc_version parameter
    const { data, error } = await supabase.functions.invoke('finalizeAssessment', {
      body: { 
        session_id: sessionId,
        fc_version: fcVersion
      }
    });

    if (error) {
      console.error('finalizeAssessment error:', error);
      return { success: false, error };
    }

    console.log('finalizeAssessment response:', JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (err) {
    console.error('Exception during finalizeAssessment:', err);
    return { success: false, error: err };
  }
}

// Execute
invokeFinalizeEvidence()
  .then(result => {
    console.log('=== FINALIZE EVIDENCE RESULT ===');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error('=== FINALIZE EVIDENCE ERROR ===');
    console.error(err);
  });