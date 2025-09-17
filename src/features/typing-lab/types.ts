export type ConfidenceBand = "Low" | "Medium" | "High";

export type StrengthLevel = "L" | "M" | "H";

export type EvidenceWeight = "Light" | "Moderate" | "Strong";

export type SourceKind =
  | "video"
  | "article"
  | "podcast"
  | "interview"
  | "speech"
  | "analysis"
  | "letter"
  | "transcript";

export type InformationElement =
  | "Ti"
  | "Te"
  | "Fi"
  | "Fe"
  | "Ni"
  | "Ne"
  | "Si"
  | "Se";

export interface TypingLabSource {
  kind: SourceKind;
  url: string;
  label?: string;
  timestamp?: string;
}

export interface TypingLabEvidenceItem {
  claim: string;
  source: TypingLabSource;
  interpretation: string;
  weight: EvidenceWeight;
}

export interface TypingLabAlternative {
  type: string;
  weight: number;
  note?: string;
}

export interface TypingLabFunctionDetail {
  dim: 0 | 1 | 2 | 3 | 4;
  str: StrengthLevel;
  note: string;
}

export interface TypingLabContextsCopy {
  flow: string;
  performative: string;
  stress: string;
}

export interface TypingLabContextBalance {
  flow: number;
  performative: number;
  stress: number;
}

export interface TypingLabDifferential {
  type: string;
  whyNot: string;
}

export interface TypingLabVersionLogEntry {
  date: string;
  change: string;
}

export interface TypingLabEntry {
  slug: string;
  name: string;
  role: string;
  domain: string;
  era: string;
  nationality: string;
  proposedType: string;
  overlay?: string;
  confidenceBand: ConfidenceBand;
  top2Gap: number;
  altTypes: TypingLabAlternative[];
  summary: string;
  rationale: string;
  differentiator: string;
  functionMap: Record<InformationElement, TypingLabFunctionDetail>;
  contexts: TypingLabContextsCopy;
  contextBalance: TypingLabContextBalance;
  evidence: TypingLabEvidenceItem[];
  differentials: TypingLabDifferential[];
  falsification: string[];
  coachingSnapshot: string[];
  ethicsNote: string;
  versionLog: TypingLabVersionLogEntry[];
  image?: string;
  featured?: boolean;
  debated?: boolean;
  lastUpdated: string;
  dataCoverage: number;
}
