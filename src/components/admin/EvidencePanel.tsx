import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { fetchEvidenceKpis, fetchLatestDashboardStats } from '@/lib/api/admin';

type EvidenceKpis = {
  pairs_n: number | null;
  median_days_apart: number | null;
  type_stability_pct: number | null;
  r_overall: number | null;
  r_ti: number | null; r_te: number | null; r_fi: number | null; r_fe: number | null;
  r_ni: number | null; r_ne: number | null; r_si: number | null; r_se: number | null;
  mai_overall: number | null;
  updated_at: string | null;
};

type DashStats = {
  stat_date: string;
  total_assessments: number;
  daily_assessments: number;
  type_distribution: Record<string, number> | null;
  overlay_positive: number | null;
  overlay_negative: number | null;
};

export default function EvidencePanel() {
  const [kpis, setKpis] = useState<EvidenceKpis | null>(null);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [k, s] = await Promise.all([
          fetchEvidenceKpis(supabase),
          fetchLatestDashboardStats(supabase),
        ]);
        setKpis(k);
        setStats(s);
      } catch (e: any) {
        setErr(e.message ?? 'Failed to load KPIs');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading KPIs…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!kpis) return <div className="p-6">No KPI data yet.</div>;

  return (
    <div className="space-y-6">
      {/* Evidence KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Test–Retest (r)" value={kpis.r_overall ?? 0} fmt="number" />
        <KpiCard title="Type Stability" value={kpis.type_stability_pct ?? 0} fmt="pct" />
        <KpiCard title="Pairs (n)" value={kpis.pairs_n ?? 0} fmt="int" />
        <KpiCard title="MAI" value={kpis.mai_overall ?? 0} fmt="number" />
      </div>

      {/* Health / Snapshot tiles that were empty before */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Total Assessments" value={stats.total_assessments} fmt="int" />
          <KpiCard title="Today" value={stats.daily_assessments} fmt="int" />
          <KpiCard title="Overlay +" value={stats.overlay_positive ?? 0} fmt="int" />
          <KpiCard title="Overlay –" value={stats.overlay_negative ?? 0} fmt="int" />
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, fmt }:{
  title:string; value:number; fmt:'int'|'number'|'pct'
}) {
  const display =
    fmt === 'pct' ? `${(value ?? 0).toFixed(1)}%` :
    fmt === 'number' ? (value ?? 0).toFixed(3) :
    Math.round(value ?? 0);

  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold">{display}</div>
    </div>
  );
}
