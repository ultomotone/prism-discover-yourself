// PRISM SEO Ops Console - Type Definitions

export type RedirectStatus = 301 | 302;

export interface Redirect {
  id: string;
  from: string;
  to: string;
  note?: string;
  status: RedirectStatus;
  hasIssue?: boolean;
  issueType?: 'chain' | 'loop' | 'none';
}

export type SitemapSection = 'pages' | 'blog' | 'glossary';
export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapUrl {
  id: string;
  url: string;
  lastmod: Date;
  priority: number;
  changefreq: ChangeFreq;
  section: SitemapSection;
}

export type SchemaType = 
  | 'Organization'
  | 'BreadcrumbList'
  | 'Article'
  | 'FAQPage'
  | 'HowTo'
  | 'Product'
  | 'SoftwareApplication'
  | 'ScholarlyArticle';

export interface SchemaSnippet {
  id: string;
  type: SchemaType;
  payload: Record<string, any>;
  createdAt: Date;
  name?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type FunctionCode = 'Ti' | 'Te' | 'Fi' | 'Fe' | 'Ni' | 'Ne' | 'Si' | 'Se';
export type DimensionLevel = '1D' | '2D' | '3D' | '4D';

export interface DrillCard {
  id: string;
  function: FunctionCode;
  level: DimensionLevel;
  habit: string;
  duration: string;
}

export interface RelatedLink {
  label: string;
  url: string;
}

export interface GlossaryLinks {
  pillar: string;
  siblings: string[];
  glossary: string;
  cta: {
    label: string;
    url: string;
  };
}

export interface GlossaryMeta {
  title: string;
  description: string;
  ogImageAlt: string;
}

export type GlossaryTemplate = 'dimensionality' | 'relational-fit';

export interface GlossaryEntry {
  id: string;
  title: string;
  slug: string;
  template: GlossaryTemplate;
  lead: string;
  why: string;
  habits: string[];
  faqs: FaqItem[];
  links: GlossaryLinks;
  meta: GlossaryMeta;
  createdAt: Date;
}

export interface CalloutBlock {
  id: string;
  title: string;
  body: string;
}

export interface RelatedContentBlock {
  id: string;
  links: RelatedLink[];
}

// User roles
export type UserRole = 'seo-admin' | 'editor';

// Standard copy blocks
export const STANDARD_DISCLAIMER = "PRISM content is educational and non-clinical. It is not a medical or psychological diagnosis or treatment.";

export const CTA_LABELS = [
  'Start the PRISM Assessment',
  'Book a PRISM Coaching Session',
  'Request an Enterprise Demo',
  'Join the Newsletter',
  'Explore Function Guides'
] as const;
