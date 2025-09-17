import { admin as supabase } from './supabase/admin.js';
import { writeFileSync } from 'fs';

// Environment check
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

interface StagingMetrics {
  timestamp: string;
  monitoring_window_hours: number;
  version_overrides: {
    count: number;
    sessions: string[];
    status: 'PASS' | 'FAIL';
  };
  legacy_fc_usage: {
    count: number;
    sessions: string[];
    status: 'PASS' | 'FAIL';
  };
  tokenized_results: {
    tested_count: number;
    success_count: number;
    failure_count: number;
    status: 'PASS' | 'FAIL';
  };
  conversion_rate: {
    completed_sessions: number;
    profiles_created: number;
    rate_percent: number;
    baseline_rate_percent: number;
    status: 'PASS' | 'FAIL';
  };
  overall_status: 'PASS' | 'FAIL';
}

async function runStagingSoak() {
  console.log('📊 STAGING SOAK — 6h (Read-only)');
  console.log('Timestamp:', new Date().toISOString());
  
  const monitoringWindow = 6; // hours
  const windowStart = new Date(Date.now() - (monitoringWindow * 60 * 60 * 1000));
  
  console.log(`⏰ Monitoring window: ${windowStart.toISOString()} to ${new Date().toISOString()}`);
  
  try {
    const metrics: StagingMetrics = {
      timestamp: new Date().toISOString(),
      monitoring_window_hours: monitoringWindow,
      version_overrides: { count: 0, sessions: [], status: 'PASS' },
      legacy_fc_usage: { count: 0, sessions: [], status: 'PASS' },
      tokenized_results: { tested_count: 0, success_count: 0, failure_count: 0, status: 'PASS' },
      conversion_rate: { completed_sessions: 0, profiles_created: 0, rate_percent: 0, baseline_rate_percent: 85, status: 'PASS' },
      overall_status: 'PASS'
    };
    
    console.log('🔍 Checking version overrides...');
    // Check for engine version overrides in recent profiles
    const { data: recentProfiles } = await supabase
      .from('profiles')
      .select('session_id, results_version, version')
      .gte('created_at', windowStart.toISOString())
      .neq('results_version', 'v1.2.1');
    
    if (recentProfiles && recentProfiles.length > 0) {
      metrics.version_overrides.count = recentProfiles.length;
      metrics.version_overrides.sessions = recentProfiles.map(p => p.session_id);
      metrics.version_overrides.status = 'FAIL';
      console.log(`❌ Found ${recentProfiles.length} version overrides`);
    } else {
      console.log('✅ No version overrides found');
    }
    
    console.log('🔍 Checking legacy FC usage...');
    // Check for legacy FC source usage
    const { data: legacyFcScores } = await supabase
      .from('fc_scores')
      .select('session_id, fc_kind')
      .gte('created_at', windowStart.toISOString())
      .neq('fc_kind', 'functions');
    
    if (legacyFcScores && legacyFcScores.length > 0) {
      metrics.legacy_fc_usage.count = legacyFcScores.length;
      metrics.legacy_fc_usage.sessions = legacyFcScores.map(fc => fc.session_id);
      metrics.legacy_fc_usage.status = 'FAIL';
      console.log(`❌ Found ${legacyFcScores.length} legacy FC usages`);
    } else {
      console.log('✅ No legacy FC usage found');
    }
    
    console.log('🔍 Testing tokenized results access...');
    // Test tokenized results access
    const { data: testSessions } = await supabase
      .from('assessment_sessions')
      .select('id, share_token')
      .eq('status', 'completed')
      .gte('created_at', windowStart.toISOString())
      .not('share_token', 'is', null)
      .limit(5);
    
    let successCount = 0;
    let failureCount = 0;
    
    if (testSessions) {
      for (const session of testSessions) {
        try {
          // Test RPC call to get_profile_by_session with token
          const { data, error } = await supabase.rpc('get_profile_by_session', {
            p_session_id: session.id,
            p_share_token: session.share_token
          });
          
          if (data && !error) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          failureCount++;
        }
      }
    }
    
    metrics.tokenized_results.tested_count = testSessions?.length || 0;
    metrics.tokenized_results.success_count = successCount;
    metrics.tokenized_results.failure_count = failureCount;
    metrics.tokenized_results.status = failureCount === 0 ? 'PASS' : 'FAIL';
    
    console.log(`📊 Tokenized results: ${successCount}/${testSessions?.length || 0} successful`);
    
    console.log('🔍 Checking conversion rate...');
    // Check conversion rate (completed sessions to profiles created)
    const { data: completedSessions } = await supabase
      .from('assessment_sessions')
      .select('id')
      .eq('status', 'completed')
      .gte('created_at', windowStart.toISOString());
    
    const { data: createdProfiles } = await supabase
      .from('profiles')
      .select('session_id')
      .gte('created_at', windowStart.toISOString());
    
    const completedCount = completedSessions?.length || 0;
    const profilesCount = createdProfiles?.length || 0;
    const conversionRate = completedCount > 0 ? (profilesCount / completedCount) * 100 : 0;
    
    metrics.conversion_rate.completed_sessions = completedCount;
    metrics.conversion_rate.profiles_created = profilesCount;
    metrics.conversion_rate.rate_percent = Math.round(conversionRate * 10) / 10;
    metrics.conversion_rate.status = conversionRate >= metrics.conversion_rate.baseline_rate_percent ? 'PASS' : 'FAIL';
    
    console.log(`📊 Conversion rate: ${conversionRate.toFixed(1)}% (${profilesCount}/${completedCount})`);
    
    // Overall status
    const allChecks = [
      metrics.version_overrides.status,
      metrics.legacy_fc_usage.status, 
      metrics.tokenized_results.status,
      metrics.conversion_rate.status
    ];
    metrics.overall_status = allChecks.every(status => status === 'PASS') ? 'PASS' : 'FAIL';
    
    // Generate observability report
    const report = `# Staging Observability Report

**Generated**: ${metrics.timestamp}
**Monitoring Window**: ${monitoringWindow} hours (${windowStart.toISOString()} to ${new Date().toISOString()})
**Overall Status**: ${metrics.overall_status === 'PASS' ? '✅ PASS' : '❌ FAIL'}

## Metrics Summary

### 1. Version Overrides Check ${metrics.version_overrides.status === 'PASS' ? '✅' : '❌'}
- **Expected**: 0 engine version overrides in recent profiles
- **Actual**: ${metrics.version_overrides.count} overrides found
- **Status**: ${metrics.version_overrides.status}
${metrics.version_overrides.count > 0 ? `- **Sessions**: ${metrics.version_overrides.sessions.slice(0, 5).join(', ')}${metrics.version_overrides.sessions.length > 5 ? '...' : ''}` : ''}

### 2. FC Source Distribution Check ${metrics.legacy_fc_usage.status === 'PASS' ? '✅' : '❌'}
- **Expected**: All fc_scores should use fc_kind='functions' (no legacy sources)
- **Actual**: ${metrics.legacy_fc_usage.count} legacy usages found
- **Status**: ${metrics.legacy_fc_usage.status}
${metrics.legacy_fc_usage.count > 0 ? `- **Sessions**: ${metrics.legacy_fc_usage.sessions.slice(0, 5).join(', ')}${metrics.legacy_fc_usage.sessions.length > 5 ? '...' : ''}` : ''}

### 3. Tokenized Results Access Check ${metrics.tokenized_results.status === 'PASS' ? '✅' : '❌'}
- **Expected**: Tokenized access should work for all sessions
- **Tested**: ${metrics.tokenized_results.tested_count} sessions
- **Successful**: ${metrics.tokenized_results.success_count}
- **Failed**: ${metrics.tokenized_results.failure_count}
- **Status**: ${metrics.tokenized_results.status}

### 4. Conversion Health Check ${metrics.conversion_rate.status === 'PASS' ? '✅' : '❌'}
- **Expected**: ≥${metrics.conversion_rate.baseline_rate_percent}% conversion rate (completed sessions → profiles)
- **Actual**: ${metrics.conversion_rate.rate_percent}% (${metrics.conversion_rate.profiles_created}/${metrics.conversion_rate.completed_sessions})
- **Status**: ${metrics.conversion_rate.status}

## Detailed Analysis

### Performance Metrics
- **Completed Sessions**: ${metrics.conversion_rate.completed_sessions}
- **Profiles Created**: ${metrics.conversion_rate.profiles_created}
- **Conversion Rate**: ${metrics.conversion_rate.rate_percent}%

### Quality Metrics
- **Version Consistency**: ${metrics.version_overrides.count === 0 ? 'Excellent' : 'Issues detected'}
- **FC Pipeline Health**: ${metrics.legacy_fc_usage.count === 0 ? 'Excellent' : 'Legacy usage detected'}
- **Results Access**: ${metrics.tokenized_results.failure_count === 0 ? 'Excellent' : 'Access issues detected'}

## Recommendations

${metrics.overall_status === 'PASS' ? `
🎉 **GO for Production**: All metrics are within acceptable ranges.

### Next Steps:
1. ✅ Staging soak complete
2. ⏳ **PROD HEALTH**: Check for additional sessions needing backfill
3. ⏳ **PRODUCTION ROLLOUT**: Apply changes to production environment
` : `
🛑 **NO-GO for Production**: Critical issues detected.

### Issues to Address:
${metrics.version_overrides.status === 'FAIL' ? '- Fix version override issues in scoring pipeline\n' : ''}${metrics.legacy_fc_usage.status === 'FAIL' ? '- Investigate legacy FC source usage\n' : ''}${metrics.tokenized_results.status === 'FAIL' ? '- Fix tokenized results access problems\n' : ''}${metrics.conversion_rate.status === 'FAIL' ? '- Investigate low conversion rate\n' : ''}

### Required Actions:
1. 🔧 Address critical issues above
2. 🔄 Re-run staging soak after fixes
3. ⏸️ Hold production deployment
`}

## Raw Data

\`\`\`json
${JSON.stringify(metrics, null, 2)}
\`\`\`

---
*Generated at ${new Date().toISOString()}*
*Monitoring window: ${monitoringWindow} hours*
`;
    
    writeFileSync('staging_observability.md', report);
    
    console.log('\n🎯 STAGING SOAK COMPLETE');
    console.log(`📊 Overall Status: ${metrics.overall_status}`);
    console.log(`📁 Report: staging_observability.md`);
    console.log('\n⏸️  HALTING FOR PROD GO/NO-GO DECISION');
    
    return {
      success: true,
      status: metrics.overall_status,
      metrics: metrics,
      report_file: 'staging_observability.md'
    };
    
  } catch (error) {
    console.error('❌ Staging soak failed:', error);
    
    const errorReport = `# Staging Observability Report - FAILED

**Error**: ${error}
**Timestamp**: ${new Date().toISOString()}

## Failure Details

The staging observability monitoring encountered a critical error and could not complete.

## Next Steps

1. Review error details above
2. Fix monitoring infrastructure issues  
3. Re-run staging soak
4. Hold production deployment until resolved

---
*Generated at ${new Date().toISOString()}*
`;
    
    writeFileSync('staging_observability.md', errorReport);
    
    return {
      success: false,
      status: 'FAIL',
      error: error,
      report_file: 'staging_observability.md'
    };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStagingSoak().then(result => {
    console.log('\n📋 RESULT:', result.success ? 'SUCCESS' : 'FAILED');
    console.log('📊 STATUS:', result.status);
    process.exit(result.success && result.status === 'PASS' ? 0 : 1);
  });
}

export { runStagingSoak };