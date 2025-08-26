export interface PrismType {
  code: string;
  title: string;
  functions: string;
  quadra: string;
  att: string;
  rat: string;
  club: string;
  lead: string;
  crea: string;
  one: string;
}

export interface RelationLabel {
  display: string;
  base: number;
}

export const types: PrismType[] = [
  {"code":"ILE","title":"Idea Catalyst","functions":"Ne–Ti","quadra":"Alpha","att":"E","rat":"P","club":"NT","lead":"Ne","crea":"Ti","one":"Generates options fast; playful pattern-finder that kickstarts momentum."},
  {"code":"LII","title":"Framework Architect","functions":"Ti–Ne","quadra":"Alpha","att":"I","rat":"J","club":"NT","lead":"Ti","crea":"Ne","one":"Builds clean mental models; clarifies rules and edge cases."},
  {"code":"SEI","title":"Comfort Harmonizer","functions":"Si–Fe","quadra":"Alpha","att":"I","rat":"P","club":"SF","lead":"Si","crea":"Fe","one":"Tunes vibe and pace; creates calm, pleasant rhythms for people."},
  {"code":"ESE","title":"Atmosphere Host","functions":"Fe–Si","quadra":"Alpha","att":"E","rat":"J","club":"SF","lead":"Fe","crea":"Si","one":"Lifts morale and inclusion; keeps everyone engaged and cared for."},
  {"code":"SLE","title":"Tactical Commander","functions":"Se–Ti","quadra":"Beta","att":"E","rat":"P","club":"ST","lead":"Se","crea":"Ti","one":"Takes ground decisively; cuts fluff and pushes through obstacles."},
  {"code":"LSI","title":"Systems Marshal","functions":"Ti–Se","quadra":"Beta","att":"I","rat":"J","club":"ST","lead":"Ti","crea":"Se","one":"Enforces order; organizes workflows and upholds standards."},
  {"code":"IEI","title":"Vision Muse","functions":"Ni–Fe","quadra":"Beta","att":"I","rat":"P","club":"NF","lead":"Ni","crea":"Fe","one":"Spots trajectories early; frames meaning and timing for the group."},
  {"code":"EIE","title":"Inspiration Orchestrator","functions":"Fe–Ni","quadra":"Beta","att":"E","rat":"J","club":"NF","lead":"Fe","crea":"Ni","one":"Rallies emotion around a story; drives coordinated action."},
  {"code":"SEE","title":"Relational Driver","functions":"Se–Fi","quadra":"Gamma","att":"E","rat":"P","club":"SF","lead":"Se","crea":"Fi","one":"Moves people through values and presence; creates momentum."},
  {"code":"ESI","title":"Boundary Guardian","functions":"Fi–Se","quadra":"Gamma","att":"I","rat":"J","club":"SF","lead":"Fi","crea":"Se","one":"Protects principles; gives honest feedback and clear limits."},
  {"code":"ILI","title":"Foresight Analyst","functions":"Ni–Te","quadra":"Gamma","att":"I","rat":"P","club":"NT","lead":"Ni","crea":"Te","one":"Anticipates outcomes; pressure-tests plans with data."},
  {"code":"LIE","title":"Strategic Executor","functions":"Te–Ni","quadra":"Gamma","att":"E","rat":"J","club":"NT","lead":"Te","crea":"Ni","one":"Sets metrics, ships; turns strategy into deliverables."},
  {"code":"LSE","title":"Operations Steward","functions":"Te–Si","quadra":"Delta","att":"E","rat":"J","club":"ST","lead":"Te","crea":"Si","one":"Stabilizes logistics; keeps systems reliable and on time."},
  {"code":"SLI","title":"Practical Optimizer","functions":"Si–Te","quadra":"Delta","att":"I","rat":"P","club":"ST","lead":"Si","crea":"Te","one":"Improves usability; trims friction quietly in the background."},
  {"code":"IEE","title":"Possibility Connector","functions":"Ne–Fi","quadra":"Delta","att":"E","rat":"P","club":"NF","lead":"Ne","crea":"Fi","one":"Spots opportunities via people; builds novel, values-aligned links."},
  {"code":"EII","title":"Integrity Guide","functions":"Fi–Ne","quadra":"Delta","att":"I","rat":"J","club":"NF","lead":"Fi","crea":"Ne","one":"Coaches with empathy; aligns choices to values and long-term fit."}
];

