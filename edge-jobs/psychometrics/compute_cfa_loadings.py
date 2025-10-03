#!/usr/bin/env python3
"""
PRISM CFA Loadings Computation
Computes standardized factor loadings for all scales
"""
import os
import sys
from typing import Dict, List, Tuple
import psycopg2
import pandas as pd
import numpy as np
from factor_analyzer import FactorAnalyzer

# Configuration
RESULTS_VERSION = 'v1.2.1'
MIN_SAMPLE_SIZE = 50
MIN_ITEMS_FOR_CFA = 3

def get_db_connection():
    """Get database connection from environment"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL not set")
    return psycopg2.connect(database_url)

def fetch_scales_and_items(conn) -> Dict[str, List[int]]:
    """Fetch all scales and their item question_ids"""
    query = """
        SELECT scale_tag, array_agg(question_id ORDER BY question_id) as question_ids
        FROM v_scale_items_by_tag
        GROUP BY scale_tag
        HAVING COUNT(*) >= %s
    """
    df = pd.read_sql(query, conn, params=(MIN_ITEMS_FOR_CFA,))
    return {row['scale_tag']: row['question_ids'] for _, row in df.iterrows()}

def fetch_response_matrix(conn, question_ids: List[int]) -> pd.DataFrame:
    """Fetch complete-case response matrix for given items"""
    placeholders = ','.join(['%s'] * len(question_ids))
    query = f"""
        WITH sessions_with_all AS (
            SELECT session_id
            FROM assessment_responses
            WHERE question_id = ANY(ARRAY[{placeholders}])
              AND normalized_value IS NOT NULL
            GROUP BY session_id
            HAVING COUNT(DISTINCT question_id) = %s
        )
        SELECT 
            r.session_id,
            r.question_id,
            r.normalized_value
        FROM assessment_responses r
        JOIN sessions_with_all s ON s.session_id = r.session_id
        WHERE r.question_id = ANY(ARRAY[{placeholders}])
          AND r.normalized_value IS NOT NULL
        ORDER BY r.session_id, r.question_id
    """
    params = question_ids + [len(question_ids)] + question_ids
    df = pd.read_sql(query, conn, params=params)
    
    # Pivot to wide format: sessions × items
    matrix = df.pivot(index='session_id', columns='question_id', values='normalized_value')
    return matrix

def compute_cfa_loadings(matrix: pd.DataFrame) -> Dict[int, Tuple[float, float]]:
    """
    Run single-factor CFA and extract loadings
    Returns: {question_id: (lambda_std, theta)}
    """
    if len(matrix) < MIN_SAMPLE_SIZE:
        raise ValueError(f"Insufficient sample size: {len(matrix)} < {MIN_SAMPLE_SIZE}")
    
    # Run single-factor analysis
    fa = FactorAnalyzer(n_factors=1, rotation=None, method='ml')
    fa.fit(matrix)
    
    # Get standardized loadings
    loadings = fa.loadings_[:, 0]  # Single factor
    
    # Compute error variances: theta = 1 - R²
    communalities = loadings ** 2
    theta = 1 - communalities
    
    # Map back to question IDs
    results = {}
    for i, col in enumerate(matrix.columns):
        results[int(col)] = (float(loadings[i]), float(theta[i]))
    
    return results

def populate_cfa_loadings(conn, scale_tag: str, loadings: Dict[int, Tuple[float, float]]):
    """Insert CFA loadings into database"""
    cur = conn.cursor()
    
    # Delete existing for this version/scale
    cur.execute("""
        DELETE FROM cfa_loadings 
        WHERE results_version = %s AND scale_tag = %s
    """, (RESULTS_VERSION, scale_tag))
    
    # Insert new loadings
    for question_id, (lambda_std, theta) in loadings.items():
        cur.execute("""
            INSERT INTO cfa_loadings (results_version, scale_tag, question_id, lambda_std, theta)
            VALUES (%s, %s, %s, %s, %s)
        """, (RESULTS_VERSION, scale_tag, question_id, lambda_std, theta))
    
    conn.commit()
    cur.close()

def main():
    """Main execution"""
    print(f"🔬 Starting CFA Loadings Computation (version={RESULTS_VERSION})")
    
    conn = get_db_connection()
    
    try:
        # Fetch all scales
        scales = fetch_scales_and_items(conn)
        print(f"📊 Found {len(scales)} scales to process")
        
        success_count = 0
        skip_count = 0
        error_count = 0
        
        for scale_tag, question_ids in scales.items():
            try:
                print(f"\n🔍 Processing scale: {scale_tag} ({len(question_ids)} items)")
                
                # Fetch data
                matrix = fetch_response_matrix(conn, question_ids)
                n_sessions = len(matrix)
                
                if n_sessions < MIN_SAMPLE_SIZE:
                    print(f"  ⚠️  Skipping: insufficient data (n={n_sessions})")
                    skip_count += 1
                    continue
                
                print(f"  ✓ Fetched {n_sessions} complete sessions")
                
                # Run CFA
                loadings = compute_cfa_loadings(matrix)
                print(f"  ✓ Computed CFA loadings")
                
                # Store results
                populate_cfa_loadings(conn, scale_tag, loadings)
                print(f"  ✓ Stored {len(loadings)} loadings")
                
                success_count += 1
                
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
                error_count += 1
                continue
        
        print(f"\n{'='*50}")
        print(f"✅ Success: {success_count} scales")
        print(f"⚠️  Skipped: {skip_count} scales")
        print(f"❌ Errors: {error_count} scales")
        print(f"{'='*50}")
        
        return 0 if error_count == 0 else 1
        
    finally:
        conn.close()

if __name__ == '__main__':
    sys.exit(main())
