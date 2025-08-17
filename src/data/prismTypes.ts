export interface PrismType {
  code: string;
  baseCreative: string;
  publicArchetype: string;
  professionalLabel: string;
  slug: string;
  description: string;
}

export const prismTypes: PrismType[] = [
  {
    code: "ILE",
    baseCreative: "Ne–Ti",
    publicArchetype: "Idea Catalyst",
    professionalLabel: "Exploratory Analyst",
    slug: "idea-catalyst",
    description: "Generates options and prototypes clean logical frames."
  },
  {
    code: "LII",
    baseCreative: "Ti–Ne",
    publicArchetype: "Framework Architect",
    professionalLabel: "Systems Theorist",
    slug: "framework-architect",
    description: "Builds precise models; explores implications and edge cases."
  },
  {
    code: "SEI",
    baseCreative: "Si–Fe",
    publicArchetype: "Comfort Harmonizer",
    professionalLabel: "Experiential Caregiver",
    slug: "comfort-harmonizer",
    description: "Tunes into bodily cues and mood; creates ease for people."
  },
  {
    code: "ESE",
    baseCreative: "Fe–Si",
    publicArchetype: "Atmosphere Host",
    professionalLabel: "Social Facilitator",
    slug: "atmosphere-host",
    description: "Lifts group affect; organizes experiences that feel good."
  },
  {
    code: "SLE",
    baseCreative: "Se–Ti",
    publicArchetype: "Tactical Commander",
    professionalLabel: "Field Strategist",
    slug: "tactical-commander",
    description: "Reads the field and acts decisively; enforces clear logic."
  },
  {
    code: "LSI",
    baseCreative: "Ti–Se",
    publicArchetype: "Systems Marshal",
    professionalLabel: "Compliance Architect",
    slug: "systems-marshal",
    description: "Codifies rules and applies firm, timely execution."
  },
  {
    code: "IEI",
    baseCreative: "Ni–Fe",
    publicArchetype: "Vision Muse",
    professionalLabel: "Narrative Futurist",
    slug: "vision-muse",
    description: "Senses trajectories and evokes meaning through tone."
  },
  {
    code: "EIE",
    baseCreative: "Fe–Ni",
    publicArchetype: "Inspiration Orchestrator",
    professionalLabel: "Change Mobilizer",
    slug: "inspiration-orchestrator",
    description: "Rallies emotion around a compelling future narrative."
  },
  {
    code: "LIE",
    baseCreative: "Te–Ni",
    publicArchetype: "Strategic Executor",
    professionalLabel: "Outcome Operator",
    slug: "strategic-executor",
    description: "Optimizes by metrics; scales processes toward long-range aims."
  },
  {
    code: "ILI",
    baseCreative: "Ni–Te",
    publicArchetype: "Foresight Analyst",
    professionalLabel: "Risk & Signals Analyst",
    slug: "foresight-analyst",
    description: "Models likely futures; recommends efficient bets."
  },
  {
    code: "SEE",
    baseCreative: "Se–Fi",
    publicArchetype: "Relational Driver",
    professionalLabel: "Persuasive Operator",
    slug: "relational-driver",
    description: "Pushes for outcomes while protecting personal bonds."
  },
  {
    code: "ESI",
    baseCreative: "Fi–Se",
    publicArchetype: "Boundary Guardian",
    professionalLabel: "Values Enforcer",
    slug: "boundary-guardian",
    description: "Stands for principles; keeps lines clear in the moment."
  },
  {
    code: "LSE",
    baseCreative: "Te–Si",
    publicArchetype: "Operations Steward",
    professionalLabel: "Process Manager",
    slug: "operations-steward",
    description: "Standardizes, schedules, and delivers reliably."
  },
  {
    code: "SLI",
    baseCreative: "Si–Te",
    publicArchetype: "Practical Optimizer",
    professionalLabel: "Hands-on Engineer",
    slug: "practical-optimizer",
    description: "Improves comfort and efficiency with tangible fixes."
  },
  {
    code: "IEE",
    baseCreative: "Ne–Fi",
    publicArchetype: "Possibility Connector",
    professionalLabel: "Opportunity Catalyst",
    slug: "possibility-connector",
    description: "Spots emerging fits between people/ideas; champions potential."
  },
  {
    code: "EII",
    baseCreative: "Fi–Ne",
    publicArchetype: "Integrity Guide",
    professionalLabel: "Ethics Consultant",
    slug: "integrity-guide",
    description: "Orients by values, then explores humane options."
  }
];