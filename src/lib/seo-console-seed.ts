// PRISM SEO Console - Seed Data

import { GlossaryEntry, FaqItem } from '@/types/seo-console';

export const seedGlossaryEntries: Omit<GlossaryEntry, 'id' | 'createdAt'>[] = [
  {
    title: 'Dimensionality',
    slug: 'dimensionality',
    template: 'dimensionality',
    lead: "In PRISM Dynamics™, Dimensionality describes how deeply a function is developed—from 1D (novice) to 4D (adaptive expert)—and how it shifts with context and regulation (state).",
    why: "Skill isn't fixed. Dimensionality explains variability across settings and how targeted practice grows depth.",
    habits: [
      "1D to 2D: 5-minute daily drill on one sub-skill; note friction.",
      "2D to 3D: weekly edge-case review; simulate exceptions.",
      "3D to 4D: teach the skill; design drills for others."
    ],
    faqs: [
      {
        id: 'dim-faq-1',
        question: 'Is dimensionality about talent or is it trainable?',
        answer: 'Dimensionality is primarily trainable. While natural inclinations exist (type), depth comes from deliberate practice, exposure to edge cases, and contextual refinement. Anyone can move from 1D to higher dimensions with structured practice.'
      },
      {
        id: 'dim-faq-2',
        question: 'Can dimensionality temporarily drop under stress?',
        answer: 'Yes. Under high stress or dysregulation (elevated N_z), even well-developed functions can temporarily regress to lower-dimensional expression. This is normal and reversible with regulation and rest.'
      },
      {
        id: 'dim-faq-3',
        question: 'How does PRISM measure dimensionality without clinical tools?',
        answer: 'PRISM uses behavioral indicators, self-report patterns, and contextual performance markers to estimate dimensional depth. It is educational, not diagnostic, and designed for development planning rather than clinical assessment.'
      }
    ],
    links: {
      pillar: '/guides/dimensionality',
      siblings: ['/guides/ti-playbook', '/guides/fe-playbook'],
      glossary: '/glossary/relational-fit',
      cta: {
        label: 'Start the PRISM Assessment',
        url: '/assessment'
      }
    },
    meta: {
      title: 'Dimensionality — PRISM Dynamics™ Glossary',
      description: 'Learn how Dimensionality in PRISM Dynamics™ tracks skill depth from 1D novice to 4D adaptive expert, and how it shifts with context.',
      ogImageAlt: 'PRISM Dimensionality concept diagram showing progression from 1D to 4D'
    }
  },
  {
    title: 'Relational Fit',
    slug: 'relational-fit',
    template: 'relational-fit',
    lead: "Relational Fit maps Supply and Demand across five lanes—Structure, Care, Energy, Timing, Meaning—to reveal Support, Stretch, or Friction.",
    why: "Compatibility is adjustable. Lane awareness guides roles, cadence, and communication.",
    habits: [
      "Map your lanes: identify which of the five you naturally supply vs. demand.",
      "Pick one friction lane and design a bridge behavior (e.g., if you under-supply Structure, set shared calendars).",
      "Schedule a stretch practice: pair with someone who over-supplies your under-lane; observe and adapt."
    ],
    faqs: [
      {
        id: 'rf-faq-1',
        question: 'Is Relational Fit the same as type-matching?',
        answer: 'No. Relational Fit examines specific supply-demand dynamics across five lanes, independent of type. Two people of the same type can have poor fit if their dimensional depths or contextual needs differ.'
      },
      {
        id: 'rf-faq-2',
        question: 'What do I do if there's a mismatch in multiple lanes?',
        answer: 'Start with the lane causing the most friction. Design explicit agreements (e.g., Structure: weekly check-ins; Care: defined feedback cadence). Small adjustments in one lane often cascade positively.'
      },
      {
        id: 'rf-faq-3',
        question: 'Can teams intentionally pair 3D/4D with 1D/2D for development?',
        answer: 'Yes. Stretch pairings accelerate growth when framed as developmental opportunities. The key is making the dimensionality gap explicit and providing scaffolding (mentorship, safe practice) rather than expecting immediate performance parity.'
      }
    ],
    links: {
      pillar: '/guides/relational-fit',
      siblings: ['/guides/intertype-dynamics'],
      glossary: '/glossary/dimensionality',
      cta: {
        label: 'Book a PRISM Coaching Session',
        url: '/coaching'
      }
    },
    meta: {
      title: 'Relational Fit — PRISM Dynamics™ Glossary',
      description: 'Understand Relational Fit: how Supply and Demand across Structure, Care, Energy, Timing, and Meaning lanes shapes compatibility.',
      ogImageAlt: 'PRISM Relational Fit five-lane framework diagram'
    }
  }
];

export const seedSchemaExamples = [
  {
    type: 'Organization' as const,
    name: 'PRISM Organization Schema',
    payload: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "PRISM Dynamics",
      "url": "https://prismpersonality.com",
      "logo": "https://prismpersonality.com/logo.png",
      "sameAs": [
        "https://twitter.com/prismdynamics",
        "https://linkedin.com/company/prism-dynamics"
      ],
      "description": "PRISM — Personality. Regulation. Information System Mapping. Educational framework for understanding cognitive functions, dimensionality, and relational fit."
    }
  },
  {
    type: 'Product' as const,
    name: 'PRISM Assessment Schema',
    payload: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "PRISM Assessment",
      "applicationCategory": "EducationalApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Self-assessment tool for exploring cognitive function preferences, dimensionality, and developmental pathways through the PRISM Dynamics™ framework.",
      "url": "https://prismpersonality.com/assessment",
      "provider": {
        "@type": "Organization",
        "name": "PRISM Dynamics"
      }
    }
  }
];
