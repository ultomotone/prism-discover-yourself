import React, { useMemo } from "react";

type Mix = { Nminus: number; N0: number; Nplus: number }; // Reg+ (N−), Reg0 (N0), Reg− (N+)
const LABELS = [
  { key: "Nminus", title: "Reg+ (N−)", desc: "calm / well-regulated" },
  { key: "N0",     title: "Reg0 (N0)", desc: "neutral" },
  { key: "Nplus",  title: "Reg− (N+)", desc: "stressed / reactive" },
] as const;

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
function normalize(m: Mix): Mix {
  const s = m.Nminus + m.N0 + m.Nplus || 1;
  return { Nminus: clamp01(m.Nminus/s), N0: clamp01(m.N0/s), Nplus: clamp01(m.Nplus/s) };
}
const heat = (v: number) => {
  // map -0.30..+0.30 → red..green
  const x = (v + 0.30) / 0.60; // 0..1
  const h = Math.round(0 + 120 * x); // 0=red → 120=green
  return `hsl(${h} 75% 45%)`;
};

const StateOscillationMini: React.FC<{
  aName: string; bName: string; aMix: Mix; bMix: Mix;
  weights?: { Nminus: number; N0: number; Nplus: number };
}> = ({ aName, bName, aMix, bMix, weights = { Nminus: 0.15, N0: 0, Nplus: -0.15 } }) => {
  const A = normalize(aMix), B = normalize(bMix);
  const order = ["Nminus","N0","Nplus"] as const;

  const cells = useMemo(() => {
    return order.map(ak => order.map(bk => {
      const p = (A as any)[ak] * (B as any)[bk];
      const score = (weights as any)[ak] + (weights as any)[bk];
      return { ak, bk, p, score };
    }));
  }, [A,B,weights]);

  const totalAdj = useMemo(() => cells.flat().reduce((s,c)=> s + c.p * c.score, 0), [cells]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="text-sm text-muted-foreground text-center">
        We show how often each pair of states co-occurs and how that pairing nudges fit.
        Reg+ (N−) tends to lift fit; Reg− (N+) tends to lower it.
      </div>

      <div className="overflow-x-auto w-full">
        <table className="mx-auto min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 bg-background p-2 text-left align-bottom">
                <div className="font-semibold">{aName}</div>
                <div className="text-xs text-muted-foreground">state →</div>
              </th>
              {LABELS.map(l => (
                <th key={l.key} className="p-2 text-center">
                  <div className="font-semibold">{l.title}</div>
                  <div className="text-xs text-muted-foreground">{l.desc}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LABELS.map((row, i) => (
              <tr key={row.key}>
                <th className="sticky left-0 bg-background p-2 text-left">
                  <div className="font-semibold">{row.title}</div>
                  <div className="text-xs text-muted-foreground">{row.desc}</div>
                </th>
                {LABELS.map((col, j) => {
                  const c = cells[i][j];
                  return (
                    <td key={col.key} className="p-2 text-center align-middle">
                      <div className="rounded-md p-2 text-white"
                           style={{ background: heat(c.score), opacity: 0.92 }}>
                        <div className="text-xs opacity-90">{aName} × {bName}</div>
                        <div className="text-sm font-semibold">{row.title} × {col.title}</div>
                        <div className="text-xs opacity-90">
                          Pair weight: {c.score > 0 ? `+${c.score.toFixed(2)}` : c.score.toFixed(2)}
                        </div>
                        <div className="text-xs opacity-90">
                          Occurs ~ {(c.p*100).toFixed(0)}%
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="sticky left-0 bg-background p-2 text-left font-semibold">
                Net state adjustment
              </td>
              <td colSpan={3} className="p-2 text-center">
                <span className="inline-block rounded-md px-3 py-1 text-white"
                      style={{ background: heat(totalAdj) }}>
                  Overall nudge from states: {totalAdj > 0 ? `+${totalAdj.toFixed(2)}` : totalAdj.toFixed(2)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-sm text-center">
        <strong>How to read:</strong> We weight each cell by how often it happens. The greener your
        common pairings, the easier everyday fit feels; the redder, the more you'll need recovery
        habits and pacing.
      </div>
    </div>
  );
};

export const RelationalFitHero: React.FC = () => {
  // Example mixes (tweak these to your real data or pull from profile fields)
  const IEI = { Nminus: 0.45, N0: 0.35, Nplus: 0.20 }; // IEI: 45% Reg+, 35% Reg0, 20% Reg−
  const SLE = { Nminus: 0.35, N0: 0.40, Nplus: 0.25 }; // SLE: 35% Reg+, 40% Reg0, 25% Reg−

  return (
    <section className="container mx-auto max-w-4xl px-4 py-10 text-center space-y-6">
      <h1 className="text-3xl font-bold">Relational Fit = Core Alignment × State Oscillations</h1>
      <p className="text-muted-foreground">
        People don't stay in one mode. PRISM models each person's top states and how often they happen, then maps how those states interact.
        That's your practical, day-to-day fit—not just a label.
      </p>

      <div className="flex items-center justify-center gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(120 75% 45%)" }} />
          Reg+ (N−) lifts fit
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(60 75% 45%)" }} />
          Reg0 (N0) neutral
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(0 75% 45%)" }} />
          Reg− (N+) lowers fit
        </span>
      </div>

      {/* Example: IEI × SLE dual pair */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Example: IEI ↔ SLE (dual) — state-pair map</h2>
        <p className="text-sm text-muted-foreground">
          We weight the IEI's and SLE's common states by frequency, compute the nudge for each pairing,
          and roll that into the overall fit band alongside core alignment.
        </p>
      </div>

      <StateOscillationMini aName="IEI" bName="SLE" aMix={IEI} bMix={SLE} />
    </section>
  );
};

export default RelationalFitHero;