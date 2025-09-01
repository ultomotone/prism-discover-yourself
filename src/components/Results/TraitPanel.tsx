import React from "react";

export default function TraitPanel({ neuro_mean, neuro_z }:{ neuro_mean?: number; neuro_z?: number }) {
  if (neuro_mean == null) return null;
  const pct = Math.max(0, Math.min(100, ((neuro_mean - 1) / 4) * 100));
  return (
    <div className="rounded-2xl border p-4">
      <h3 className="font-semibold mb-2">Traits (v1.2)</h3>
      <div className="mb-1">Neuroticism</div>
      <div className="w-full h-2 bg-gray-200 rounded">
        <div className="h-2 rounded" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs mt-2 text-gray-600">Mean: {neuro_mean?.toFixed(2)} (z={neuro_z?.toFixed(2)})</div>
    </div>
  );
}
