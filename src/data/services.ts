export type Audience = 'individuals' | 'organizations';

export interface Service {
  id: string;
  slug: string;
  title: string;
  audience: Audience;
  summary: string;
  bullets: string[];
  calLink: string;
}

export const services: Service[] = [
  {
    id: 'personal-discovery-20m-29-credit',
    slug: 'personal-discovery-20m-29-credit',
    title: 'Personal Discovery — 20m · $29 Credit',
    audience: 'individuals',
    summary: 'Focused 20‑minute scope call to define your top outcome and next steps.',
    bullets: [
      'Focused 1:1 call',
      'Written recommendation',
      '$29 credit toward next booking',
    ],
    calLink: 'daniel-speiss/personal-discovery-20m-29-credit',
  },
  {
    id: 'personality-mapping-call',
    slug: 'personality-mapping-call',
    title: 'Personality Mapping Call — 45m · $149',
    audience: 'individuals',
    summary: 'Decode your PRISM type and build a 7‑day action plan.',
    bullets: [
      '45‑minute session',
      '1‑page action map',
      'Next‑7‑days prompts',
    ],
    calLink: 'daniel-speiss/personality-mapping-call',
  },
  {
    id: 'compatibility-debrief-couples',
    slug: 'compatibility-debrief-couples',
    title: 'Compatibility Debrief (Couples) — 45m · $229',
    audience: 'individuals',
    summary: 'Map shared strengths and friction; install a weekly alignment ritual.',
    bullets: [
      '45‑minute joint session',
      'Pair sync plan',
      'Follow‑up cadence',
    ],
    calLink: 'daniel-speiss/compatibility-debrief-couples',
  },
  {
    id: 'career-clarity-mapping',
    slug: 'career-clarity-mapping',
    title: 'Career Clarity Mapping — 60m · $199',
    audience: 'individuals',
    summary: 'Identify best-fit roles and craft a 90‑day career plan.',
    bullets: [
      '60‑minute session',
      'Role-fit matrix',
      '90‑day plan',
    ],
    calLink: 'daniel-speiss/career-clarity-mapping',
  },
  {
    id: 'progress-retake-tune-up',
    slug: 'progress-retake-tune-up',
    title: 'Progress Retake & Tune-Up — 30m · $99',
    audience: 'individuals',
    summary: 'Use a retake to compare trends and tune habits.',
    bullets: [
      '30‑minute session',
      'Updated score trend',
      '14‑day micro-plan',
    ],
    calLink: 'daniel-speiss/progress-retake-tune-up',
  },
  {
    id: 'owner-leader-discovery-20m-49-credit',
    slug: 'owner-leader-discovery-20m-49-credit',
    title: 'Owner/Leader Discovery — 20m · $49 Credit',
    audience: 'organizations',
    summary: 'Scope call for founders and execs to pick the fastest path.',
    bullets: [
      'Focused 1:1 call',
      'Written plan',
      '$49 credit toward next step',
    ],
    calLink: 'daniel-speiss/owner-leader-discovery-20m-49-credit',
  },
  {
    id: 'team-compass-workshop-group-up-to-8',
    slug: 'team-compass-workshop-group-up-to-8',
    title: 'Team Compass Workshop (up to 8) — 90m · $1,200',
    audience: 'organizations',
    summary: 'Map your team’s PRISM and launch a 30‑day execution sprint.',
    bullets: [
      '90‑minute workshop',
      'Team compass board',
      '30‑day sprint plan',
    ],
    calLink: 'daniel-speiss/team-compass-workshop-group-up-to-8',
  },
  {
    id: 'leadership-debrief',
    slug: 'leadership-debrief',
    title: 'Leadership Debrief — 60m · $499',
    audience: 'organizations',
    summary: 'Align decision style, delegation, and rhythm by leader persona.',
    bullets: [
      '60‑minute debrief',
      '30‑60‑90 plan',
      'Alignment checklist',
    ],
    calLink: 'daniel-speiss/leadership-debrief',
  },
  {
    id: 'sales-persona-play',
    slug: 'sales-persona-play',
    title: 'Sales Persona Play — 45m · $179',
    audience: 'organizations',
    summary: 'Personalize sales calls to your PRISM persona.',
    bullets: [
      '45‑minute session',
      'Talk track by type',
      '2‑week KPI focus',
    ],
    calLink: 'daniel-speiss/sales-persona-play',
  },
  {
    id: 'manager-coaching-by-persona',
    slug: 'manager-coaching-by-persona',
    title: 'Manager: Coaching by Persona — 60m · $249',
    audience: 'organizations',
    summary: 'Coach each rep using persona-aware cadence and feedback.',
    bullets: [
      '60‑minute session',
      'Rep cheat-sheets',
      '2‑week coaching plan',
    ],
    calLink: 'daniel-speiss/manager-coaching-by-persona',
  },
  {
    id: 'hiring-fit-screen',
    slug: 'hiring-fit-screen',
    title: 'Hiring Fit Screen — 30m · $149',
    audience: 'organizations',
    summary: 'Rapid fit screen with role-risk scorecard and interview prompts.',
    bullets: [
      '30‑minute screen',
      'Fit/concern notes',
      'Interview prompts',
    ],
    calLink: 'daniel-speiss/hiring-fit-screen',
  },
  {
    id: 'leader-coaching-training',
    slug: 'leader-coaching-training',
    title: 'Leader Coaching & Training — 3 Months · $5,991',
    audience: 'organizations',
    summary: 'Three-month acceleration to tune leadership cadence and coaching.',
    bullets: [
      'Live strategy sessions',
      'Personalized playbooks',
      'Quarterly alignment',
    ],
    calLink: 'daniel-speiss/leader-coaching-training',
  },
  {
    id: 'team-performance-sprint-4-950-mo-8-12-people-2-months',
    slug: 'team-performance-sprint-4-950-mo-8-12-people-2-months',
    title: 'Team Performance Sprint — 2 Months (8–12 ppl)',
    audience: 'organizations',
    summary: 'High-intensity reset for pods of 8–12 to boost execution.',
    bullets: [
      'Team PRISM map',
      'Manager coaching upgrades',
      'Objection handling drills',
    ],
    calLink: 'daniel-speiss/team-performance-sprint-4-950-mo-8-12-people-2-months',
  },
];

export const getServiceBySlug = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);

