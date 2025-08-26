import React, { useMemo } from 'react';

type Mix = { Nminus: number; N0: number; Nplus: number }; // N−, N0, N+ in 0..1
// Friendly labels: Reg+ (N−), Reg0 (N0), Reg− (N+)
const LABELS = [
  { key: 'Nminus', title: 'Reg+ (N−)', desc: 'calm / well-regulated' },
  { key: 'N0',     title: 'Reg0 (N0)', desc: 'neutral' },
  { key: 'Nplus',  title: 'Reg− (N+)', desc: 'stressed / reactive' },
] as const;

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

export const StateOscillationMatrix: React.FC<{
  aName: string;
  bName: string;
  aMix: Mix; // e.g., { Nminus:0.35, N0:0.50, Nplus:0.15 }
  bMix: Mix; // e.g., { Nminus:0.55, N0:0.30, Nplus:0.15 }
  // default state weights: Reg+ (N−) +0.15, Reg0 0, Reg− (N+) −0.15
  weights?: { Nminus: number; N0: number; Nplus: number };
}> = ({ aName, bName, aMix, bMix, weights = { Nminus: 0.15, N0: 0, Nplus: -0.15 } }) => {
  // Normalize just in case
  const norm = (m: Mix): Mix => {
    const s = m.Nminus + m.N0 + m.Nplus || 1;
    return { Nminus: clamp01(m.Nminus/s), N0: clamp01(m.N0/s), Nplus: clamp01(m.Nplus/s) };
  };
  const A = norm(aMix), B = norm(bMix);

  const cells = useMemo(() => {
    // Build 3x3 with probability mass and pair score (sum weights)
    const order = ['Nminus','N0','Nplus'] as const;
    const rows = order.map((ak) => order.map((bk) => {
      const p = (A as any)[ak] * (B as any)[bk]; // how often this pairing occurs
      const score = (weights as any)[ak] + (weights as any)[bk]; // simple additive effect
      return { ak, bk, p, score };
    }));
    return rows;
  }, [A, B, weights]);

  const totalAdj = useMemo(() => cells.flat().reduce((s,c)=> s + c.p * c.score, 0), [cells]);

  const heat = (v: number) => {
    // -0.30..+0.30 → red..green
    const x = (v + 0.30) / 0.60; // 0..1
    const h = Math.round(0 + 120 * x); // 0=red → 120=green
    return `hsl(${h} 75% 45%)`;
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-sm text-muted-foreground">
        We show how often each pair of states co-occurs and how that pairing nudges fit.
        Reg+ (N−) tends to lift fit; Reg− (N+) tends to lower it.
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[640px] border-separate border-spacing-0">
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
                           style={{ background: heat(c.score), opacity: 0.90 }}>
                        <div className="text-xs opacity-90">
                          {aName} × {bName}
                        </div>
                        <div className="text-sm font-semibold">
                          {row.title} × {col.title}
                        </div>
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

      <div className="text-sm">
        <strong>How to read:</strong> We weight each cell by how often it happens. The greener your
        common pairings, the easier everyday fit feels; the redder, the more you'll need recovery
        habits and pacing.
      </div>
    </div>
  );
};