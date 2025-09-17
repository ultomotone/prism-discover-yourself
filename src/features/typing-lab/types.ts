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

export interface TypingLabStateProfile {
  name: string;
  triggers: string;
  behaviors: string;
  strengths: string;
  risks: string;
  reset: string;
}

export interface TypingLabReadingGuide {
  dimensionality: string;
  strength: string;
  overlay: string;
}

export interface TypingLabAssessmentMap {
  strengthItems: string;
  dimensionalItems: string;
  ipsatives: string;
}

export interface TypingLabFaqItem {
  question: string;
  answer: string;
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
  confidenceExplanation?: string;
  overlayExplanation?: string;
  functionMap: Record<InformationElement, TypingLabFunctionDetail>;
  contexts: TypingLabContextsCopy;
  contextBalance: TypingLabContextBalance;
  states?: TypingLabStateProfile[];
  readingGuide?: TypingLabReadingGuide;
  assessmentMap?: TypingLabAssessmentMap;
  evidence: TypingLabEvidenceItem[];
  differentials: TypingLabDifferential[];
  falsification: string[];
  coachingSnapshot: string[];
  futureResearch?: string[];
  counterevidenceLog?: string[];
  faq?: TypingLabFaqItem[];
  ethicsNote: string;
  versionLog: TypingLabVersionLogEntry[];
  image?: string;
  featured?: boolean;
  debated?: boolean;
  lastUpdated: string;
  dataCoverage: number;
}
