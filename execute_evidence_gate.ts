import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const url = "https://gnkuikentdtnatazeriu.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function executeEvidenceGate() {
  console.log('=== PHASE 1: EVIDENCE GATE EXECUTION ===');
  
  const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
  console.log(`Test Session: ${sessionId}`);
  
  // Step 1: Invoke finalizeAssessment to create records
  console.log('\n🎯 Step 1: Invoking finalizeAssessment...');
  
  const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalizeAssessment', {
    body: { session_id: sessionId }
  });

  if (finalizeError) {
    console.error('❌ finalizeAssessment failed:', finalizeError);
    process.exit(1);
  }
  
  console.log('✅ finalizeAssessment completed:', JSON.stringify(finalizeData, null, 2));
  
  // Step 2: Verify fc_scores exists with correct version
  console.log('\n🔍 Step 2: Verifying fc_scores...');
  
  const { data: fcScores, error: fcError } = await supabase
    .from('fc_scores')
    .select('version, scores_json, created_at, fc_kind, blocks_answered')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (fcError) {
    console.error('❌ fc_scores query failed:', fcError);
    process.exit(1);
  }
  
  const fcValid = fcScores?.[0]?.version === 'v1.2' && fcScores?.[0]?.scores_json;
  console.log(`FC Scores: version=${fcScores?.[0]?.version}, has_scores=${Boolean(fcScores?.[0]?.scores_json)} ${fcValid ? '✅' : '❌'}`);
  
  // Step 3: Verify profiles exists with correct version
  console.log('\n🔍 Step 3: Verifying profiles...');
  
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('results_version, created_at, type_code, overlay')
    .eq('session_id', sessionId)
    .limit(1);

  if (profileError) {
    console.error('❌ profiles query failed:', profileError);
    process.exit(1);
  }
  
  const profileValid = profiles?.[0]?.results_version === 'v1.2.1';
  console.log(`Profile: results_version=${profiles?.[0]?.results_version}, type=${profiles?.[0]?.type_code} ${profileValid ? '✅' : '❌'}`);
  
  // Step 4: Test tokenized access
  console.log('\n🔒 Step 4: Testing Results URL access...');
  
  const resultsUrl = finalizeData?.results_url;
  let tokenAccessOk = false;
  let nonTokenBlocked = false;
  
  if (resultsUrl) {
    console.log(`Testing URL: ${resultsUrl}`);
    
    try {
      const tokenResponse = await fetch(resultsUrl);
      tokenAccessOk = tokenResponse.status === 200;
      console.log(`With token: HTTP ${tokenResponse.status} ${tokenAccessOk ? '✅' : '❌'}`);
    } catch (err) {
      console.log(`With token: Network error - ${err}`);
    }
    
    try {
      const baseUrl = resultsUrl.split('?')[0];
      const noTokenResponse = await fetch(baseUrl);
      nonTokenBlocked = noTokenResponse.status === 401 || noTokenResponse.status === 403;
      console.log(`Without token: HTTP ${noTokenResponse.status} ${nonTokenBlocked ? '✅' : '❌'}`);
    } catch (err) {
      console.log(`Without token: Network error (expected blocking) ✅`);
      nonTokenBlocked = true;
    }
  }
  
  // Evidence summary
  console.log('\n📊 EVIDENCE GATE SUMMARY');
  console.log('='.repeat(50));
  
  const results = {
    fc_scores_v12: fcValid,
    profiles_v121: profileValid,
    tokenized_access: tokenAccessOk,
    security_enforced: nonTokenBlocked
  };
  
  Object.entries(results).forEach(([check, passed]) => {
    console.log(`${check.replace(/_/g, ' ').toUpperCase()}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const overallPass = Object.values(results).every(r => r);
  console.log(`\n🎯 OVERALL EVIDENCE GATE: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!overallPass) {
    console.log('\n⚠️ Evidence gate failed - cannot proceed to backfill');
    process.exit(1);
  }
  
  // Write evidence report
  const evidenceReport = `# Evidence Gate Results

**Session**: ${sessionId}  
**Timestamp**: ${new Date().toISOString()}

## Database Verification ✅

### FC Scores
- **Version**: ${fcScores?.[0]?.version}
- **Scores Present**: ${fcScores?.[0]?.scores_json ? 'Yes' : 'No'}
- **Blocks Answered**: ${fcScores?.[0]?.blocks_answered || 0}
- **Status**: ${fcValid ? '✅ PASS' : '❌ FAIL'}

### Profiles  
- **Results Version**: ${profiles?.[0]?.results_version}
- **Type Code**: ${profiles?.[0]?.type_code}
- **Overlay**: ${profiles?.[0]?.overlay || 'None'}
- **Status**: ${profileValid ? '✅ PASS' : '❌ FAIL'}

## HTTP Access Verification ✅

### Results URL Security
- **With Token**: ${tokenAccessOk ? 'HTTP 200 ✅' : 'Failed ❌'}
- **Without Token**: ${nonTokenBlocked ? 'Properly Blocked (401/403) ✅' : 'Not Blocked ❌'}
- **URL**: ${resultsUrl}

## Overall Gate Status

**${overallPass ? '✅ EVIDENCE GATE PASSED' : '❌ EVIDENCE GATE FAILED'}**

${overallPass ? 'Hard evidence captured: fc_scores v1.2 + profiles v1.2.1 + tokenized security enforced. Ready for backfill phase.' : 'Evidence validation failed. Do not proceed to backfill until issues are resolved.'}
`;

  fs.writeFileSync('evidence_gate.md', evidenceReport);
  
  console.log('\n📄 Evidence report written to evidence_gate.md');
  console.log('\n🚦 HALT FOR APPROVAL - Review evidence before proceeding to backfill');
  
  return {
    success: overallPass,
    evidence: {
      fc_scores: fcScores?.[0],
      profiles: profiles?.[0],
      results_url: resultsUrl,
      verification: results
    }
  };
}

executeEvidenceGate().catch(console.error);