import React from "react";

export default function OverlayChips({ overlay_neuro, overlay_state }: { overlay_neuro?: string; overlay_state?: string; }) {
  const Chip = ({label, value, tip}:{label:string; value?:string; tip:string}) => (
    <span title={tip} className="inline-flex items-center px-2 py-1 rounded-full text-xs border">
      <strong className="mr-1">{label}</strong>
      <span>{value ?? "0"}</span>
    </span>
  );
  return (
    <div className="flex gap-2">
      <Chip label="Neuro" value={overlay_neuro} tip="Trait-level emotional volatility (z-based, cohort-relative)" />
      <Chip label="State" value={overlay_state} tip="Today’s conditions (stress/time/sleep/focus weighted index)" />
    </div>
  );
}
