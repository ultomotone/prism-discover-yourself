// PRISM Content Studio - Seed Data

import { Brief, UrlInventory, KeywordIntent } from '@/types/content-studio';

export const seedKeywordIntents: Omit<KeywordIntent, 'id'>[] = [
  {
    primary: 'cognitive function development',
    variants: ['develop cognitive functions', 'improving cognitive skills', 'cognitive function training'],
    intent: 'Informational',
    persona: 'Individual',
    concepts: ['Dimensionality', 'Regulation/N_z'],
    cluster: 'Pillar'
  },
  {
    primary: 'Ti function guide',
    variants: ['introverted thinking', 'Ti development', 'Ti playbook'],
    intent: 'How-to',
    persona: 'Individual',
    concepts: ['Dimensionality'],
    cluster: 'Hub'
  }
];

export const seedBriefs: Omit<Brief, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    slug: 'dimensionality-1d-4d-measure-grow',
    meta: {
      title: 'Dimensionality (1D-4D): Measure It, Grow It - PRISM Dynamics',
      description: 'Learn how PRISM Dimensionality tracks cognitive function depth from 1D novice to 4D adaptive expert, and discover evidence-based practices to accelerate development.',
      slug: 'dimensionality-1d-4d-measure-grow'
    },
    promiseOneLine: 'Dimensionality reveals how deeply you have developed each cognitive function and provides a roadmap for targeted growth.',
    outline: [
      'What is Dimensionality in PRISM?',
      'The Four Dimensional Levels Explained',
      '1D: Surface Recognition',
      '2D: Pattern Application',
      '3D: Contextual Adaptation',
      '4D: Adaptive Expertise',
      'Why Dimensionality Matters',
      'How to Measure Your Current Level',
      'Growing from 1D to 2D',
      '2D to 3D Development Strategies',
      '3D to 4D: Teaching and Innovation',
      'Tiny Habits for Daily Practice',
      'Common Pitfalls and How to Avoid Them'
    ],
    faq: [
      {
        question: 'Is dimensionality about talent or is it trainable?',
        answer: 'Dimensionality is primarily trainable. While natural inclinations exist (type), depth comes from deliberate practice, exposure to edge cases, and contextual refinement.'
      },
      {
        question: 'Can dimensionality temporarily drop under stress?',
        answer: 'Yes. Under high stress or dysregulation (elevated N_z), even well-developed functions can temporarily regress to lower-dimensional expression. This is normal and reversible with regulation and rest.'
      },
      {
        question: 'How long does it take to move from one level to the next?',
        answer: 'Progression depends on practice quality and frequency. With structured daily drills, 1D to 2D typically takes 3-6 months. 2D to 3D requires 6-12 months of edge-case exposure. 3D to 4D is an ongoing journey of teaching and innovation.'
      }
    ],
    schema: 'Article',
    internalLinks: {
      pillar: '/guides/dimensionality',
      siblings: ['/guides/ti-playbook', '/guides/fe-playbook'],
      glossary: '/glossary/dimensionality',
      cta: {
        label: 'Start the PRISM Assessment',
        url: '/assessment'
      }
    },
    images: {
      hero: 'Illustration showing progression from 1D to 4D with visual metaphor of skill depth',
      diagrams: [
        'Matrix showing function × dimension intersections',
        'Flowchart of practice strategies by level'
      ]
    },
    reviewers: {
      seo: false,
      sme: false,
      brand: false
    },
    updateCadence: 'Quarterly',
    keywordIntent: {
      id: 'seed-ki-1',
      primary: 'cognitive function development',
      variants: ['develop cognitive functions', 'improving cognitive skills'],
      intent: 'Informational',
      persona: 'Manager',
      concepts: ['Dimensionality', 'Regulation/N_z'],
      cluster: 'Pillar'
    },
    needsUpdate: false
  },
  {
    slug: 'ti-function-playbook',
    meta: {
      title: 'Ti Function Playbook: Develop Introverted Thinking - PRISM',
      description: 'Complete guide to developing Ti (Introverted Thinking) from 1D to 4D. Includes drills, habits, and examples for building logical frameworks and analytical precision.',
      slug: 'ti-function-playbook'
    },
    promiseOneLine: 'Master introverted thinking through structured practice that builds from basic pattern recognition to adaptive analytical expertise.',
    outline: [
      'What is Ti (Introverted Thinking)?',
      'Ti Across the Dimensions',
      'Ti at 1D: Pattern Recognition',
      'Ti at 2D: Framework Application',
      'Ti at 3D: System Refinement',
      'Ti at 4D: Adaptive Analysis',
      'Daily Ti Development Drills',
      'Common Ti Challenges',
      'Ti in Team Settings',
      'Tiny Habits for Ti Growth',
      'Recommended Reading and Resources'
    ],
    faq: [
      {
        question: 'How is Ti different from Te?',
        answer: 'Ti focuses on internal logical consistency and building precise frameworks, while Te emphasizes external organization and efficiency. Ti asks "Does this make sense internally?" while Te asks "Does this work in practice?"'
      },
      {
        question: 'Can I develop Ti if it is not my dominant function?',
        answer: 'Yes. While your dominant function develops most naturally, any function can be strengthened through deliberate practice. Start with 1D drills and progress systematically.'
      }
    ],
    schema: 'HowTo',
    internalLinks: {
      pillar: '/guides/dimensionality',
      siblings: ['/guides/te-playbook', '/guides/ni-playbook'],
      glossary: '/glossary/dimensionality',
      cta: {
        label: 'Explore Function Guides',
        url: '/guides'
      }
    },
    images: {
      hero: 'Diagram of Ti function showing analytical process flow',
      diagrams: [
        'Ti development checklist by dimension',
        'Ti vs Te comparison matrix'
      ]
    },
    reviewers: {
      seo: false,
      sme: false,
      brand: false
    },
    updateCadence: 'Quarterly',
    keywordIntent: {
      id: 'seed-ki-2',
      primary: 'Ti function guide',
      variants: ['introverted thinking', 'Ti development'],
      intent: 'How-to',
      persona: 'Individual',
      concepts: ['Dimensionality'],
      cluster: 'Hub'
    },
    needsUpdate: false
  }
];

