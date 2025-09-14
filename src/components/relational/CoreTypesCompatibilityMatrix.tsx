import React from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { CORE_TYPES as TYPES } from "@/data/coreBaseline";

type Band = "supportive" | "stretch" | "friction" | "self" | "unknown";

function toKey(a: string, b: string) {
  const ai = TYPES.indexOf(a as any);
  const bi = TYPES.indexOf(b as any);
  const [m, n] = ai <= bi ? [a, b] : [b, a];
  return `${m}_${n}`;
}

function bandFromScore(x: number | undefined): Band {
  if (x === undefined || Number.isNaN(x)) return "unknown";
  if (x >= 0.67) return "supportive";
  if (x >= 0.40) return "stretch";
  return "friction";
}

const COLOR: Record<Band, string> = {
  supportive: "bg-green-500",
  stretch: "bg-amber-500",
  friction: "bg-rose-500",
  self: "bg-slate-200",
  unknown: "bg-slate-400",
};

export function CoreTypesCompatibilityMatrix({
  matrix,
  map,
}: {
  matrix?: number[][]; // 16x16
  map?: Record<string, number>; // pair map
}) {
  const navigate = useNavigate();

  // Build a symmetric lookup
  const lookup: Record<string, number | undefined> = {};

  if (matrix && matrix.length === 16) {
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const a = TYPES[r];
        const b = TYPES[c];
        const k = toKey(a, b);
        const val = matrix[r]?.[c];
        if (r === c) continue; // ignore diagonal
        if (lookup[k] === undefined) lookup[k] = val;
        else if (lookup[k] !== undefined && val !== undefined) {
          const avg = (Number(lookup[k]) + Number(val)) / 2;
          if (Math.abs(Number(lookup[k]) - Number(val)) > 0.05) {
            console.warn(`Asymmetry for ${k}:`, lookup[k], val, "→ avg", avg);
          }
          lookup[k] = avg;
        }
      }
    }
  }

  if (map) {
    for (const k of Object.keys(map)) {
      lookup[k] = map[k];
    }
  }

  const onCellClick = (a: string, b: string, isSelf: boolean) => {
    if (isSelf) return;
    navigate(`/relational-fit/heatmap?pair=${a}-${b}`);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold">Core Types Compatibility Matrix</h3>
        <p className="text-sm text-slate-600">Quick reference for core type alignment • Click any cell for the detailed heatmap</p>
        <div className="flex items-center justify-center gap-3 mt-2 text-xs">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500"/> Supportive</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500"/> Stretch</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-rose-500"/> Friction</span>
        </div>
      </div>

      <div className="overflow-auto border rounded-2xl p-3 bg-white">
        <div className="grid" style={{gridTemplateColumns: `80px repeat(16, 28px)`}}>
          <div />
          {TYPES.map((t) => (
            <div key={t} className="text-[10px] text-center text-slate-600 px-1 py-1 sticky top-0 bg-white">{t}</div>
          ))}

          {TYPES.map((rowType, r) => (
            <React.Fragment key={rowType}>
              <div className="text-[10px] text-right pr-2 py-1 text-slate-600 sticky left-0 bg-white">{rowType}</div>
              {TYPES.map((colType, c) => {
                const isSelf = r === c;
                const k = toKey(rowType, colType);
                const raw = isSelf ? undefined : lookup[k];
                const b: Band = isSelf ? "self" : bandFromScore(raw);
                const title = isSelf
                  ? `${rowType} × ${colType} — Self (not a relation)`
                  : `${rowType} × ${colType} — ${b.toUpperCase()} — baseline ${raw !== undefined ? raw.toFixed(2) : "n/a"}`;
                return (
                  <button
                    key={`${rowType}-${colType}`}
                    aria-label={title}
                    title={title}
                    onClick={() => onCellClick(rowType, colType, isSelf)}
                    className={cn(
                      "m-0.5 w-6 h-6 rounded-sm border focus:outline-none focus:ring-2 focus:ring-slate-500/50",
                      COLOR[b]
                    )}
                  >
                    {b === "self" && (
                      <span className="text-[9px] text-slate-500">—</span>
                    )}
                    {b === "unknown" && (
                      <span className="text-[10px] text-white font-bold">?</span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Core alignment is the starting point—regulation and supply↔demand matter more daily.</p>
    </div>
  );
}
