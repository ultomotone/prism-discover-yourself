export type Service = {
  id: string; // slug after the base, exactly as given
  scope: "individuals" | "teams";
  tagline: string; // short benefit sentence
  title: string;
  duration: string;
  price: string;
  description: string; // <= 60 words
  deliverables: string[]; // 3–5 bullets, short
  policy?: string; // one-liner
  roi: string; // one-liner: time-to-value / outcome
};

export const SERVICES: Service[] = [
  {
    id: "credit/daniel-speiss/personal-discovery-20m-29-credit",
    scope: "individuals",
    tagline: "Pick the fastest path to your #1 outcome.",
    title: "(IND · DISC · 1:1) Personal Discovery (20m) — $29 credit",
    duration: "20m",
    price: "$29.00",
    description:
      "Focused scope call for non-business needs (clarity, dating, conflict-to-calm, career). We define your #1 outcome and choose the quickest path: Personality Mapping, Compatibility Debrief, Conflict→Calm, or Career Clarity.",
    deliverables: [
      "Written recommendation",
      "$29 credit auto-applied link",
      "Direct next-step booking",
    ],
    policy:
      "$29 credited if you book within 7 days. Reschedule ≥24h; no-show forfeits credit.",
    roi: "10–15 minutes to clarity; immediate next step.",
  },
  {
    id: "daniel-speiss/personality-mapping-call",
    scope: "individuals",
    tagline: "Decode your type; turn one friction into a 7-day win.",
    title: "(IND · CLARITY · 1:1) Personality Mapping Call",
    duration: "45m",
    price: "$149.00",
    description:
      "Decode your PRISM type, lock top strengths, identify one friction, and turn it into a focused 7-day plan.",
    deliverables: ["1-page PRISM Action Map", "“Next 7 Days” prompts", "Retake schedule"],
    roi: "Actionable plan in one session; 7-day measurable shift.",
  },
  {
    id: "daniel-speiss/compatibility-debrief-couples",
    scope: "individuals",
    tagline: "Install a weekly ritual that keeps you aligned.",
    title: "(REL · RELATE · 1:1-2) Compatibility Debrief (Couples)",
    duration: "45m",
    price: "$229.00",
    description:
      "Map shared strengths and friction; set comms norms and a light weekly ritual that keeps you in sync.",
    deliverables: ["Pair Sync Plan", "“We-language” scripts", "30-day check-in cadence"],
    roi: "Reduce recurring conflict within 2–4 weeks.",
  },
  {
    id: "daniel-speiss/career-clarity-mapping",
    scope: "individuals",
    tagline: "Aim your work at your strengths, not your stress.",
    title: "(IND · CAREER · 1:1) Career Clarity Mapping",
    duration: "60m",
    price: "$199.00",
    description:
      "Role-fit matrix, lean-in/avoid tasks, and a practical 90-day plan. Includes a recruiter/manager message template.",
    deliverables: ["Role-fit matrix", "90-day plan", "Outreach template"],
    roi: "Faster pivots; fewer bad-fit applications.",
  },
  {
    id: "daniel-speiss/progress-retake-tune-up",
    scope: "individuals",
    tagline: "Measure change and double down on what compounds.",
    title: "(IND · RETAKE · 1:1) Progress Retake & Tune-Up",
    duration: "30m",
    price: "$99.00",
    description:
      "Compare trends, remove noise, and focus on one compounding behavior for the next two weeks.",
    deliverables: ["Updated score trend", "Revised prompts", "14-day micro-plan"],
    policy: "Prep: Complete a new PRISM retake before the session.",
    roi: "2-week habit focus that sticks.",
  },
  {
    id: "daniel-speiss/owner-leader-discovery-20m-49-credit",
    scope: "teams",
    tagline: "Decide the fastest path for your org.",
    title: "(BIZ · DISC · 1:1) Owner/Leader Discovery (20m) — $49 credit",
    duration: "20m",
    price: "$49.00",
    description:
      "For founders, execs, and team leads choosing between Team Compass Workshop, Leader Coaching & Training, or the Team Performance Sprint.",
    deliverables: ["Written recommendation", "Next-step link (credit applied)"],
    policy:
      "$49 credited if you book within 7 days. Reschedule ≥24h; no-show forfeits credit.",
    roi: "Quick triage → correct program selection.",
  },
  {
    id: "daniel-speiss/team-compass-workshop-group-up-to-8",
    scope: "teams",
    tagline: "See your team; set the rules; ship faster in 30 days.",
    title: "(TEAM · WORKSHOP · GROUP) Team Compass Workshop (up to 8)",
    duration: "90m",
    price: "$1,200.00",
    description:
      "Visualize your team’s PRISM map, set communication rules, and lock a 30-day execution sprint.",
    deliverables: [
      "Team Compass board",
      "Meeting/cadence norms",
      "30-day sprint plan",
      "Summary recap",
    ],
    roi: "30-day cycle speedup; less friction, clearer ownership.",
  },
  {
    id: "daniel-speiss/leadership-debrief",
    scope: "teams",
    tagline: "Align decisions, delegation, and rhythm by leader persona.",
    title: "(LEAD · LEADERSHIP · 1:1) Leadership Debrief",
    duration: "60m",
    price: "$499.00",
    description:
      "Calibrate leadership cadence, decision rights, and delegation patterns to the leader’s persona.",
    deliverables: ["30-60-90 plan", "Role/decision matrix", "Alignment checklist"],
    roi: "Cleaner escalations; fewer stalls in 2–6 weeks.",
  },
  {
    id: "daniel-speiss/sales-persona-play",
    scope: "teams",
    tagline: "Make discovery and objections feel native to the rep.",
    title: "(SALES · SALES · 1:1) Sales Persona Play",
    duration: "45m",
    price: "$179.00",
    description:
      "Personalize opener, discovery, and objections to the seller’s PRISM so calls convert and feel natural.",
    deliverables: [
      "1-page talk track by type",
      "Discovery question set",
      "2-week KPI focus",
    ],
    roi: "Shorter ramps; more consistent call quality.",
  },
  {
    id: "daniel-speiss/manager-coaching-by-persona",
    scope: "teams",
    tagline: "Coach each rep the way they learn.",
    title: "(MGR · SALES · 1:1) Manager: Coaching by Persona",
    duration: "60m",
    price: "$249.00",
    description:
      "Tune cadence, feedback, and metrics by rep persona; build a 2-week coaching plan.",
    deliverables: [
      "Manager cheat-sheet per rep",
      "2-week plan",
      "Meeting scripts",
    ],
    roi: "Higher rep adoption; fewer ‘telling not coaching’ loops.",
  },
  {
    id: "daniel-speiss/hiring-fit-screen",
    scope: "teams",
    tagline: "Spot role risk before the offer.",
    title: "(HIRE · HIRING · 1:1) Hiring Fit Screen",
    duration: "30m",
    price: "$149.00",
    description:
      "Fit/concern notes, role-risk scorecard, and targeted interview prompts with a Go/Concern call.",
    deliverables: ["Risk scorecard", "Targeted prompts", "Go/Concern recommendation"],
    roi: "Fewer mis-hires; clearer stakeholder alignment.",
  },
  {
    id: "daniel-speiss/leader-coaching-training",
    scope: "teams",
    tagline: "Three-month leadership acceleration tuned to persona.",
    title: "(LEAD · PACK · 1:1) Leader Coaching & Training — 3 Months",
    duration: "45m/60m per month",
    price: "$5,991.00",
    description:
      "Tune leadership cadence, coaching, and revenue conversations monthly; persona-aligned.",
    deliverables: ["Monthly plan & reviews", "Templates & scripts", "Async support channel"],
    roi: "Compounding leadership leverage quarter-over-quarter.",
  },
  {
    id: "daniel-speiss/team-performance-sprint-4-950-mo-8-12-people-2-months",
    scope: "teams",
    tagline: "Two-month reset for pods of 8–12.",
    title:
      "(TEAM · PACK · GROUP) Team Performance Sprint — 2 Months (8–12 ppl)",
    duration: "30m/60m/90m per month",
    price: "$9,900.00",
    description:
      "Map the team, install comms rules, uplevel manager coaching, and drill objections to speed cycles.",
    deliverables: [
      "Team map & norms",
      "Manager coaching uplift",
      "Objection drill blocks",
    ],
    roi: "Cycle-time reduction and cleaner handoffs in 60 days.",
  },
  {
    id: "daniel-speiss/applied-personality-lab-onboarding-group",
    scope: "teams",
    tagline: "Fast-start for community members.",
    title: "(COMM · ONBOARD · GROUP) Applied Personality Lab — Onboarding",
    duration: "Group session",
    price: "—",
    description:
      "Install AI Coach, pick a Track, and schedule retakes with a 7-day activation checklist.",
    deliverables: ["AI Coach setup", "Track selection", "7-day activation checklist"],
    roi: "Faster habit formation; better longitudinal data.",
  },
];