export const seedUrlInventory: Omit<UrlInventory, 'id'>[] = [
  {
    url: '/guides/dimensionality',
    title: 'Dimensionality: 1D to 4D Development',
    type: 'Pillar',
    primaryTopic: 'cognitive function development',
    secondaryTopics: ['skill depth', 'deliberate practice']
  },
  {
    url: '/guides/relational-fit',
    title: 'Relational Fit: Supply and Demand Dynamics',
    type: 'Pillar',
    primaryTopic: 'relationship compatibility',
    secondaryTopics: ['team dynamics', 'communication']
  },
  {
    url: '/guides/ti-playbook',
    title: 'Ti Function Playbook',
    type: 'Hub',
    primaryTopic: 'introverted thinking',
    secondaryTopics: ['logical frameworks', 'analytical thinking']
  },
  {
    url: '/guides/fe-playbook',
    title: 'Fe Function Playbook',
    type: 'Hub',
    primaryTopic: 'extraverted feeling',
    secondaryTopics: ['social harmony', 'emotional attunement']
  },
  {
    url: '/guides/daily-drills',
    title: 'Daily Function Development Drills',
    type: 'Support',
    primaryTopic: 'practice exercises',
    secondaryTopics: ['habit building', 'skill training']
  },
  {
    url: '/guides/team-pairing-strategies',
    title: 'Team Pairing by Dimensionality',
    type: 'Support',
    primaryTopic: 'team composition',
    secondaryTopics: ['mentorship', 'collaboration']
  },
  {
    url: '/glossary/dimensionality',
    title: 'Dimensionality - PRISM Glossary',
    type: 'Glossary',
    primaryTopic: 'dimensionality definition',
    secondaryTopics: ['1D', '2D', '3D', '4D']
  },
  {
    url: '/glossary/relational-fit',
    title: 'Relational Fit - PRISM Glossary',
    type: 'Glossary',
    primaryTopic: 'relational fit definition',
    secondaryTopics: ['supply demand', 'five lanes']
  },
  {
    url: '/assessment',
    title: 'PRISM Assessment',
    type: 'Product',
    primaryTopic: 'personality assessment',
    secondaryTopics: ['type discovery', 'function analysis']
  },
  {
    url: '/coaching',
    title: 'PRISM Coaching',
    type: 'Coaching',
    primaryTopic: 'personal development coaching',
    secondaryTopics: ['one-on-one', 'skill development']
  },
  {
    url: '/enterprise',
    title: 'PRISM for Enterprise',
    type: 'Enterprise',
    primaryTopic: 'organizational development',
    secondaryTopics: ['team building', 'leadership']
  }
];
