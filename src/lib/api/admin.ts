import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

// ---- Filter model ----------------------------------------------------------

const AdminFiltersSchema = z.object({
  from: z.string(),
  to: z.string(),
  overlay: z.string().optional(),
  confidence: z.string().optional(),
  type: z.string().optional(),
  device: z.string().optional(),
});
export type AdminFilters = z.infer<typeof AdminFiltersSchema>;

// ---- Live feed -------------------------------------------------------------

export type LiveRow = {
  created_at: string;
  session_id: string;
  primary_type: string | null;
  overlay_label: string | null;
  fit_score: number | null;
};

export async function fetchLiveAssessments(): Promise<LiveRow[]> {
  const { data, error } = await supabase.rpc('get_live_assessments');
  if (error) throw error;
  return (data ?? []) as LiveRow[];
}

// ---- Evidence KPIs ---------------------------------------------------------

export type EvidenceKpis = {
  id: number;
  updated_at: string | null;
  pairs_n: number | null;
  median_days_apart: number | null;
  type_stability_pct: number | null;
  r_overall: number | null;
  r_ti: number | null; r_te: number | null; r_fi: number | null; r_fe: number | null;
  r_ni: number | null; r_ne: number | null; r_si: number | null; r_se: number | null;
  mai_overall: number | null;
};

export async function fetchEvidenceKpis(): Promise<EvidenceKpis | null> {
  // Prefer RPC if you created `get_evidence_kpis()`
  const rpc = await supabase.rpc('get_evidence_kpis');
  if (!rpc.error) return rpc.data as EvidenceKpis | null;

  // Fallback: direct table read (id = 1 singleton)
  const { data, error } = await supabase
    .from('evidence_kpis')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data as EvidenceKpis | null;
}

// ---- Dashboard snapshot ----------------------------------------------------

