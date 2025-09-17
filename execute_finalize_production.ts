// PHASE 2: Execute finalizeAssessment in production with evidence collection

const SUPABASE_URL = 'https://gnkuikentdtnatazeriu.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

async function executeFinalizeAssessmentProduction() {
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  const fcVersion = 'v1.2';
  
  console.log('🚀 PHASE 2: finalizeAssessment Production Invocation');
  console.log('Session ID:', sessionId);
  console.log('FC Version:', fcVersion);
  console.log('Environment: Production');
  
  try {
    // Direct HTTP call to finalizeAssessment function using service role
    const response = await fetch(`${SUPABASE_URL}/functions/v1/finalizeAssessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        session_id: sessionId,
        fc_version: fcVersion
      })
    });

    console.log('📡 HTTP Response Status:', response.status);
    console.log('📡 HTTP Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ finalizeAssessment HTTP error:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        status: response.status
      };
    }

    const data = await response.json();
    console.log('✅ finalizeAssessment response received');
    console.log('Response structure:', Object.keys(data));
    
    // Log key response elements (without exposing sensitive data)
    if (data.results_url) {
      console.log('✅ Results URL present:', data.results_url.length + ' characters');
    }
    
    if (data.share_token) {
      console.log('✅ Share token present:', data.share_token.length + ' characters');
    }
    
    if (data.session_id) {
      console.log('✅ Session ID confirmed:', data.session_id === sessionId);
    }

    return {
      success: true,
      data: data,
      status: response.status
    };
    
  } catch (error) {
    console.error('❌ Exception during finalizeAssessment:', error);
    return {
      success: false,
      error: error.message,
      status: null
    };
  }
}

// Execute and return results
executeFinalizeAssessmentProduction()
  .then(result => {
    console.log('\n🏁 PHASE 2 EXECUTION RESULT:');
    console.log('Success:', result.success);
    console.log('HTTP Status:', result.status);
    
    if (result.success) {
      console.log('✅ finalizeAssessment completed successfully');
      console.log('📄 Response saved for Phase 3 verification');
    } else {
      console.log('❌ finalizeAssessment failed');
      console.log('Error:', result.error);
    }
    
    return result;
  })
  .catch(error => {
    console.error('💥 PHASE 2 CRITICAL FAILURE:', error);
    process.exit(1);
  });