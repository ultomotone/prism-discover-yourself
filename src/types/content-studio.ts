// PRISM Content Studio - Type Definitions

export type PageType = 'Informational' | 'POV' | 'How-to' | 'Comparison' | 'Case';
export type Persona = 'Individual' | 'Manager' | 'Org leader' | 'Coach';
export type PrismConcept = 'Dimensionality' | 'Regulation/N_z' | 'Relational Fit';
export type ClusterType = 'Pillar' | 'Hub' | 'Support' | 'Glossary';
export type SchemaType = 'Article' | 'HowTo' | 'FAQPage';
export type CtaIntent = 'Primary' | 'Secondary';
export type LinkPriority = 'High' | 'Med' | 'Low';
export type UpdateCadence = 'Quarterly' | 'Monthly' | 'Yearly';

export interface KeywordIntent {
  id: string;
  primary: string;
  variants: string[];
  intent: PageType;
  persona: Persona;
  concepts: PrismConcept[];
  cluster: ClusterType;
}

export interface BriefMeta {
  title: string;
  description: string;
  slug: string;
}

export interface BriefFaq {
  question: string;
  answer: string;
}

export interface BriefInternalLinks {
  pillar: string;
  siblings: string[];
  glossary: string;
  cta: {
    label: string;
    url: string;
  };
}

export interface BriefImages {
  hero: string;
  diagrams: string[];
}

export interface BriefReviewers {
  seo: boolean;
  sme: boolean;
  brand: boolean;
}

export interface Brief {
  id: string;
  slug: string;
  meta: BriefMeta;
  promiseOneLine: string;
  outline: string[];
  faq: BriefFaq[];
  schema: SchemaType;
  internalLinks: BriefInternalLinks;
  images: BriefImages;
  reviewers: BriefReviewers;
  updateCadence: UpdateCadence;
  keywordIntent: KeywordIntent;
  createdAt: Date;
  updatedAt: Date;
  needsUpdate?: boolean;
}

export type UrlType = 'Pillar' | 'Hub' | 'Support' | 'Glossary' | 'Product' | 'Coaching' | 'Enterprise';

export interface UrlInventory {
  id: string;
  url: string;
  title: string;
  type: UrlType;
  primaryTopic: string;
  secondaryTopics: string[];
}

export interface LinkSuggestion {
  id: string;
  fromUrl: string;
  toUrl: string;
  anchor: string;
  rationale: string;
  priority: LinkPriority;
  enabled: boolean;
}

export interface CannibalizationWarning {
  url1: string;
  url2: string;
  sharedTopic: string;
  intent: PageType;
  recommendation: string;
}

export interface CalloutBlock {
  id: string;
  type: 'Non-clinical Tip' | 'Coach\'s Note' | 'Evidence Hook';
  title: string;
  body: string;
}

export interface FigurePlan {
  id: string;
  type: 'matrix' | 'flow' | 'checklist';
  caption: string;
  altText: string;
  description: string;
}

// Copy blocks
export const CTA_COPY = {
  primary: [
    { label: 'Start the PRISM Assessment', url: '/assessment' },
    { label: 'Book a PRISM Coaching Session', url: '/coaching' },
    { label: 'Request an Enterprise Demo', url: '/enterprise' }
  ],
  secondary: [
    { label: 'Join the Newsletter', url: '/newsletter' },
    { label: 'Explore Function Guides', url: '/guides' }
  ]
} as const;

export const NON_CLINICAL_DISCLAIMER = "PRISM content is educational and non-clinical. It is not a medical or psychological diagnosis or treatment.";

export const BRAND_FIRST_MENTION = "PRISM Dynamics™";
export const BRAND_SUBSEQUENT = "PRISM";

// Internal link rules mapping
export interface LinkRule {
  fromType: UrlType;
  toType: UrlType;
  anchorPatterns: string[];
  rationale: string;
}

export const INTERNAL_LINK_RULES: LinkRule[] = [
  {
    fromType: 'Pillar',
    toType: 'Hub',
    anchorPatterns: ['function playbooks', 'relational lanes', 'state modulation'],
    rationale: 'Model to applied deep dives'
  },
  {
    fromType: 'Hub',
    toType: 'Pillar',
    anchorPatterns: ['PRISM\'s dimensional model', 'Supply and Demand lanes'],
    rationale: 'Context and authority'
  },
  {
    fromType: 'Hub',
    toType: 'Support',
    anchorPatterns: ['daily drills', 'team pairing examples', 'validation roadmap'],
    rationale: 'Practical examples'
  },
  {
    fromType: 'Support',
    toType: 'Hub',
    anchorPatterns: ['advanced guide', 'playbook', 'case analysis'],
    rationale: 'Depth escalation'
  }
];
