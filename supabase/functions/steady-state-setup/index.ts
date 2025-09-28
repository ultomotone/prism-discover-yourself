import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MaintenanceSchedule {
  weekly_drift_audit: {
    description: string;
    frequency: string;
    artifacts: string[];
  };
  daily_evidence_gate: {
    description: string;
    frequency: string;
    artifacts: string[];
  };
  security_posture_scan: {
    description: string;
    frequency: string;
    artifacts: string[];
  };
  fc_integrity_check: {
    description: string;
    frequency: string;
    artifacts: string[];
  };
  telemetry_watchdog: {
    description: string;
    frequency: string;
    artifacts: string[];
  };
  backfill_monitor: {
    description: string;
    frequency: string;
    artifacts: string[];
  };
  version_bouncer: {
    description: string;
    frequency: string;
    artifacts: string[];
  };
  quarterly_incident_drill: {
    description: string;
    frequency: string;
    artifacts: string[];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🛠️ Setting up Steady-State Maintenance Procedures');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Define the 8 steady-state maintenance procedures
    const maintenanceSchedule: MaintenanceSchedule = {
      weekly_drift_audit: {
        description: "Snapshot RLS policies on profiles/fc_scores, verify results_version='v1.2.1', check function SHA alignment across environments",
        frequency: "Weekly (Mondays 09:00 UTC)",
        artifacts: ["artifacts/drift_audit.md", "artifacts/drift_fix_plan.md (if needed)"]
      },
      daily_evidence_gate: {
        description: "Execute canary session finalize, verify fc_scores v1.2, profiles v1.2.1, tokenized results, clean telemetry",
        frequency: "Daily (06:00 UTC)",
        artifacts: ["artifacts/evidence_gate_daily.md"]
      },
      security_posture_scan: {
        description: "Check for unauthorized /results/* access, confirm RPC/Edge-only database reads",
        frequency: "Daily (12:00 UTC)",
        artifacts: ["artifacts/security_scan.md"]
      },
      fc_integrity_check: {
        description: "Validate 6 blocks/24 options, check for orphan responses, monitor score_fc_session performance",
        frequency: "Daily (18:00 UTC)", 
        artifacts: ["artifacts/fc_integrity_report.md"]
      },
      telemetry_watchdog: {
        description: "Monitor 24h counts for overrides, legacy FC, finalize errors, tokenless hits",
        frequency: "Daily (00:00 UTC)",
        artifacts: ["artifacts/telemetry_watchdog.md", "artifacts/remediation_plan.md (if needed)"]
      },
      backfill_monitor: {
        description: "Discover sessions with responses missing fc_scores/profiles, generate recovery jobs",
        frequency: "Weekly (Wednesdays 10:00 UTC)",
        artifacts: ["artifacts/backfill_monitor.md", "jobs/backfill_apply_plan.json"]
      },
      version_bouncer: {
        description: "Scan repo for version constants < v1.2.1 engine or < v1.2 FC, check telemetry hooks",
        frequency: "On every deployment",
        artifacts: ["artifacts/version_bouncer.md"]
      },
      quarterly_incident_drill: {
        description: "Simulate RLS/version regressions, validate incident response playbooks",
        frequency: "Quarterly (1st Monday of quarter)",
        artifacts: ["artifacts/incident_drill.md", "artifacts/drill_findings.md"]
      }
    };

    // Generate setup documentation
    const setupDoc = generateSetupDocumentation(maintenanceSchedule);

    // Generate Lovable prompt templates
    const promptTemplates = generatePromptTemplates();

    // Generate one-liner commands
    const oneLiners = generateOneLiners();

    console.log('✅ Steady-state maintenance framework configured');

    return new Response(JSON.stringify({
      status: 'CONFIGURED',
      maintenance_schedule: maintenanceSchedule,
      setup_documentation: setupDoc,
      prompt_templates: promptTemplates,
      one_liners: oneLiners,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Steady-state setup failed:', error);
    return new Response(JSON.stringify({
      error: message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateSetupDocumentation(schedule: MaintenanceSchedule): string {
  return `# Steady-State Maintenance Framework

**Environment**: Production (gnkuikentdtnatazeriu)
**Setup Date**: ${new Date().toISOString()}
**Version**: Engine v1.2.1, FC v1.2

## Maintenance Procedures Overview

### 1. Weekly Drift Audit 📊
- **Frequency**: ${schedule.weekly_drift_audit.frequency}
- **Purpose**: ${schedule.weekly_drift_audit.description}
- **Artifacts**: ${schedule.weekly_drift_audit.artifacts.join(', ')}
- **Trigger**: \`DRIFT AUDIT — Weekly (Read-Only)\`

### 2. Daily Evidence Gate 🎯
- **Frequency**: ${schedule.daily_evidence_gate.frequency}
- **Purpose**: ${schedule.daily_evidence_gate.description}
- **Artifacts**: ${schedule.daily_evidence_gate.artifacts.join(', ')}
- **Trigger**: \`EVIDENCE GATE — Daily Canary (Guarded)\`

### 3. Security Posture Scan 🔒
- **Frequency**: ${schedule.security_posture_scan.frequency}
- **Purpose**: ${schedule.security_posture_scan.description}
- **Artifacts**: ${schedule.security_posture_scan.artifacts.join(', ')}
- **Trigger**: \`SECURITY SCAN — Results Access (Read-Only)\`

### 4. FC Integrity Check ⚙️
- **Frequency**: ${schedule.fc_integrity_check.frequency}
- **Purpose**: ${schedule.fc_integrity_check.description}
- **Artifacts**: ${schedule.fc_integrity_check.artifacts.join(', ')}
- **Trigger**: \`FC INTEGRITY — Blocks/Options & Pipeline (Read-Only)\`

### 5. Telemetry Watchdog 📡
- **Frequency**: ${schedule.telemetry_watchdog.frequency}
- **Purpose**: ${schedule.telemetry_watchdog.description}
- **Artifacts**: ${schedule.telemetry_watchdog.artifacts.join(', ')}
- **Trigger**: \`TELEMETRY WATCHDOG — 24h Window (Read-Only)\`

### 6. Backfill Monitor 🔄
- **Frequency**: ${schedule.backfill_monitor.frequency}
- **Purpose**: ${schedule.backfill_monitor.description}
- **Artifacts**: ${schedule.backfill_monitor.artifacts.join(', ')}
- **Trigger**: \`BACKFILL MONITOR — Discover & Plan\`

### 7. Version Bouncer 🛡️
- **Frequency**: ${schedule.version_bouncer.frequency}
- **Purpose**: ${schedule.version_bouncer.description}
- **Artifacts**: ${schedule.version_bouncer.artifacts.join(', ')}
- **Trigger**: \`VERSION BOUNCER — CI Gate (No Writes)\`

### 8. Quarterly Incident Drill 🚨
- **Frequency**: ${schedule.quarterly_incident_drill.frequency}
- **Purpose**: ${schedule.quarterly_incident_drill.description}
- **Artifacts**: ${schedule.quarterly_incident_drill.artifacts.join(', ')}
- **Trigger**: \`INCIDENT DRILL — RLS & Version Regression (Simulated)\`

## Guard-Rail Pattern

All procedures follow the **discover → diff → plan → approval → apply → verify → halt** pattern:

1. **Discover**: Read-only data collection
2. **Diff**: Compare against expected baselines  
3. **Plan**: Generate remediation steps if needed
4. **Approval**: HALT for manual review before changes
5. **Apply**: Execute approved changes (idempotent)
6. **Verify**: Confirm changes took effect
7. **Halt**: Stop and report status

## Escalation Matrix

| Severity | Condition | Response | Notification |
|----------|-----------|----------|-------------|
| **CRITICAL** | engine_version_override > 0 | Immediate investigation | Page on-call |
| **HIGH** | fc_source=legacy > 0 | Investigation within 2h | Alert team |
| **MEDIUM** | Conversion < 85% baseline | Investigation within 4h | Monitor trend |
| **LOW** | Minor drift detected | Weekly review cycle | Log for analysis |

---
*Framework Status: ACTIVE*
*Next Review: 30 days from setup*`;
}

function generatePromptTemplates(): Record<string, string> {
  return {
    drift_audit: `DRIFT AUDIT — Weekly (Read-Only)

Snapshot RLS on profiles & fc_scores; list policies & "forced" flags.

Verify scoring_config.results_version == "v1.2.1" and no lower versions in shared libs.

Compare Edge Functions' deployed SHAs across dev/stage/prod; flag mismatches.

Emit artifacts/drift_audit.md with PASS/FAIL and diffs. HALT.

PASS: No policy/commit/version drift.
Fail action: Generate drift_fix.plan.md (no apply).`,

    evidence_gate: `EVIDENCE GATE — Daily Canary (Guarded)

Pick 1 non-sensitive canary session per env.

Invoke finalizeAssessment (idempotent).

Prove: fc_scores.version="v1.2" (JSON object), profiles.results_version="v1.2.1", tokenized results (200 with token / 401-403 without), telemetry shows fc_source=fc_scores and no engine override.

Write artifacts/evidence_gate_daily.md. HALT on FAIL.`,

    security_scan: `SECURITY SCAN — Results Access (Read-Only)

Check for any 200s on /results/* without token in last 24h.

Confirm no direct table reads from frontend (RPC/Edge only).

Emit artifacts/security_scan.md (PASS/FAIL + sample lines). HALT on FAIL.`,

    fc_integrity: `FC INTEGRITY — Blocks/Options & Pipeline (Read-Only)

Validate 6 FC blocks / 24 options and weight coverage.

Look for orphan fc_responses (responses with no corresponding block/option).

Spot-check score_fc_session error rate and timing.

Emit artifacts/fc_integrity_report.md with PASS/FAIL.`,

    telemetry_watchdog: `TELEMETRY WATCHDOG — 24h Window (Read-Only)

Counts for: engine_version_override, fc_source=legacy, finalize errors, tokenless results hits.

If any > 0, propose alert thresholds & recipients; emit artifacts/telemetry_watchdog.md and HALT with a minimal remediation plan.`,

    backfill_monitor: `BACKFILL MONITOR — Discover & Plan

Since last 24h: find sessions with responses>0 missing fc_scores and/or profiles.

Produce jobs/backfill_apply.plan.json (throttle 20/min) + rollback templates.

Emit artifacts/backfill_monitor.md. HALT for approval before apply.`,

    version_bouncer: `VERSION BOUNCER — CI Gate (No Writes)

Scan repo for version constants; flag any < v1.2.1 engine or < v1.2 FC references.

Check for hardcoded overrides; ensure telemetry hooks present.

Emit artifacts/version_bouncer.md (PASS/FAIL + exact file/line hits).`,

    incident_drill: `INCIDENT DRILL — RLS & Version Regression (Simulated)

Dry-run: simulate missing RLS on profiles (no actual writes).

Ensure the IR playbook would detect, halt, and propose the same fix path.

Emit artifacts/incident_drill.md (findings + time-to-detect KPIs).`
  };
}

function generateOneLiners(): Record<string, string> {
  return {
    drift_audit_now: "Run Weekly Drift Audit (read-only). HALT if any policy/version/commit drift; attach drift_audit.md.",
    evidence_gate_now: "Run Daily Evidence Gate canary (read-only + idempotent finalize). Attach evidence_gate_daily.md. HALT on fail.",
    backfill_execute: "Execute jobs/backfill_apply.plan.json (20/min throttle), generate logs, backfill_summary.md, rollback pack; HALT.",
    emergency_recovery: "Admin Recovery (Prod, single session, guarded): Preconditions: FC row exists (v1.2), profile missing. Action: invoke admin scorer (score_prism) to upsert profile stamped v1.2.1; capture DB/HTTP/telemetry proofs; write prod_recovery_gate.md; HALT.",
    hypercare_check: "EXEC — Hypercare Monitor (Read-only, no writes): Collect last 24h: engine_version_override, fc_source=legacy, tokenless results (401/403 split), finalize errors. Add small time-series for conversion (completed → profiles). Output artifacts/hypercare_24h.md with PASS/FAIL + 1 log line per anomaly. HALT."
  };
}