export async function fetchDashboardSnapshot() {
  // Prefer view that always returns the latest snapshot
  const { data, error } = await supabase
    .from('dashboard_statistics_latest')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---- Manual refresh actions (buttons) --------------------------------------

export async function refreshDashboardStats() {
  // Try Edge Function wrapper first (if present)…
  const ef = await supabase.functions.invoke('refresh-dashboard', { body: {} });
  if (!ef.error) return ef.data ?? { ok: true };

  // …fallback to SQL RPC if you exposed it
  const rpc = await supabase.rpc('update_dashboard_statistics');
  if (rpc.error) throw rpc.error;
  return rpc.data;
}

export async function refreshEvidenceKpis() {
  // Call the SQL function you created: refresh_evidence_kpis()
  const { data, error } = await supabase.rpc('refresh_evidence_kpis');
  if (error) throw error;
  return data;
}

// ---- Method health ---------------------------------------------------------

const FcCoverageSchema = z.array(
  z.object({ fc_count: z.number(), sessions: z.number() })
);
const ShareEntropySchema = z.array(
  z.object({ entropy_range: z.string(), sessions: z.number() })
);
const DimensionalCoverageSchema = z.array(
  z.object({
    func: z.string(),
    min_d_items: z.number(),
    median_d_items: z.number(),
    low_coverage_sessions: z.number(),
  })
);
const SectionTimesSchema = z.array(
  z.object({ section: z.string(), median_sec: z.number(), drop_rate: z.number() })
);

const MethodHealthDataSchema = z.object({
  fcCoverage: FcCoverageSchema,
  shareEntropy: ShareEntropySchema,
  dimensionalCoverage: DimensionalCoverageSchema,
  sectionTimes: SectionTimesSchema,
});
export type MethodHealthData = z.infer<typeof MethodHealthDataSchema>;

export async function fetchMethodHealthData(): Promise<MethodHealthData> {
  const [fc, share, dim, section] = await Promise.all([
    supabase.from('v_fc_coverage').select('*'),
    supabase.from('v_share_entropy').select('*'),
    supabase.from('v_dim_coverage').select('*'),
    supabase.from('v_section_times').select('*'),
  ]);

  if (fc.error) throw fc.error;
  if (share.error) throw share.error;
  if (dim.error) throw dim.error;
  if (section.error) throw section.error;

  const parsed = MethodHealthDataSchema.safeParse({
    fcCoverage: fc.data ?? [],
    shareEntropy: share.data ?? [],
    dimensionalCoverage: dim.data ?? [],
    sectionTimes: section.data ?? [],
  });

  if (!parsed.success) throw new Error('Invalid method health data');
  return parsed.data;
}

// ---- Summary KPIs ----------------------------------------------------------

const num = z.preprocess((v) => (v == null ? 0 : Number(v)), z.number());

const SummaryKpisSchema = z.object({
  topGapMedian: num,
  confidenceMarginPct: num,
  closeCallsPct: num,
  completions: num,
  completionRatePct: num,
  medianDurationMin: num,
  speedersPct: num,
  stallersPct: num,
  duplicatesPct: num,
  validityPassPct: num,
});
export type SummaryKpis = z.infer<typeof SummaryKpisSchema>;

export async function fetchSummaryKPIs(
  filters: AdminFilters
): Promise<SummaryKpis> {
  const { data, error } = await supabase.rpc('admin_fetch_summary_kpis', filters);
  if (error) throw error;
  const parsed = SummaryKpisSchema.safeParse(data ?? {});
  if (!parsed.success) throw new Error('Invalid summary KPI data');
  return parsed.data;
}

// ---- Quality metrics -------------------------------------------------------

const QualityMetricsSchema = z.object({
  top1FitMedian: num,
  topGapMedian: num,
  confidenceMarginPct: num,
  closeCallsPct: num,
  inconsistencyMean: num,
  sdIndexMean: num,
  validityPassRatePct: num,
});
export type QualityMetrics = z.infer<typeof QualityMetricsSchema>;

export async function fetchQualityMetrics(
  filters: AdminFilters
): Promise<QualityMetrics> {
  const { data, error } = await supabase.rpc('admin_fetch_quality_metrics', filters);
  if (error) throw error;
  const parsed = QualityMetricsSchema.safeParse(data ?? {});
  if (!parsed.success) throw new Error('Invalid quality metrics data');
  return parsed.data;
}

// ---- Distributions ---------------------------------------------------------

const BucketSchema = z.object({ bucket: z.string(), count: num });
const OverlayBucketSchema = z.object({ overlay: z.string(), count: num });
const TypeBucketSchema = z.object({ type: z.string(), count: num });

const DistributionsSchema = z.object({
  confidence: z.array(BucketSchema),
  overlay: z.array(OverlayBucketSchema),
  types: z.array(TypeBucketSchema),
});
export type Distributions = z.infer<typeof DistributionsSchema>;

export async function fetchDistributions(
  filters: AdminFilters
): Promise<Distributions> {
  const { data, error } = await supabase.rpc('admin_fetch_distributions', filters);
  if (error) throw error;
  const parsed = DistributionsSchema.safeParse({
    confidence: data?.confidence ?? [],
    overlay: data?.overlay ?? [],
    types: data?.types ?? [],
  });
  if (!parsed.success) throw new Error('Invalid distributions data');
  return parsed.data;
}

// ---- Throughput trend ------------------------------------------------------

const ThroughputTrendSchema = z.array(
  z.object({ date: z.string(), count: num })
);
export type ThroughputTrend = z.infer<typeof ThroughputTrendSchema>;

export async function fetchThroughputTrend(
  filters: AdminFilters
): Promise<ThroughputTrend> {
  const { data, error } = await supabase.rpc('admin_fetch_throughput_trend', filters);
  if (error) throw error;
  const parsed = ThroughputTrendSchema.safeParse(data ?? []);
  if (!parsed.success) throw new Error('Invalid throughput trend data');
  return parsed.data;
}

// ---- Latest assessments ----------------------------------------------------

const LatestAssessmentsSchema = z.array(
  z.object({
    sessionId: z.string(),
    userId: z.string().nullable(),
    completedAt: z.string(),
    device: z.string().nullable(),
    type: z.string().nullable(),
    confidence: z.number().nullable(),
  })
);
export type LatestAssessments = z.infer<typeof LatestAssessmentsSchema>;

export async function fetchLatestAssessments(
  filters: AdminFilters
): Promise<LatestAssessments> {
  const { data, error } = await supabase.rpc('admin_fetch_latest_assessments', filters);
  if (error) throw error;
  const parsed = LatestAssessmentsSchema.safeParse(data ?? []);
  if (!parsed.success) throw new Error('Invalid latest assessments data');
  return parsed.data;
}

// ---- Test-retest reliability ----------------------------------------------

const TestRetestSchema = z.object({
  r: z.number().nullable(),
  pairs: num,
  medianDaysApart: z.number().nullable(),
});
export type TestRetestReliability = z.infer<typeof TestRetestSchema>;

export async function fetchTestRetestReliability(
  filters: AdminFilters
): Promise<TestRetestReliability> {
  const { data, error } = await supabase.rpc('admin_fetch_trr', filters);
  if (error) throw error;
  const parsed = TestRetestSchema.safeParse(data ?? {});
  if (!parsed.success) throw new Error('Invalid test-retest data');
  return parsed.data;
}