export const relationLabels: Record<string, RelationLabel> = {
  "dual":{"display":"Complement","base":45},
  "mirror":{"display":"Parallel Strategists","base":28},
  "activity":{"display":"Spark","base":35},
  "semi_dual":{"display":"Near Complement","base":30},
  "identity":{"display":"Same Type","base":18},
  "kindred":{"display":"Look-alike","base":22},
  "comparative":{"display":"Cousins","base":15},
  "quasi_identical":{"display":"Near Twin","base":12},
  "mirage":{"display":"Foil","base":10},
  "contrary":{"display":"Counterbalance","base":8},
  "super_ego":{"display":"Value Clash","base":5},
  "supervision_supervises":{"display":"Supervisor → Supervisee","base":-12},
  "supervision_supervised":{"display":"Supervisee ← Supervisor","base":-18},
  "benefit_benefactor":{"display":"Benefactor → Beneficiary","base":-6},
  "benefit_beneficiary":{"display":"Beneficiary ← Benefactor","base":-9},
  "conflict":{"display":"Opposition","base":-30}
};

// Complete 16×16 relation matrix (PRISM v1 mapping)
export const relationMatrix: Record<string, Record<string, string>> = {
  "ILE": {
    "ILE": "identity", "LII": "mirror", "SEI": "dual", "ESE": "activity",
    "SLE": "contrary", "LSI": "conflict", "IEI": "conflict", "EIE": "mirage",
    "SEE": "contrary", "ESI": "conflict", "ILI": "comparative", "LIE": "kindred",
    "LSE": "mirage", "SLI": "conflict", "IEE": "contrary", "EII": "conflict"
  },
  "LII": {
    "ILE": "mirror", "LII": "identity", "SEI": "activity", "ESE": "dual",
    "SLE": "conflict", "LSI": "contrary", "IEI": "mirage", "EIE": "conflict",
    "SEE": "conflict", "ESI": "contrary", "ILI": "kindred", "LIE": "comparative",
    "LSE": "conflict", "SLI": "mirage", "IEE": "conflict", "EII": "contrary"
  },
  "SEI": {
    "ILE": "dual", "LII": "activity", "SEI": "identity", "ESE": "mirror",
    "SLE": "mirage", "LSI": "super_ego", "IEI": "contrary", "EIE": "conflict",
    "SEE": "comparative", "ESI": "kindred", "ILI": "conflict", "LIE": "contrary",
    "LSE": "activity", "SLI": "dual", "IEE": "mirage", "EII": "super_ego"
  },
  "ESE": {
    "ILE": "activity", "LII": "dual", "SEI": "mirror", "ESE": "identity",
    "SLE": "super_ego", "LSI": "mirage", "IEI": "conflict", "EIE": "contrary",
    "SEE": "kindred", "ESI": "comparative", "ILI": "contrary", "LIE": "conflict",
    "LSE": "dual", "SLI": "activity", "IEE": "super_ego", "EII": "mirage"
  },
  "SLE": {
    "ILE": "contrary", "LII": "conflict", "SEI": "mirage", "ESE": "super_ego",
    "SLE": "identity", "LSI": "mirror", "IEI": "dual", "EIE": "activity",
    "SEE": "kindred", "ESI": "comparative", "ILI": "supervision_supervised", "LIE": "quasi_identical",
    "LSE": "conflict", "SLI": "contrary", "IEE": "mirage", "EII": "super_ego"
  },
  "LSI": {
    "ILE": "conflict", "LII": "contrary", "SEI": "super_ego", "ESE": "mirage",
    "SLE": "mirror", "LSI": "identity", "IEI": "activity", "EIE": "dual",
    "SEE": "comparative", "ESI": "kindred", "ILI": "quasi_identical", "LIE": "supervision_supervises",
    "LSE": "contrary", "SLI": "conflict", "IEE": "super_ego", "EII": "mirage"
  },
  "IEI": {
    "ILE": "conflict", "LII": "mirage", "SEI": "contrary", "ESE": "conflict",
    "SLE": "dual", "LSI": "activity", "IEI": "identity", "EIE": "mirror",
    "SEE": "super_ego", "ESI": "mirage", "ILI": "kindred", "LIE": "comparative",
    "LSE": "supervision_supervised", "SLI": "quasi_identical", "IEE": "contrary", "EII": "conflict"
  },
  "EIE": {
    "ILE": "mirage", "LII": "conflict", "SEI": "conflict", "ESE": "contrary",
    "SLE": "activity", "LSI": "dual", "IEI": "mirror", "EIE": "identity",
    "SEE": "mirage", "ESI": "super_ego", "ILI": "comparative", "LIE": "kindred",
    "LSE": "quasi_identical", "SLI": "supervision_supervises", "IEE": "conflict", "EII": "contrary"
  },
  "SEE": {
    "ILE": "contrary", "LII": "conflict", "SEI": "comparative", "ESE": "kindred",
    "SLE": "kindred", "LSI": "comparative", "IEI": "super_ego", "EIE": "mirage",
    "SEE": "identity", "ESI": "mirror", "ILI": "dual", "LIE": "activity",
    "LSE": "conflict", "SLI": "contrary", "IEE": "supervision_supervised", "EII": "quasi_identical"
  },
  "ESI": {
    "ILE": "conflict", "LII": "contrary", "SEI": "kindred", "ESE": "comparative",
    "SLE": "comparative", "LSI": "kindred", "IEI": "mirage", "EIE": "super_ego",
    "SEE": "mirror", "ESI": "identity", "ILI": "activity", "LIE": "dual",
    "LSE": "contrary", "SLI": "conflict", "IEE": "quasi_identical", "EII": "supervision_supervises"
  },
  "ILI": {
    "ILE": "comparative", "LII": "kindred", "SEI": "conflict", "ESE": "contrary",
    "SLE": "supervision_supervised", "LSI": "quasi_identical", "IEI": "kindred", "EIE": "comparative",
    "SEE": "dual", "ESI": "activity", "ILI": "identity", "LIE": "mirror",
    "LSE": "mirage", "SLI": "super_ego", "IEE": "conflict", "EII": "contrary"
  },
  "LIE": {
    "ILE": "kindred", "LII": "comparative", "SEI": "contrary", "ESE": "conflict",
    "SLE": "quasi_identical", "LSI": "supervision_supervises", "IEI": "comparative", "EIE": "kindred",
    "SEE": "activity", "ESI": "dual", "ILI": "mirror", "LIE": "identity",
    "LSE": "super_ego", "SLI": "mirage", "IEE": "conflict", "EII": "contrary"
  },
  "LSE": {
    "ILE": "mirage", "LII": "conflict", "SEI": "activity", "ESE": "dual",
    "SLE": "conflict", "LSI": "contrary", "IEI": "supervision_supervised", "EIE": "quasi_identical",
    "SEE": "conflict", "ESI": "contrary", "ILI": "mirage", "LIE": "super_ego",
    "LSE": "identity", "SLI": "mirror", "IEE": "dual", "EII": "activity"
  },
  "SLI": {
    "ILE": "conflict", "LII": "mirage", "SEI": "dual", "ESE": "activity",
    "SLE": "contrary", "LSI": "conflict", "IEI": "quasi_identical", "EIE": "supervision_supervises",
    "SEE": "contrary", "ESI": "conflict", "ILI": "super_ego", "LIE": "mirage",
    "LSE": "mirror", "SLI": "identity", "IEE": "activity", "EII": "dual"
  },
  "IEE": {
    "ILE": "contrary", "LII": "conflict", "SEI": "mirage", "ESE": "super_ego",
    "SLE": "mirage", "LSI": "super_ego", "IEI": "contrary", "EIE": "conflict",
    "SEE": "supervision_supervised", "ESI": "quasi_identical", "ILI": "conflict", "LIE": "conflict",
    "LSE": "dual", "SLI": "activity", "IEE": "identity", "EII": "mirror"
  },
  "EII": {
    "ILE": "conflict", "LII": "contrary", "SEI": "super_ego", "ESE": "mirage",
    "SLE": "super_ego", "LSI": "mirage", "IEI": "conflict", "EIE": "contrary",
    "SEE": "quasi_identical", "ESI": "supervision_supervises", "ILI": "contrary", "LIE": "contrary",
    "LSE": "activity", "SLI": "dual", "IEE": "mirror", "EII": "identity"
  }
};

