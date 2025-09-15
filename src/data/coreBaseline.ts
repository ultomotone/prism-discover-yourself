import { coreScore } from "./relationalFit";

export const CORE_TYPES = [
  "ILE","SEI","ESE","LII",
  "EIE","LSI","SLE","IEI",
  "SEE","ILI","LIE","ESI",
  "LSE","EII","IEE","SLI",
] as const;

export type CoreType = (typeof CORE_TYPES)[number];

export const CORE_BASELINE_MATRIX: number[][] = CORE_TYPES.map((a) =>
  CORE_TYPES.map((b) => {
    if (a === b) return 1;
    const ab = coreScore(a, b) / 50;
    const ba = coreScore(b, a) / 50;
    const v = (ab + ba) / 2;
    return Math.max(0, Math.min(1, v)); // clamp 0..1
  })
);

// Optional upper-triangle lookup map, useful for quick pair lookups
export const CORE_BASELINE: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (let r = 0; r < CORE_TYPES.length; r++) {
    for (let c = r + 1; c < CORE_TYPES.length; c++) {
      map[`${CORE_TYPES[r]}_${CORE_TYPES[c]}`] = CORE_BASELINE_MATRIX[r][c];
    }
  }
  return map;
})();
