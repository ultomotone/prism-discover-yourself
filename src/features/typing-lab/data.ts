import type { TypingLabEntry } from "./types";

// The Typing Lab currently publishes a single live dossier. New entries can be added
// as research completes, but we keep this list light so filters and featured sections
// only surface active hypotheses.
export const typingLabEntries: TypingLabEntry[] = [
  {
    slug: "charlie-kirk-2010s-activist",
    name: "Charlie Kirk",
    role: "Founder & Activist",
    domain: "Founder / Activist",
    era: "2010s–2025",
    nationality: "American",
    proposedType: "SLE",
    overlay: "+",
    confidenceBand: "Medium",
    top2Gap: 0.22,
    altTypes: [
      { type: "LIE", weight: 0.24 },
      { type: "EIE", weight: 0.18 },
    ],
    summary:
      "Contact-dominant operator who sets terms in live rooms (Se) and prosecutes via definitions (Ti), rallies as needed (Fe), and sustains a field machine (Te). Not LIE because on-mic cadence leads with contact over systems; not EIE because Fe reads mobilizing, not leading.",
    rationale:
      "Campus debates, long-form podcasts, and tour stops consistently open with definition control before moving into pressure moves, matching an SLE lead with creative Ti and demonstrative Te.",
    differentiator:
      "Compared to Te-first operators he foregrounds room leverage and live prosecution; compared to EIE presenters he keeps affect tight, using Fe as a momentum dial rather than broad-band steering.",
    confidenceExplanation:
      "Confidence is Medium because Se-contact and Ti-prosecution are consistent across settings, with clear Te operations. Alternates LIE/EIE explain slices. Confidence would rise with more Te-first on-mic systems talk ruled out and more broad-band Fe modulation ruled out. Confidence would fall if repeated Te-first cadence appears under pressure or if Fe shows wide-band mixing across registers.",
    overlayExplanation:
      "+ indicates a tendency toward higher arousal/intensity in adversarial or stage conditions, which amplifies Se and Fe expression and compresses time horizons. Overlay is not a type change.",
    functionMap: {
      Ti: {
        dim: 3,
        str: "H",
        note: "Definition-first frames, burden-of-proof moves before pressure.",
      },
      Te: {
        dim: 4,
        str: "H",
        note: "Org-building, pipelines, throughput; facts used tactically for outcomes.",
      },
      Fi: {
        dim: 1,
        str: "L",
        note: "Public principle over one-to-one tact in hot rooms.",
      },
      Fe: {
        dim: 2,
        str: "M",
        note: "Applause-line pacing; momentum dial rather than nuanced mixer.",
      },
      Ni: {
        dim: 1,
        str: "M",
        note: "One narrative spine (youth/campus arc) more than deep forecasting on-mic.",
      },
      Ne: {
        dim: 2,
        str: "L",
        note: "Probes options to trap; little open-ended ideation in public.",
      },
      Si: {
        dim: 3,
        str: "M",
        note: "Routines sustain touring/production; comfort is secondary to momentum.",
      },
      Se: {
        dim: 4,
        str: "H",
        note: "Room control, fast redirects, decisive pressure in live exchanges.",
      },
    },
    contexts: {
      flow: "Long-form, friendly settings. Ti/Te cadence, narrative steady; Se cooler; fewer binary pushes.",
      performative: "Rallies and tours. Se pressure with Fe spikes; Ni frame repeated for cohesion and motivation.",
      stress: "Hostile Q&A. Se overdrive; binary demands; Fe louder; time horizon compresses; higher interruption rate.",
    },
    contextBalance: {
      flow: 0.41,
      performative: 0.34,
      stress: 0.25,
    },
    states: [
      {
        name: "Prosecutor State",
        triggers: "Adversarial Q&A, debate, hostile questioners.",
        behaviors:
          "Define terms, move burden of proof, force binaries, interrupt to hold terrain; use a punchline to release pressure.",
        strengths: "Frame control, velocity, decisive outcomes.",
        risks: "Steamroll optics, brittle definitions, scorched-earth perception.",
        reset: "Pre-decided off-ramps and time-boxes; one pivot then drop.",
      },
      {
        name: "Operator-Rally State",
        triggers: "Rallies, field operations, campaign alignment.",
        behaviors:
          "Boots-on-the-ground language, chapters/scale, applause-line pacing, calls to action.",
        strengths: "Mobilization, throughput, converting attention to action.",
        risks: "Fe without Fi can alienate neutrals; Se heat compresses time; success theater if Te loops are not closed.",
        reset: "Te partner closes loops (cadence, booking, conversion dashboards).",
      },
      {
        name: "Mission-Metaphysics State",
        triggers: "Faith and values venues, long-form meaning interviews (e.g., JP conversation).",
        behaviors:
          "Purpose and providence language, individual responsibility themes; parks tactics for meaning-first framing.",
        strengths: "Legitimacy with values audiences; cohesion; reduces perceived cynicism.",
        risks: "If Ni is thin, arc repeats without depth; opponents call it slogans.",
        reset: "Pair with a strategist to turn arc into waypoints and stop-conditions.",
      },
    ],
    readingGuide: {
      dimensionality:
        "Dimensionality (1D-4D) is the breadth of capability across Experience, Norms, Situation, and Time. 1D is narrow and situational. 2D is role-capable. 3D is adaptive across contexts. 4D is expert, time-aware, and norm-savvy.",
      strength:
        "Strength (Low/Medium/High) is frequency and force in observed behavior. A function can be strong in expression but low in dimensionality, and vice versa.",
      overlay:
        "Overlay is an emotional arousal band (+, neutral, -) that modulates expression but does not change type.",
    },
    assessmentMap: {
      strengthItems:
        "Se items show high endorsement (take control, press advantages). Ti items show strong endorsement (define terms). Fe items moderate endorsement (energize group). Te items strong endorsement in ops contexts.",
      dimensionalItems:
        "Se_SIT and Se_EXP high; Ti_NORM and Ti_SIT solid; Te_TIME present; Fe_SIT usable; Fi low bandwidth.",
      ipsatives: "Se > Ne; Ti >= Te on-mic (Te >= Ti backstage); Ni > Si; Fe > Fi.",
    },
    evidence: [
      {
        claim:
          "Invites disagreement and live challenge in campus tour formats, asking opponents to take the mic.",
        source: {
          kind: "video",
          url: "#",
          label: "Campus tour appearances",
        },
        interpretation:
          "Demonstrates Se lead with high contact tolerance and in-room term setting.",
        weight: "Strong",
      },
      {
        claim:
          "Opens debates by defining terms and assigning burden of proof before pressing the opponent.",
        source: {
          kind: "video",
          url: "#",
          label: "Policy debate appearances",
        },
        interpretation:
          "Signals Ti creative paired with Se prosecution and Te deployment.",
        weight: "Strong",
      },
      {
        claim:
          "Emphasizes boots-on-the-ground chapters, campaign alignment, and moving metrics when discussing execution.",
        source: {
          kind: "podcast",
          url: "#",
          label: "Operations discussions",
        },
        interpretation:
          "Shows Te demonstrative focus on systems, pipelines, and throughput.",
        weight: "Moderate",
      },
      {
        claim:
          "Uses faith, mission language, and personal 'why' moments to unify audiences during value discussions.",
        source: {
          kind: "interview",
          url: "#",
          label: "Values-focused appearances",
        },
        interpretation:
          "Highlights Fe + Ni valued for rally cohesion and meaning framing.",
        weight: "Moderate",
      },
      {
        claim:
          "Trades comfort for relentless touring and production cadence, spotlighting stamina over ease.",
        source: {
          kind: "article",
          url: "#",
          label: "Tour schedule patterns",
        },
        interpretation:
          "Reinforces Si routines as supporting structure rather than priority.",
        weight: "Light",
      },
    ],
    differentials: [
      {
        type: "LIE",
        whyNot:
          "A Te-lead would prioritize systems framing before entering contact; here Se prosecution opens most exchanges.",
      },
      {
        type: "EIE",
        whyNot:
          "EIE profiles show broad-band affect steering, whereas he uses Fe as a narrow momentum dial.",
      },
    ],
    falsification: [
      "Repeated Te-first cadence under pressure would elevate the LIE alternative.",
      "Consistent wide-band Fe modulation across registers would strengthen the EIE hypothesis.",
      "Documented enjoyment of open-ended Ne exploration (beyond tactical traps) would challenge the SLE lead call.",
    ],
    coachingSnapshot: [
      "Pre-decide off-ramps to prevent Se over-press and keep wins clean (one pivot, then drop).",
      "One-page definition trees per recurring issue to stabilize Ti under novelty and avoid brittle frames.",
      "Te partner closes loops (cadence, booking, conversion dashboards) so live momentum becomes durable outcomes; add weekly Ni waypoints per initiative.",
    ],
    futureResearch: [
      "Collect timestamped clips of definition-first openings across issues to firm Ti 3D call.",
      "Log Te cadence backstage (cadence docs, postmortems) to confirm Te 4D.",
      "Track instances of wide-band affect steering; if frequent and nuanced, raise EIE alt.",
      "Catalog cases where divergent what-ifs are embraced for exploration; if frequent, raise Ne weighting.",
    ],
    counterevidenceLog: [
      "Pending: examples where he sustains soft, individualized boundary work under pressure (would raise Fi).",
      "Pending: hostile-room appearances with Te-first systems lecture before contact (would raise LIE).",
    ],
    faq: [
      {
        question: "Is this diagnostic?",
        answer:
          "No. Educational, non-clinical. It summarizes public persona patterns with sources and uncertainty.",
      },
      {
        question: "What is Top-2 gap?",
        answer:
          "A 0.00 to 1.00 score showing how decisively the lead type outperforms the runner-up on the evidence.",
      },
      {
        question: "Can types change?",
        answer:
          "Expression shifts by context and state. The lab tracks drift and updates calls as new evidence arrives.",
      },
    ],
    ethicsNote: "Educational; non-clinical; public-persona hypotheses only.",
    versionLog: [
      { date: "2025-09-16", change: "Initial publish." },
      {
        date: "2025-09-16",
        change: "Expanded dossier with states, reading guide, assessment map, and future research.",
      },
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/5/57/Charlie_Kirk_by_Gage_Skidmore.jpg",
    featured: false,
    debated: true,
    lastUpdated: "2025-09-16",
    dataCoverage: 3,
  },
];
