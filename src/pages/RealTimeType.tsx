import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  aggregateCompletions,
  DailyCompletion,
  AggregateMode,
} from "@/utils/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Filler,
  Tooltip,
  CategoryScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Filler,
  Tooltip,
  CategoryScale,
);

interface HistoryItem {
  time: string;
  core: string;
  fit: string;
  score: number;
}

const RealTimeType: React.FC = () => {
  const [daily, setDaily] = useState<DailyCompletion[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<AggregateMode>("day");
  const chartRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchData = async () => {
    const start = new Date();
    start.setDate(start.getDate() - 89);
    const { data: stats, error: statsError } = await supabase
      .from("dashboard_statistics")
      .select("stat_date, daily_assessments, total_assessments")
      .gte("stat_date", start.toISOString().split("T")[0])
      .order("stat_date", { ascending: true });
    if (!statsError && stats) {
      setDaily(
        stats.map((s) => ({ date: s.stat_date as string, value: s.daily_assessments as number })),
      );
      if (stats.length > 0) {
        setTotal((stats[stats.length - 1].total_assessments as number) || 0);
      }
    }
    const { data: recent, error: recentError } = await supabase.rpc(
      "get_recent_assessments_safe",
    );
    if (!recentError && recent) {
      const items = (recent as any[]).map((r) => ({
        time: r.created_at as string,
        core: (r.type_display as string).substring(0, 3),
        fit: (r.type_display as string).includes("+")
          ? "+"
          : (r.type_display as string).includes("–")
            ? "–"
            : "N",
        score: Math.round((r.fit_score as number) || 0),
      }));
      setHistory(items);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("real-time-type")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        fetchData,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current;
    const data = aggregateCompletions(daily, mode);

    // Skip rendering when there's no canvas or data
    if (!ctx || data.length === 0) {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Completions",
            data,
            tension: 0.32,
            fill: true,
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4,
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79,70,229,0.12)",
            parsing: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        normalized: true,
        interaction: { mode: "index" as const, intersect: false },
        spanGaps: true,
        scales: {
          x: {
            type: "time",
            time: { unit: mode },
            grid: { display: false },
            bounds: "ticks",
            ticks: { source: "data" },
          },
          y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.2)" } },
        },
        plugins: { legend: { display: false } },
      },
    });
  }, [daily, mode]);

  const setRange = (m: AggregateMode) => setMode(m);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Real-Time Assessment Analytics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Live dashboard showing PRISM personality assessment completions and trends in real-time.
        </p>
      </div>

      <section className="glass rounded-2xl border border-slate-200/70 p-6 shadow-lg dark:border-slate-800/70">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">
            Completions Overview — Total {total}
          </h2>
          <div className="flex gap-2">
            {(["day", "week", "month"] as AggregateMode[]).map((m) => (
              <Button
                key={m}
                onClick={() => setRange(m)}
                size="sm"
                className={cn(
                  "px-3 py-1 rounded-lg text-sm",
                  mode === m
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700",
                )}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="h-96">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </section>

      <section className="mt-6 glass rounded-2xl border border-slate-200/70 p-6 shadow-lg dark:border-slate-800/70">
        <h2 className="text-lg font-semibold mb-4">Completion History</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50/60 dark:bg-slate-900/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Time Completed
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Core Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overlay Fit
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fit Score (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white/70 dark:bg-slate-900/20">
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No recent assessments available
                  </td>
                </tr>
              ) : (
                history.slice(0, 25).map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {new Date(item.time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.core}</td>
                    <td className="px-4 py-3 text-sm">{item.fit}</td>
                    <td className="px-4 py-3 text-sm">{item.score}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </section>
      </div>
  );
};

export default RealTimeType;