// Helper to map types by code
export const T = Object.fromEntries(types.map(t => [t.code, t]));

// Precise relation lookup using the complete matrix
export function relationKey(A: string, B: string): string {
  return relationMatrix[A]?.[B] || "identity";
}

// Core Alignment scoring (0-50)
export function coreScore(A: string, B: string): number {
  const key = relationKey(A, B);
  const base = relationLabels[key].base; // -30 to 45
  // Scale to 0-50: map min=-30 -> 0, max=45 -> 50
  return Math.round((base + 30) * (50/75));
}

// State interface
export interface StateProfile {
  Np: number; // N− calm/regulated state %
  N0: number; // N0 neutral state %
  Nn: number; // N+ stressed/reactive state %
}

// Trait interface
export interface TraitProfile {
  O: number; // Openness
  C: number; // Conscientiousness
  E: number; // Extraversion
  A: number; // Agreeableness
  N: number; // Neuroticism
}

// Lanes interface
export interface LanesProfile {
  structure: number; // -3 to +3
  care: number;
  energy: number;
  sensing: number;
  insight: number;
}

// Full fit input
export interface FitInput {
  A: string;
  B: string;
  state: {
    A: StateProfile;
    B: StateProfile;
  };
  traits: {
    A: TraitProfile;
    B: TraitProfile;
  };
  lanes: LanesProfile;
}

