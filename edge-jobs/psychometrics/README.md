# PRISM Psychometrics Batch Jobs

Nightly jobs to compute reliability metrics (Cronbach α, McDonald ω) and test-retest correlations.

## Setup

```bash
pip install -r requirements.txt
```

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `RESULTS_VER`: e.g., "v1.2.1"
- `COHORT_START`: Start date (YYYY-MM-DD)
- `COHORT_END`: End date (YYYY-MM-DD)

## Running Manually

```bash
export DATABASE_URL="postgresql://..."
export RESULTS_VER="v1.2.1"
export COHORT_START="2025-09-01"
export COHORT_END="2025-10-02"

python compute_reliability.py
python compute_retest.py
```

## Scheduling (Cron)

```bash
# Add to crontab (runs daily at 2 AM UTC)
0 2 * * * cd /path/to/edge-jobs/psychometrics && \
  RESULTS_VER=v1.2.1 \
  COHORT_START=$(date -d '90 days ago' +%Y-%m-%d) \
  COHORT_END=$(date +%Y-%m-%d) \
  python compute_reliability.py && \
  python compute_retest.py && \
  psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_reliability;" && \
  psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_retest;"
```

## Output

Both jobs output JSON to stdout:
- Success: `{"success": true, "inserted": N}`
- Error: `{"error": "message"}`
