import { admin as supabase } from './supabase/admin.js';
import { writeFileSync } from 'fs';

// Environment check
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

interface ProdHealthCheck {
  timestamp: string;
  discovery_window: string;
  sessions_analyzed: number;
  sessions_needing_backfill: {
    missing_profiles: string[];
    missing_fc_scores: string[];
    total_count: number;
  };
  backfill_plan_needed: boolean;
  recommended_actions: string[];
}

async function runProdHealthCheck() {
  console.log('🔍 PROD HEALTH (Optional quick check)');
  console.log('Timestamp:', new Date().toISOString());
  
  // Check for sessions since 2025-08-01 with responses but missing profiles/fc_scores
  const discoveryStart = '2025-08-01';
  
  console.log(`📊 Analyzing sessions since ${discoveryStart}...`);
  
  try {
    const healthCheck: ProdHealthCheck = {
      timestamp: new Date().toISOString(),
      discovery_window: `${discoveryStart} to present`,
      sessions_analyzed: 0,
      sessions_needing_backfill: {
        missing_profiles: [],
        missing_fc_scores: [],
        total_count: 0
      },
      backfill_plan_needed: false,
      recommended_actions: []
    };
    
    // Find completed sessions since Aug 1st with responses
    console.log('🔍 Finding completed sessions with responses...');
    const { data: sessionsWithResponses } = await supabase
      .from('assessment_sessions')
      .select(`
        id,
        created_at,
        status,
        completed_at,
        completed_questions
      `)
      .eq('status', 'completed')
      .gte('created_at', discoveryStart)
      .gt('completed_questions', 0);
    
    healthCheck.sessions_analyzed = sessionsWithResponses?.length || 0;
    console.log(`📊 Found ${healthCheck.sessions_analyzed} completed sessions with responses`);
    
    if (!sessionsWithResponses || sessionsWithResponses.length === 0) {
      console.log('✅ No sessions found to analyze');
      const report = generateHealthReport(healthCheck);
      writeFileSync('prod_health_check.md', report);
      return { success: true, healthCheck, needs_backfill: false };
    }
    
    const sessionIds = sessionsWithResponses.map(s => s.id);
    
    // Check for missing profiles
    console.log('🔍 Checking for missing profiles...');
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('session_id')
      .in('session_id', sessionIds);
    
    const existingProfileSessionIds = new Set(existingProfiles?.map(p => p.session_id) || []);
    const missingProfileSessions = sessionIds.filter(id => !existingProfileSessionIds.has(id));
    
    healthCheck.sessions_needing_backfill.missing_profiles = missingProfileSessions;
    console.log(`📊 Sessions missing profiles: ${missingProfileSessions.length}`);
    
    // Check for missing fc_scores
    console.log('🔍 Checking for missing fc_scores...');
    const { data: existingFcScores } = await supabase
      .from('fc_scores')
      .select('session_id')
      .in('session_id', sessionIds)
      .eq('version', 'v1.2');
    
    const existingFcScoreSessionIds = new Set(existingFcScores?.map(fc => fc.session_id) || []);
    const missingFcScoreSessions = sessionIds.filter(id => !existingFcScoreSessionIds.has(id));
    
    healthCheck.sessions_needing_backfill.missing_fc_scores = missingFcScoreSessions;
    console.log(`📊 Sessions missing fc_scores: ${missingFcScoreSessions.length}`);
    
    // Calculate total unique sessions needing backfill
    const allMissingSessions = new Set([
      ...missingProfileSessions,
      ...missingFcScoreSessions
    ]);
    healthCheck.sessions_needing_backfill.total_count = allMissingSessions.size;
    
    // Determine if backfill is needed
    healthCheck.backfill_plan_needed = healthCheck.sessions_needing_backfill.total_count > 0;
    
    if (healthCheck.backfill_plan_needed) {
      console.log(`🚨 Found ${healthCheck.sessions_needing_backfill.total_count} sessions needing backfill`);
      
      healthCheck.recommended_actions = [
        `Create idempotent backfill plan for ${healthCheck.sessions_needing_backfill.total_count} sessions`,
        'Review sessions for data quality and completeness',
        'Apply throttled backfill with approval gate',
        'Generate rollback artifacts before execution',
        'Monitor execution logs and verify results'
      ];
      
      // Generate mini backfill plan
      const backfillPlan = generateMiniBackfillPlan(Array.from(allMissingSessions));
      writeFileSync('prod_mini_backfill_plan.json', JSON.stringify(backfillPlan, null, 2));
      console.log('📝 Generated prod_mini_backfill_plan.json');
      
    } else {
      console.log('✅ No sessions need backfill - production data is healthy');
      healthCheck.recommended_actions = [
        'Production data is healthy - no backfill needed',
        'Continue with normal operations',
        'Monitor ongoing session processing'
      ];
    }
    
    const report = generateHealthReport(healthCheck);
    writeFileSync('prod_health_check.md', report);
    
    console.log('\n🎯 PROD HEALTH CHECK COMPLETE');
    if (healthCheck.backfill_plan_needed) {
      console.log(`🚨 ${healthCheck.sessions_needing_backfill.total_count} sessions need backfill`);
      console.log('📝 Mini backfill plan generated: prod_mini_backfill_plan.json');
    } else {
      console.log('✅ Production data is healthy');
    }
    console.log('📁 Report: prod_health_check.md');
    
    return {
      success: true,
      healthCheck,
      needs_backfill: healthCheck.backfill_plan_needed
    };
    
  } catch (error) {
    console.error('❌ Prod health check failed:', error);
    
    const errorReport = `# Production Health Check - FAILED

**Error**: ${error}
**Timestamp**: ${new Date().toISOString()}

## Failure Details

The production health check encountered a critical error and could not complete.

## Next Steps

1. Review error details above
2. Fix database access or query issues
3. Re-run production health check
4. Manual review of production data may be required

---
*Generated at ${new Date().toISOString()}*
`;
    
    writeFileSync('prod_health_check.md', errorReport);
    
    return {
      success: false,
      error: error,
      needs_backfill: false
    };
  }
}

