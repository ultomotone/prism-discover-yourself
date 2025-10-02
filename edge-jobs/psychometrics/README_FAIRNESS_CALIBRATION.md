# Fairness & Calibration Metrics

## Overview

This document describes how to populate the advanced psychometrics KPIs: DIF (Differential Item Functioning), Calibration (ECE/Brier), Split-Half Reliability, Item Discrimination, and CFA Fit Indices.

## Prerequisites

- Python 3.8+ with packages: `psycopg2`, `numpy`, `scipy`, `pandas`
- R (optional) for CFA: `lavaan`, `psych` packages
- Database access with `DATABASE_URL` environment variable

## 1. DIF (Differential Item Functioning)

**Purpose:** Detect items that perform differently across demographic groups (e.g., gender, ethnicity).

**Method:** Use R's `difR` package (Mantel-Haenszel, IRT-based, or logistic regression).

**Target:** ≤ 10% flagged items

### R Script Example (compute_dif.R)

```r
library(difR)
library(DBI)

# Connect to database
con <- dbConnect(RPostgres::Postgres(), Sys.getenv("DATABASE_URL"))

# Fetch responses and demographics
responses <- dbGetQuery(con, "
  SELECT session_id, question_id, answer_numeric, user_id
  FROM assessment_responses
  WHERE answer_numeric IS NOT NULL
")

demographics <- dbGetQuery(con, "
  SELECT user_id, gender, ethnicity
  FROM user_demographics
")

# Pivot to item matrix
data <- responses %>%
  left_join(demographics, by = "user_id") %>%
  pivot_wider(names_from = question_id, values_from = answer_numeric)

# Run Mantel-Haenszel DIF
group <- data$gender  # or ethnicity
items <- data %>% select(-session_id, -user_id, -gender, -ethnicity)

dif_result <- difMH(items, group, focal.name = "female", purify = TRUE)

# Store results
for(i in 1:length(dif_result$DIFitems)) {
  qid <- names(dif_result$DIFitems)[i]
  flag <- dif_result$DIFitems[i]
  effect_size <- dif_result$alphaMH[i]
  p_value <- dif_result$pval[i]
  
  dbExecute(con, "
    INSERT INTO dif_results (question_id, focal_group, reference_group, method, effect_size, p_value, flag)
    VALUES ($1, 'female', 'male', 'MH', $2, $3, $4)
    ON CONFLICT DO NOTHING
  ", params = list(as.integer(qid), effect_size, p_value, flag))
}

dbDisconnect(con)
```

After running, refresh the materialized view:

```bash
psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_fairness_dif;"
```

## 2. Calibration (ECE & Brier Score)

**Purpose:** Measure how well predicted confidences match actual outcomes.

**Method:** Bin predictions, compare to observed outcomes.

**Target:** ECE < 0.05

### Python Script (compute_calibration.py)

This script is provided in the user's spec. Key steps:

1. **Define outcome:**
   - `gold`: Gold standard results (if available)
   - `retest_agree`: Type stability across retests
   - `fc_agree`: Forced-choice agreement

2. **Run:**

```bash
export DATABASE_URL="postgresql://..."
export RESULTS_VER="v1.2.1"
export OUTCOME="retest_agree"  # or gold/fc_agree

python compute_calibration.py
```

3. **Output:** Populates `calibration_bins` and `calibration_summary` tables.

4. **Refresh MV:**

```bash
psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_calibration;"
```

## 3. Split-Half Reliability (Guttman's λ₂)

**Purpose:** Internal consistency via split-half correlation.

**Target:** ≥ 0.70

### Python Script (compute_split_half.py)

```python
import os, psycopg2, numpy as np
from pingouin import split_half

DB = os.environ["DATABASE_URL"]
VER = os.environ.get("RESULTS_VER", "v1.2.1")
COHORT_START = os.environ.get("COHORT_START", "2025-09-01")
COHORT_END = os.environ.get("COHORT_END", "2025-10-02")

conn = psycopg2.connect(DB)
c = conn.cursor()

# Get scales
c.execute("SELECT DISTINCT scale_code FROM scale_catalog WHERE result_version=%s", (VER,))
scales = [r[0] for r in c.fetchall()]

for scale_code in scales:
    # Fetch responses for this scale
    c.execute("""
        SELECT r.session_id, r.question_id, r.answer_numeric
        FROM assessment_responses r
        JOIN assessment_scoring_key sk ON sk.question_id = r.question_id
        JOIN assessment_sessions s ON s.id = r.session_id
        WHERE sk.scale_code = %s 
          AND s.status = 'completed'
          AND s.created_at BETWEEN %s AND %s
          AND r.answer_numeric IS NOT NULL
    """, (scale_code, COHORT_START, COHORT_END))
    
    rows = c.fetchall()
    if not rows:
        continue
    
    # Pivot to matrix
    from pandas import DataFrame
    df = DataFrame(rows, columns=['session_id', 'question_id', 'answer_numeric'])
    matrix = df.pivot(index='session_id', columns='question_id', values='answer_numeric')
    
    if matrix.shape[1] < 4:  # Need at least 4 items
        continue
    
    # Compute split-half
    result = split_half(matrix.values, method='guttman')
    lambda2 = result['split_half']
    
    # Insert
    c.execute("""
        INSERT INTO split_half_results (scale_code, results_version, cohort_start, cohort_end, lambda2, n_respondents)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (scale_code, VER, COHORT_START, COHORT_END, float(lambda2), len(matrix)))

conn.commit()
conn.close()
print(f"Split-half computed for {len(scales)} scales")
```