// Full fit scoring (0-100)
export function fitScore(input: FitInput): number {
  const core = coreScore(input.A, input.B); // 0-50
  
  // Corrected state adjustment: N− (calm) positive, N+ (stress) negative
  const stateAdj = Math.round(10 * (
    (input.state.A.Np - input.state.A.Nn) + 
    (input.state.B.Np - input.state.B.Nn)
  )); // -20 to +20
  
  const traitAdjA = (input.traits.A.A >= 70 ? 3 : 0) + 
                    (input.traits.A.C >= 70 ? 3 : 0) + 
                    (input.traits.A.N >= 70 ? -3 : 0);
  const traitAdjB = (input.traits.B.A >= 70 ? 3 : 0) + 
                    (input.traits.B.C >= 70 ? 3 : 0) + 
                    (input.traits.B.N >= 70 ? -3 : 0);
  const traitsAdj = Math.max(-15, Math.min(15, traitAdjA + traitAdjB));
  
  const lanesSum = input.lanes.structure + input.lanes.care + input.lanes.energy + 
                   input.lanes.sensing + input.lanes.insight; // -15 to +15
  
  const raw = core + 
              Math.max(-20, Math.min(20, stateAdj)) + 
              traitsAdj + 
              Math.max(-15, Math.min(15, lanesSum));
  
  return Math.max(0, Math.min(100, raw));
}

// Band classification
export function band(score: number): "Supportive" | "Stretch" | "Friction" {
  if (score >= 70) return "Supportive";
  if (score >= 45) return "Stretch";
  return "Friction";
}

// Default neutral profiles for demos
export const defaultState: StateProfile = { Np: 50, N0: 30, Nn: 20 }; // 50% calm, 30% neutral, 20% stressed
export const defaultTraits: TraitProfile = { O: 50, C: 50, E: 50, A: 50, N: 50 };
export const defaultLanes: LanesProfile = { structure: 0, care: 0, energy: 0, sensing: 0, insight: 0 };

// Type order for heatmap
export const typeOrder = [
  "ILE", "LII", "SEI", "ESE", 
  "SLE", "LSI", "IEI", "EIE",
  "SEE", "ESI", "ILI", "LIE",
  "LSE", "SLI", "IEE", "EII"
];