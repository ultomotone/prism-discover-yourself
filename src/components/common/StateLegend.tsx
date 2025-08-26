import React from 'react';
import { overlayToRegLabel, overlayToShortDesc, overlayToColorClasses, OverlayCode } from '@/lib/stateOverlay';

export const StateLegend: React.FC<{ items?: OverlayCode[] }> = ({ 
  items = ['N-','N0','N+'] 
}) => (
  <div className="flex flex-wrap items-center gap-2">
    {items.map((ov) => (
      <span 
        key={ov} 
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${overlayToColorClasses(ov)}`}
      >
        <strong>{overlayToRegLabel(ov)}</strong>
        <span className="opacity-90">({ov})</span>
        <span className="opacity-80">· {overlayToShortDesc(ov)}</span>
      </span>
    ))}
  </div>
);