import { supabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export type RecentAssessment = {
  created_at: string;
  type_prefix: string;
  overlay: string | null;
  country_display: string;
  time_period: 'Today' | 'This week' | 'Earlier';
  fit_indicator: 'Strong' | 'Moderate' | 'Developing' | 'Processing';
};

export type FetchRecentAssessmentsSafeErrorKind =
  | 'unauthorized'
  | 'forbidden'
  | 'transient'
  | 'unknown';

export class FetchRecentAssessmentsSafeError extends Error {
  kind: FetchRecentAssessmentsSafeErrorKind;
  detail?: string;
  constructor(kind: FetchRecentAssessmentsSafeErrorKind, detail?: string) {
    super(detail ?? kind);
    this.name = 'FetchRecentAssessmentsSafeError';
    this.kind = kind;
    this.detail = detail;
  }
}

function mapStatus(status?: number, detail?: string): FetchRecentAssessmentsSafeError {
  if (status === 401) return new FetchRecentAssessmentsSafeError('unauthorized', detail);
  if (status === 403) return new FetchRecentAssessmentsSafeError('forbidden', detail);
  if (status === 429 || (status !== undefined && status >= 500 && status < 600)) {
    return new FetchRecentAssessmentsSafeError('transient', detail);
  }
  return new FetchRecentAssessmentsSafeError('unknown', detail);
}

export async function fetchRecentAssessmentsSafe(
  client: Pick<SupabaseClient, 'rpc'> = supabase,
): Promise<RecentAssessment[]> {
  const { data, error } = await client.rpc('get_recent_assessments_safe');
  if (error) throw mapStatus((error as any).status, (error as any).message);
  return (data ?? []) as RecentAssessment[];
}
