# Monitoring Alerts Setup

**Environment**: Production (gnkuikentdtnatazeriu)
**Setup Date**: 2024-12-09T14:32:15.487Z

## Alert Rules Configuration

### 1. Engine Version Override Alert 🚨

**Trigger**: `engine_version_override > 0`
**Severity**: CRITICAL
**Frequency**: Real-time
**Threshold**: Any occurrence

#### Detection Query
```sql
SELECT COUNT(*) as override_count
FROM profiles 
WHERE created_at > NOW() - INTERVAL '5 minutes'
  AND results_version != 'v1.2.1';
```

#### Runbook
1. **Immediate**: Check deployment status and recent changes
2. **Investigate**: Review application logs for version override events
3. **Escalate**: If count > 5, consider emergency rollback
4. **Notify**: Alert deployment team within 2 minutes

### 2. Legacy FC Sources Alert ⚠️

**Trigger**: `fc_source=legacy > 0`
**Severity**: HIGH
**Frequency**: Every 10 minutes
**Threshold**: Any occurrence

#### Detection Query
```sql
SELECT COUNT(*) as legacy_count
FROM fc_scores 
WHERE created_at > NOW() - INTERVAL '10 minutes'
  AND fc_kind != 'functions';
```

#### Runbook
1. **Investigate**: Check FC scoring infrastructure health
2. **Validate**: Ensure fc_scores table is properly seeded
3. **Monitor**: Track conversion rates for impact assessment
4. **Report**: Document any legacy source usage patterns

### 3. Tokenless Results Access Alert 🔒

**Trigger**: `401/403 anomalies > baseline`
**Severity**: MEDIUM
**Frequency**: Hourly
**Threshold**: > 10% of total requests

#### Detection Query
```sql
-- Note: This would query actual HTTP access logs in production
SELECT 
  SUM(CASE WHEN status IN (401, 403) THEN 1 ELSE 0 END) as unauthorized,
  COUNT(*) as total,
  (SUM(CASE WHEN status IN (401, 403) THEN 1 ELSE 0 END)::float / COUNT(*)) * 100 as error_rate
FROM http_access_log 
WHERE path LIKE '/results/%' 
  AND timestamp > NOW() - INTERVAL '1 hour';
```

#### Runbook
1. **Analyze**: Review error rate trends and patterns
2. **Investigate**: Check for unusual access patterns or attacks
3. **Validate**: Ensure RLS policies are functioning correctly
4. **Document**: Log any security incidents for review

### 4. Conversion Rate Degradation Alert 📉

**Trigger**: `conversion_rate < 85%`
**Severity**: MEDIUM
**Frequency**: Every 30 minutes
**Threshold**: Below 85% for > 1 hour

#### Detection Query
```sql
WITH recent_metrics AS (
  SELECT 
    (SELECT COUNT(*) FROM assessment_sessions 
     WHERE status='completed' AND updated_at > NOW() - INTERVAL '1 hour') as completed,
    (SELECT COUNT(*) FROM profiles 
     WHERE created_at > NOW() - INTERVAL '1 hour') as profiles_created
)
SELECT 
  completed,
  profiles_created,
  CASE WHEN completed = 0 THEN 0.0
       ELSE (profiles_created::numeric / completed) * 100
  END as conversion_rate
FROM recent_metrics;
```

#### Runbook
1. **Check**: System health and error rates
2. **Investigate**: Scoring function performance and errors
3. **Monitor**: User experience and completion flows
4. **Escalate**: If rate drops below 75%, page on-call engineer

## Alert Channels

### Immediate Alerts (CRITICAL/HIGH)
- **Slack**: #production-alerts
- **PagerDuty**: On-call engineer
- **Email**: engineering-oncall@company.com

### Standard Alerts (MEDIUM/LOW)
- **Slack**: #monitoring
- **Email**: engineering-team@company.com
- **Dashboard**: Production health dashboard

## Health Check Schedule

### Daily
- [ ] Review overnight alerts and resolution status
- [ ] Check conversion rate trends
- [ ] Validate version consistency

### Weekly
- [ ] Execute automated drift audit
- [ ] Review alert frequency and accuracy
- [ ] Update baseline thresholds if needed

### Monthly
- [ ] Alert effectiveness review
- [ ] Runbook accuracy validation
- [ ] Threshold tuning based on historical data

## Alert Testing

### Test Schedule
- **Engine Override**: Monthly test with staging override
- **FC Legacy**: Quarterly test with controlled legacy event
- **Token Access**: Weekly test with invalid token scenarios
- **Conversion Rate**: Bi-weekly synthetic load testing

### Test Procedures
1. Execute controlled trigger event
2. Verify alert fires within expected timeframe
3. Validate runbook steps are current and accurate
4. Document any issues and update procedures

---
**Alerts Configuration**: ACTIVE ✅
**Next Review**: 30 days from setup
**Runbook Version**: 1.0