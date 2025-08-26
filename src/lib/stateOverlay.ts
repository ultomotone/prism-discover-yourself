// State overlay utility for consistent UI labeling and semantics
export type OverlayCode = 'N+' | 'N0' | 'N-';

export function overlayToRegLabel(ov: OverlayCode) {
  // UI aliases (keeps DB codes intact):
  // Reg+ = well-regulated (maps to N−), Reg0 = neutral (N0), Reg− = dysregulated (N+)
  switch (ov) {
    case 'N-': return 'Reg+';
    case 'N0': return 'Reg0';
    case 'N+': return 'Reg-';
    default:   return 'Reg0';
  }
}

export function overlayToShortDesc(ov: OverlayCode) {
  switch (ov) {
    case 'N-': return 'Calm, well-regulated';
    case 'N0': return 'Neutral';
    case 'N+': return 'Stressed, reactive';
    default:   return 'Neutral';
  }
}

export function overlayToColorClasses(ov: OverlayCode) {
  // Tailwind-safe neutrals
  switch (ov) {
    case 'N-': return 'bg-green-500 text-white';
    case 'N0': return 'bg-gray-300 text-gray-900';
    case 'N+': return 'bg-red-500 text-white';
    default:   return 'bg-gray-300 text-gray-900';
  }
}