## 4. Item Discrimination (Item-Total Correlation)

**Purpose:** Identify items with low discriminative power.

**Target:** Flag items with r_it < 0.20

### Python Script (compute_item_discrimination.py)

```python
import os, psycopg2, numpy as np
from scipy.stats import pearsonr

DB = os.environ["DATABASE_URL"]
VER = os.environ.get("RESULTS_VER", "v1.2.1")

conn = psycopg2.connect(DB)
c = conn.cursor()

# Get all items by scale
c.execute("""
    SELECT DISTINCT sk.scale_code, sk.question_id
    FROM assessment_scoring_key sk
    WHERE sk.scale_type != 'META'
""")
items = c.fetchall()

for scale_code, question_id in items:
    # Fetch responses
    c.execute("""
        WITH scale_items AS (
            SELECT question_id FROM assessment_scoring_key WHERE scale_code = %s
        ),
        responses AS (
            SELECT r.session_id, r.question_id, r.answer_numeric
            FROM assessment_responses r
            WHERE r.question_id IN (SELECT question_id FROM scale_items)
              AND r.answer_numeric IS NOT NULL
        ),
        scale_sums AS (
            SELECT session_id, SUM(answer_numeric) as total
            FROM responses
            GROUP BY session_id
        )
        SELECT r.session_id, r.answer_numeric, ss.total
        FROM responses r
        JOIN scale_sums ss ON ss.session_id = r.session_id
        WHERE r.question_id = %s
    """, (scale_code, question_id))
    
    rows = c.fetchall()
    if len(rows) < 30:  # Need sufficient sample
        continue
    
    item_scores = np.array([r[1] for r in rows])
    scale_totals = np.array([r[2] for r in rows])
    scale_minus_item = scale_totals - item_scores
    
    r_it, _ = pearsonr(item_scores, scale_minus_item)
    
    c.execute("""
        INSERT INTO item_discrimination (question_id, scale_code, r_it, n, results_version)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, (question_id, scale_code, float(r_it), len(rows), VER))

conn.commit()
conn.close()
print("Item discrimination computed")
```

## 5. CFA Fit Indices

**Purpose:** Test whether theoretical factor structure fits observed data.

**Targets:** CFI/TLI ≥ 0.90, RMSEA ≤ 0.08, SRMR ≤ 0.08

### R Script (compute_cfa.R)

```r
library(lavaan)
library(DBI)

con <- dbConnect(RPostgres::Postgres(), Sys.getenv("DATABASE_URL"))

# Fetch item responses
data <- dbGetQuery(con, "
  SELECT session_id, question_id, answer_numeric
  FROM assessment_responses
  WHERE answer_numeric IS NOT NULL
")

# Pivot to wide format
wide_data <- data %>%
  pivot_wider(names_from = question_id, values_from = answer_numeric)

# Define CFA model (example for 8 factors)
model <- '
  # Functions (8 latent factors)
  Ti =~ Ti1 + Ti2 + Ti3 + Ti4 + Ti5
  Te =~ Te1 + Te2 + Te3 + Te4 + Te5
  Fi =~ Fi1 + Fi2 + Fi3 + Fi4 + Fi5
  Fe =~ Fe1 + Fe2 + Fe3 + Fe4 + Fe5
  Ni =~ Ni1 + Ni2 + Ni3 + Ni4 + Ni5
  Ne =~ Ne1 + Ne2 + Ne3 + Ne4 + Ne5
  Si =~ Si1 + Si2 + Si3 + Si4 + Si5
  Se =~ Se1 + Se2 + Se3 + Se4 + Se5
'

# Fit model
fit <- cfa(model, data = wide_data, std.lv = TRUE)
fit_measures <- fitMeasures(fit, c("cfi", "tli", "rmsea", "srmr"))

# Store results
dbExecute(con, "
  INSERT INTO cfa_fit (model_name, results_version, cfi, tli, rmsea, srmr, n)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
", params = list(
  "PRISM_8f",
  Sys.getenv("RESULTS_VER", "v1.2.1"),
  fit_measures["cfi"],
  fit_measures["tli"],
  fit_measures["rmsea"],
  fit_measures["srmr"],
  nrow(wide_data)
))

dbDisconnect(con)
```

## Scheduling

Add to crontab for nightly updates:

```bash
# Run at 3 AM daily
0 3 * * * cd /path/to/edge-jobs/psychometrics && \
  RESULTS_VER=v1.2.1 \
  COHORT_START=$(date -d '90 days ago' +%Y-%m-%d) \
  COHORT_END=$(date +%Y-%m-%d) \
  python compute_split_half.py && \
  python compute_item_discrimination.py && \
  python compute_calibration.py && \
  Rscript compute_cfa.R && \
  psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_split_half;" && \
  psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_items_discrimination;" && \
  psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_calibration;" && \
  psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_cfa;"
```

## Verification

After running jobs, verify data:

```sql
-- Check DIF
SELECT * FROM mv_kpi_fairness_dif;

-- Check Calibration
SELECT * FROM mv_kpi_calibration;

-- Check Split-Half
SELECT * FROM mv_kpi_split_half;

-- Check Item Discrimination
SELECT * FROM mv_kpi_items_discrimination;

-- Check CFA
SELECT * FROM mv_kpi_cfa;
```

All metrics will now display on the analytics dashboard with appropriate badges and status indicators.