function generateHealthReport(healthCheck: ProdHealthCheck): string {
  return `# Production Health Check Report

**Generated**: ${healthCheck.timestamp}
**Discovery Window**: ${healthCheck.discovery_window}
**Sessions Analyzed**: ${healthCheck.sessions_analyzed}

## Summary

${healthCheck.backfill_plan_needed ? '🚨 **ACTION REQUIRED**' : '✅ **HEALTHY**'}: ${healthCheck.backfill_plan_needed ? `${healthCheck.sessions_needing_backfill.total_count} sessions need backfill` : 'No sessions require backfill'}

## Detailed Findings

### Sessions Missing Profiles
- **Count**: ${healthCheck.sessions_needing_backfill.missing_profiles.length}
${healthCheck.sessions_needing_backfill.missing_profiles.length > 0 ? `- **Sessions**: ${healthCheck.sessions_needing_backfill.missing_profiles.slice(0, 5).join(', ')}${healthCheck.sessions_needing_backfill.missing_profiles.length > 5 ? '...' : ''}` : '- **Status**: ✅ All sessions have profiles'}

### Sessions Missing FC Scores  
- **Count**: ${healthCheck.sessions_needing_backfill.missing_fc_scores.length}
${healthCheck.sessions_needing_backfill.missing_fc_scores.length > 0 ? `- **Sessions**: ${healthCheck.sessions_needing_backfill.missing_fc_scores.slice(0, 5).join(', ')}${healthCheck.sessions_needing_backfill.missing_fc_scores.length > 5 ? '...' : ''}` : '- **Status**: ✅ All sessions have fc_scores (v1.2)'}

### Total Impact
- **Unique Sessions Needing Backfill**: ${healthCheck.sessions_needing_backfill.total_count}
- **Percentage of Analyzed Sessions**: ${healthCheck.sessions_analyzed > 0 ? ((healthCheck.sessions_needing_backfill.total_count / healthCheck.sessions_analyzed) * 100).toFixed(1) : 0}%

## Recommended Actions

${healthCheck.recommended_actions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

${healthCheck.backfill_plan_needed ? `
## Mini Backfill Plan

A production backfill plan has been generated: \`prod_mini_backfill_plan.json\`

### Execution Steps (GUARDED)
1. **REVIEW**: Examine the generated plan and verify session list
2. **APPROVE**: Get explicit approval before executing production changes
3. **APPLY**: Run the idempotent backfill with throttling
4. **VERIFY**: Confirm all sessions have required data
5. **ROLLBACK READY**: Keep rollback scripts available

### Safety Features
- Idempotent operations (safe to re-run)
- Throttled execution (20 sessions/minute max)
- Comprehensive logging and audit trail
- Automatic rollback script generation
` : `
## No Action Required

Production data is healthy and complete. Continue with normal operations.
`}

