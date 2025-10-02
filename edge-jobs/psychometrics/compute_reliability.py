#!/usr/bin/env python3
"""
PRISM Reliability Computation Job
Computes Cronbach's α and McDonald's ω for each scale using assessment response data.
Runs nightly to update psychometrics_external table.
"""
import os
import math
import json
import sys
from datetime import datetime

import psycopg2
import numpy as np
import pandas as pd

# Environment variables
DATABASE_URL = os.environ.get("DATABASE_URL")
COHORT_START = os.environ.get("COHORT_START")  # e.g., '2025-09-01'
COHORT_END = os.environ.get("COHORT_END")      # e.g., '2025-10-02'
RESULTS_VER = os.environ.get("RESULTS_VER", "v1.2.1")

if not all([DATABASE_URL, COHORT_START, COHORT_END]):
    print(json.dumps({"error": "Missing required env vars: DATABASE_URL, COHORT_START, COHORT_END"}))
    sys.exit(1)


def cronbach_alpha(X):
    """Compute Cronbach's alpha for item matrix X (rows=respondents, cols=items)"""
    X = np.asarray(X, dtype=float)
    k = X.shape[1]
    if k <= 1:
        return float("nan")
    
    colvar = np.nanvar(X, axis=0, ddof=1)
    total = np.nansum(X, axis=1)
    totalvar = np.nanvar(total, ddof=1)
    
    if totalvar <= 0:
        return float("nan")
    
    return float((k / (k - 1.0)) * (1 - (np.nansum(colvar) / totalvar)))


def omega_total(loadings, uniq):
    """
    Compute McDonald's omega_total from factor loadings and uniquenesses.
    ω = (Σλ)² / [(Σλ)² + Σψ]
    """
    l = np.asarray(loadings, float)
    u = np.asarray(uniq, float)
    num = (np.sum(l)) ** 2
    den = num + np.sum(u)
    return float(num / den) if den > 0 else float("nan")


def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # 1) Fetch scale mapping from assessment_scoring_key
    cur.execute("""
        SELECT 
            COALESCE(tag, scale_type::text) AS scale_code, 
            question_id
        FROM assessment_scoring_key
        WHERE scale_type != 'META' AND tag IS NOT NULL
    """)
    map_rows = cur.fetchall()
    scale_map = {}
    for scale, qid in map_rows:
        scale_map.setdefault(scale, []).append(qid)

    print(f"[reliability] Found {len(scale_map)} scales: {list(scale_map.keys())}")

    # 2) Fetch all responses for the cohort window
    cur.execute("""
        SELECT r.session_id, r.question_id, r.answer_numeric
        FROM assessment_responses r
        JOIN assessment_sessions s ON s.id = r.session_id
        JOIN profiles p ON p.session_id = s.id
        WHERE s.status = 'completed'
          AND p.results_version = %s
          AND s.completed_at >= %s::date
          AND s.completed_at < %s::date + interval '1 day'
          AND r.answer_numeric IS NOT NULL
    """, (RESULTS_VER, COHORT_START, COHORT_END))
    
    response_data = cur.fetchall()
    print(f"[reliability] Fetched {len(response_data)} responses")
    
    if not response_data:
        print(json.dumps({"warning": "No response data in cohort window"}))
        cur.close()
        conn.close()
        return

    df = pd.DataFrame(response_data, columns=["session_id", "question_id", "answer"])

    # 3) Compute α and ω for each scale
    results = []
    for scale_code, item_ids in scale_map.items():
        sub = df[df["question_id"].isin(item_ids)]
        if sub.empty:
            continue
        
        # Pivot: rows=sessions, cols=questions
        mat = sub.pivot_table(
            index="session_id", 
            columns="question_id", 
            values="answer", 
            aggfunc="first"
        )
        
        if mat.shape[0] < 50 or mat.shape[1] < 2:
            print(f"[reliability] Skipping {scale_code}: n={mat.shape[0]}, items={mat.shape[1]}")
            continue
        
        # Cronbach's alpha
        alpha = cronbach_alpha(mat.values)
        
        # McDonald's omega (using 1-factor SVD as proxy)
        mat_filled = mat.fillna(mat.mean())
        mat_centered = mat_filled - mat_filled.mean()
        
        try:
            U, S, Vt = np.linalg.svd(mat_centered, full_matrices=False)
            loadings = np.abs(Vt[0])  # First factor loadings
            uniq = np.maximum(0, 1 - (loadings ** 2))
            omega = omega_total(loadings, uniq)
        except:
            omega = float("nan")
        
        # Standard error of measurement
        sem_val = float(
            np.nanstd(mat_filled.sum(axis=1), ddof=1) * 
            math.sqrt(max(0, 1 - (alpha if not np.isnan(alpha) else 0)))
        )
        
        results.append((
            scale_code,
            RESULTS_VER,
            COHORT_START,
            COHORT_END,
            int(mat.shape[0]),
            round(alpha, 4) if not np.isnan(alpha) else None,
            round(omega, 4) if not np.isnan(omega) else None,
            round(sem_val, 4) if not np.isnan(sem_val) else None,
            None  # notes
        ))
        
        print(f"[reliability] {scale_code}: n={mat.shape[0]}, α={alpha:.3f}, ω={omega:.3f}")

    # 4) Write to database
    if not results:
        print(json.dumps({"warning": "No scales computed", "inserted": 0}))
        cur.close()
        conn.close()
        return

    cur.execute("BEGIN;")
    cur.execute("""
        DELETE FROM psychometrics_external 
        WHERE results_version=%s 
          AND cohort_start=%s 
          AND cohort_end=%s
    """, (RESULTS_VER, COHORT_START, COHORT_END))
    
    cur.executemany("""
        INSERT INTO psychometrics_external
        (scale_code, results_version, cohort_start, cohort_end, n_respondents, 
         cronbach_alpha, mcdonald_omega, sem, notes)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, results)
    
    cur.execute("COMMIT;")
    print(json.dumps({"success": True, "inserted": len(results), "cohort": f"{COHORT_START} to {COHORT_END}"}))
    
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
