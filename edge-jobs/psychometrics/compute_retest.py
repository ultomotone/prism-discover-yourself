#!/usr/bin/env python3
"""
PRISM Test-Retest Computation Job
Computes Pearson r correlations for scale sums across assessment pairs.
Runs nightly to update psychometrics_retest_pairs table.
"""
import os
import json
import sys

import psycopg2
import pandas as pd
import numpy as np
from scipy.stats import pearsonr

# Environment variables
DATABASE_URL = os.environ.get("DATABASE_URL")
RESULTS_VER = os.environ.get("RESULTS_VER", "v1.2.1")

if not DATABASE_URL:
    print(json.dumps({"error": "Missing DATABASE_URL"}))
    sys.exit(1)


def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # 1) Get candidate retest pairs from view
    cur.execute("""
        SELECT user_id, first_session_id, second_session_id, results_version, days_between 
        FROM v_retest_pairs 
        WHERE results_version = %s
    """, (RESULTS_VER,))
    pairs = cur.fetchall()
    
    print(f"[retest] Found {len(pairs)} candidate pairs for version {RESULTS_VER}")
    
    if not pairs:
        print(json.dumps({"warning": "No retest pairs found", "processed": 0}))
        cur.close()
        conn.close()
        return

    # 2) Fetch scale sums per session
    cur.execute("""
        WITH scale_sums AS (
            SELECT 
                r.session_id, 
                COALESCE(sk.tag, sk.scale_type::text) AS scale_code,
                SUM(r.answer_numeric)::numeric AS scale_sum
            FROM assessment_responses r
            JOIN assessment_scoring_key sk ON sk.question_id = r.question_id
            WHERE sk.scale_type != 'META' 
              AND sk.tag IS NOT NULL
              AND r.answer_numeric IS NOT NULL
            GROUP BY r.session_id, COALESCE(sk.tag, sk.scale_type::text)
        )
        SELECT session_id, scale_code, scale_sum 
        FROM scale_sums
    """)
    
    df = pd.DataFrame(cur.fetchall(), columns=["session_id", "scale_code", "scale_sum"])
    print(f"[retest] Fetched {len(df)} scale sum records")

    # 3) Compute correlations
    cur.execute("BEGIN;")
    inserted = 0
    
    for user_id, s1, s2, ver, days in pairs:
        # Get scale sums for both sessions
        a = df[df["session_id"] == s1].set_index("scale_code")["scale_sum"]
        b = df[df["session_id"] == s2].set_index("scale_code")["scale_sum"]
        
        if a.empty or b.empty:
            continue
        
        # Find common scales
        common_scales = sorted(set(a.index).intersection(b.index))
        if len(common_scales) < 3:
            continue
        
        # Compute correlation across all common scales
        vec1 = np.array([a[sc] for sc in common_scales])
        vec2 = np.array([b[sc] for sc in common_scales])
        
        try:
            r, p_value = pearsonr(vec1, vec2)
            
            # Insert one row per pair (ALL_SCALES aggregate)
            cur.execute("""
                INSERT INTO psychometrics_retest_pairs
                (user_id, scale_code, first_session_id, second_session_id, 
                 days_between, r_pearson, n_items, results_version)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                user_id,
                'ALL_SCALES',  # Aggregate across scales
                s1,
                s2,
                days,
                round(float(r), 4),
                len(common_scales),
                ver
            ))
            inserted += 1
            
        except Exception as e:
            print(f"[retest] Error computing r for pair ({s1}, {s2}): {e}")
            continue
    
    cur.execute("COMMIT;")
    print(json.dumps({
        "success": True,
        "pairs_processed": len(pairs),
        "pairs_inserted": inserted,
        "results_version": RESULTS_VER
    }))
    
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