## Database State Summary

- **Total Sessions Analyzed**: ${healthCheck.sessions_analyzed}
- **Sessions with Profiles**: ${healthCheck.sessions_analyzed - healthCheck.sessions_needing_backfill.missing_profiles.length}
- **Sessions with FC Scores**: ${healthCheck.sessions_analyzed - healthCheck.sessions_needing_backfill.missing_fc_scores.length}
- **Complete Sessions**: ${healthCheck.sessions_analyzed - healthCheck.sessions_needing_backfill.total_count}

---
*Generated at ${new Date().toISOString()}*
*Discovery window: ${healthCheck.discovery_window}*
`;
}

function generateMiniBackfillPlan(sessionIds: string[]) {
  return {
    backfill_plan: {
      version: "prod-health-v1.0",
      timestamp: new Date().toISOString(),
      environment: "production",
      engine_version: "v1.2.1",
      fc_version: "v1.2",
      throttle_per_minute: 20,
      batch_size: 5,
      total_candidates: sessionIds.length,
      expected_runtime_minutes: Math.ceil(sessionIds.length / 20),
      discovery_source: "prod_health_check"
    },
    batches: [
      {
        batch_id: "prod_health_recovery",
        description: "Production sessions missing profiles/fc_scores from health check",
        sessions: sessionIds,
        operations: [
          { function: "score_fc_session", params: { version: "v1.2", basis: "functions" } },
          { function: "score_prism", params: { engine_version: "v1.2.1" } }
        ]
      }
    ],
    expected_changes: {
      fc_scores: {
        new_rows: sessionIds.length,
        version: "v1.2",
        fc_kind: "functions"
      },
      profiles: {
        new_rows: sessionIds.length,
        updated_rows: 0,
        results_version: "v1.2.1"
      }
    },
    rollback_strategy: {
      fc_scores: `DELETE FROM fc_scores WHERE version = 'v1.2' AND created_at >= '${new Date().toISOString()}'`,
      profiles: `DELETE FROM profiles WHERE results_version = 'v1.2.1' AND created_at >= '${new Date().toISOString()}'`
    },
    safety_notes: [
      "This is a production backfill plan - requires explicit approval",
      "All operations are idempotent and safe to re-run",
      "Throttling prevents system overload",
      "Rollback scripts generated automatically",
      "Comprehensive logging and audit trail included"
    ]
  };
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runProdHealthCheck().then(result => {
    console.log('\n📋 RESULT:', result.success ? 'SUCCESS' : 'FAILED');
    if (result.success) {
      console.log('🏥 HEALTH:', result.needs_backfill ? 'NEEDS BACKFILL' : 'HEALTHY');
    }
    process.exit(result.success ? 0 : 1);
  });
}

export { runProdHealthCheck };