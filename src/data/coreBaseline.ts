import { coreScore } from "./relationalFit";

export const CORE_TYPES = [
  "ILE","SEI","ESE","LII",
  "EIE","LSI","SLE","IEI",
  "SEE","ILI","LIE","ESI",
  "LSE","EII","IEE","SLI",
] as const;

export const CORE_BASELINE_MATRIX: number[][] = CORE_TYPES.map((a) =>
  CORE_TYPES.map((b) => {
    if (a === b) return 1;
    const ab = coreScore(a, b) / 50;
    const ba = coreScore(b, a) / 50;
    return (ab + ba) / 2;
  })
);
