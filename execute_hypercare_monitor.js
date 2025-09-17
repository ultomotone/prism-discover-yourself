#!/usr/bin/env node

/**
 * Hypercare Monitor - 24h Post-Deployment Health Check
 * 
 * Monitors critical production metrics in the immediate post-deployment window:
 * - Engine version override events
 * - FC source integrity (legacy vs fc_scores)
 * - Finalize function health
 * - Results access security
 * - Conversion rate trends
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client
const supabaseUrl = 'https://gnkuikentdtnatazeriu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeHypercareMonitor() {
  console.log('🔍 HYPERCARE MONITOR - 24h Post-Deployment Check');
  console.log('📋 Engine v1.2.1, FC v1.2 - Production Health Assessment');
  console.log('=' * 60);

  // Ensure artifacts directory exists
  if (!fs.existsSync('artifacts')) {
    fs.mkdirSync('artifacts', { recursive: true });
  }

  try {
    // Call the hypercare monitor edge function
    console.log('📊 Executing hypercare monitoring via edge function...');
    
    const { data, error } = await supabase.functions.invoke('hypercare-monitor', {
      body: {}
    });

    if (error) {
      throw new Error(`Hypercare monitor failed: ${error.message}`);
    }

    console.log(`🎯 Hypercare Status: ${data.status}`);

    // Write the report to artifacts
    const reportPath = 'artifacts/hypercare_24h.md';
    fs.writeFileSync(reportPath, data.report);

    console.log('\n📋 Hypercare Summary:');
    console.log(`🔄 Engine Overrides: ${data.metrics.engine_version_overrides}`);
    console.log(`📊 FC Legacy Sources: ${data.metrics.fc_source_legacy}`);
    console.log(`🔧 Finalize Errors: ${data.metrics.finalize_errors}`);
    console.log(`📈 Conversion Rate: ${data.metrics.overall_conversion_rate.toFixed(1)}%`);
    console.log(`🎯 Status: ${data.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);

    if (data.metrics.anomalies.length > 0) {
      console.log('\n⚠️ Anomalies Detected:');
      data.metrics.anomalies.forEach(anomaly => console.log(`   ${anomaly}`));
      
      if (data.metrics.log_samples.length > 0) {
        console.log('\n📝 Sample Log Lines:');
        data.metrics.log_samples.forEach(log => console.log(`   ${log}`));
      }
    }

    console.log('\n📁 Artifacts Generated:');
    console.log(`   - ${reportPath}`);

    if (data.status === 'FAIL') {
      console.log('\n🚨 HYPERCARE FAILED - Immediate attention required');
      console.log('📋 Review artifacts/hypercare_24h.md for detailed analysis');
      process.exit(1);
    }

    console.log('\n✅ HYPERCARE PASSED - Production system is stable');
    console.log('📈 All critical indicators within expected ranges');
    console.log('🎯 Deployment v1.2.1 operating normally');

  } catch (error) {
    console.error('\n❌ HYPERCARE MONITOR FAILED');
    console.error('🔥 Error:', error.message);
    
    // Generate failure report
    const failureReport = `# Hypercare Monitor - FAILURE

**Timestamp**: ${new Date().toISOString()}
**Error**: ${error.message}
**Environment**: Production (gnkuikentdtnatazeriu)

## Failure Details

\`\`\`
${error.stack}
\`\`\`

## Recommended Actions

1. **Investigate Error**: Review the error details above
2. **Check System Health**: Verify Supabase connectivity and edge functions
3. **Manual Validation**: Manually check critical metrics if monitoring fails
4. **Escalate**: Contact on-call engineer if system issues persist

## Manual Validation Queries

\`\`\`sql
-- Check engine version overrides (expect 0)
SELECT results_version, COUNT(*) as count
FROM profiles 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY results_version;

-- Check FC source distribution (expect fc_kind='functions' only)
SELECT fc_kind, version, COUNT(*) as count
FROM fc_scores 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY fc_kind, version;

-- Check conversion rate (expect >= 89.2%)
WITH completed AS (
  SELECT COUNT(*) as ct FROM assessment_sessions
  WHERE status='completed' AND completed_at >= NOW() - INTERVAL '24 hours'
),
profiles AS (
  SELECT COUNT(*) as ct FROM profiles
  WHERE created_at >= NOW() - INTERVAL '24 hours'
)
SELECT 
  completed.ct as completed_sessions,
  profiles.ct as profiles_created,
  CASE WHEN completed.ct = 0 THEN 0.0
       ELSE ROUND((profiles.ct::numeric / completed.ct) * 100, 2)
  END as conversion_rate_percent
FROM completed, profiles;
\`\`\`

---
*Generated at ${new Date().toISOString()}*`;

    fs.writeFileSync('artifacts/hypercare_24h_failure.md', failureReport);
    
    console.error('📁 Failure report: artifacts/hypercare_24h_failure.md');
    process.exit(1);
  }
}

// Execute hypercare monitor
if (require.main === module) {
  executeHypercareMonitor().catch(console.error);
}

module.exports = { executeHypercareMonitor };