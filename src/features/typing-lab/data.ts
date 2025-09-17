import type { TypingLabEntry } from "./types";

export const typingLabEntries: TypingLabEntry[] = [
  {
    slug: "ada-lovelace-1840s-scientist",
    name: "Ada Lovelace",
    role: "Mathematician & Writer",
    domain: "Scientist",
    era: "1840s",
    nationality: "British",
    proposedType: "LIE",
    overlay: "+",
    confidenceBand: "Medium",
    top2Gap: 0.18,
    altTypes: [
      { type: "ILE", weight: 0.24, note: "Open-ended ideation when co-creating with Babbage" },
      { type: "LII", weight: 0.21, note: "Structured treatises and analytic language" },
    ],
    summary:
      "Victorian era systems thinker who translated raw mechanics into executable plans for Babbage's Analytical Engine.",
    rationale:
      "Her letters synthesize visionary trajectories (Ni) with outcome math (Te), matching the LIE seat profile.",
    differentiator:
      "Unlike ILEs she drives toward shippable roadmaps, grounding speculation in stepwise procedures and metrics.",
    functionMap: {
      Ti: {
        dim: 2,
        str: "M",
        note: "Clarifies logical scaffolds when documenting engine operations.",
      },
      Te: {
        dim: 3,
        str: "H",
        note: "Frames calculations as pragmatic outputs and performance guarantees.",
      },
      Fi: {
        dim: 1,
        str: "L",
        note: "Personal reflections reference values sparingly and often subordinate them to utility.",
      },
      Fe: {
        dim: 2,
        str: "M",
        note: "Uses affect to motivate collaborators but keeps tone restrained.",
      },
      Ni: {
        dim: 4,
        str: "H",
        note: "Charts multi-decade trajectories for computing before hardware exists.",
      },
      Ne: {
        dim: 2,
        str: "M",
        note: "Brainstorms contingencies yet quickly funnels them back into a preferred path.",
      },
      Si: {
        dim: 1,
        str: "L",
        note: "Dismisses comfort needs when projects demand extended focus.",
      },
      Se: {
        dim: 1,
        str: "L",
        note: "Delegates physical execution; prefers influencing through briefs and letters.",
      },
    },
    contexts: {
      flow: "Private correspondence and lab notes show unguarded Ni→Te synthesis.",
      performative: "Public lectures adopt more Fe warmth to persuade Victorian audiences.",
      stress: "When challenged on feasibility she doubles down on Te evidence while acknowledging health volatility.",
    },
    contextBalance: {
      flow: 0.52,
      performative: 0.3,
      stress: 0.18,
    },
    evidence: [
      {
        claim: "Translates poetic metaphors into executable operating procedures (Ni→Te).",
        source: {
          kind: "article",
          url: "https://www.computerhistory.org/babbage/adalovelace/",
          label: "Computer History Museum archive",
        },
        interpretation: "Maps long-horizon scenarios to precise tabulation steps, a 4D Ni + 3D Te pairing.",
        weight: "Strong",
      },
      {
        claim: "Prioritizes outcome guarantees over elegance when debating Charles Babbage.",
        source: {
          kind: "analysis",
          url: "https://www.fourmilab.ch/babbage/sketch.html",
          label: "Babbage Sketch of the Analytical Engine",
        },
        interpretation: "Selects verifiable outputs (Te) and pressure-tests risk scenarios (Ni).",
        weight: "Moderate",
      },
      {
        claim: "Acknowledges weak follow-through on health routines despite knowing the cost.",
        source: {
          kind: "letter",
          url: "https://www.sciencehistory.org/learn/scientific-biographies/ada-lovelace",
          label: "Science History Institute biography",
        },
        interpretation: "Self-noted Si blind spot serves as falsification check against Si-leading profiles.",
        weight: "Light",
      },
    ],
    differentials: [
      {
        type: "ILE",
        whyNot: "Less divergent riffing; commits to a single analytical trajectory once risk is modeled.",
      },
      {
        type: "LII",
        whyNot: "Writes with applied urgency and stakeholder framing rather than purely theoretical exposition.",
      },
    ],
    falsification: [
      "If future letters show sustained comfort-first routines leading projects, reconsider Si dimensionality.",
      "A durable shift toward open-ended ideation without converging plans would elevate the ILE alternative.",
    ],
    coachingSnapshot: [
      "Expect resilient Ni/Te pairing—give her hard problems with clear success criteria and she builds the roadmap.",
      "Support systems engineering sprints with Si scaffolding (rest, pacing) to avoid burnout loops.",
      "Pair with strong implementers for Se follow-through on the lab floor.",
    ],
    ethicsNote: "Educational; non-clinical.",
    versionLog: [
      { date: "2025-01-15", change: "Initial publish with archival correspondence sample." },
    ],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/95/Ada_Lovelace_portrait.jpg",
    featured: true,
    debated: false,
    lastUpdated: "2025-01-15",
    dataCoverage: 4,
  },
  {
    slug: "serena-williams-2024-athlete",
    name: "Serena Williams",
    role: "Tennis Champion & Investor",
    domain: "Athlete",
    era: "1990s–2020s",
    nationality: "American",
    proposedType: "SLE",
    overlay: "+",
    confidenceBand: "High",
    top2Gap: 0.28,
    altTypes: [
      { type: "SEE", weight: 0.19, note: "Occasional values-first messaging in Vogue essays" },
      { type: "LIE", weight: 0.16, note: "Metrics-driven business updates when discussing Serena Ventures" },
    ],
    summary:
      "Dominant competitor who marries decisive Se execution with pragmatic Te scorekeeping on and off the court.",
    rationale:
      "Pressers highlight rapid situational reads and forceful course corrections consistent with SLE command energy.",
    differentiator:
      "Compared to SEE she keeps affect tight, steering conversations back to pressure, leverage, and measurable edges.",
    functionMap: {
      Ti: {
        dim: 1,
        str: "L",
        note: "Outsources fine-grained pattern logging to coaches when prep windows compress.",
      },
      Te: {
        dim: 2,
        str: "M",
        note: "Tracks KPIs, serve speed, and return percentages to calibrate training blocks.",
      },
      Fi: {
        dim: 2,
        str: "M",
        note: "Expresses loyalty to tight circles but rarely foregrounds values in strategy discussions.",
      },
      Fe: {
        dim: 1,
        str: "L",
        note: "Keeps press emotion minimal, using emphasis primarily to set competitive tone.",
      },
      Ni: {
        dim: 2,
        str: "M",
        note: "Builds tournament arcs with coach Patrick Mouratoglou, focusing on key inflection rounds.",
      },
      Ne: {
        dim: 1,
        str: "L",
        note: "Rarely indulges speculative angles; shuts down hypotheticals quickly.",
      },
      Si: {
        dim: 2,
        str: "M",
        note: "Disciplined recovery routines post-injury reveal intentional Si scaffolding when advised.",
      },
      Se: {
        dim: 4,
        str: "H",
        note: "Uses pace shifts, angles, and baseline pressure to force errors within a few points.",
      },
    },
    contexts: {
      flow: "Practice court and mic'd training sessions show instinctive Se domination with clipped Te notes.",
      performative: "Sponsorship interviews showcase composed authority, downplaying vulnerability for brand fit.",
      stress: "In finals she verbalizes pressure as a challenge to push harder, leaning on Ni scenario prep.",
    },
    contextBalance: {
      flow: 0.45,
      performative: 0.35,
      stress: 0.2,
    },
    evidence: [
      {
        claim: "Calls plays mid-rally and redirects pace instantly during 2013 Roland-Garros final.",
        source: {
          kind: "video",
          url: "https://www.youtube.com/watch?v=KXlX1zSU9m8",
          label: "2013 Roland-Garros Final Highlights",
          timestamp: "04:12",
        },
        interpretation: "Displays 4D Se command with tactical pressure adjustments shot-to-shot.",
        weight: "Strong",
      },
      {
        claim: "Uses serve speed metrics and opponent error counts when debriefing with Patrick Mouratoglou.",
        source: {
          kind: "video",
          url: "https://www.youtube.com/watch?v=ItGw8KzRkHQ",
          label: "ESPN Training Clip",
          timestamp: "02:41",
        },
        interpretation: "Te-focused iteration keeps focus on measurable leverage points.",
        weight: "Moderate",
      },
      {
        claim: "Acknowledges over-pressing in high-pressure tie-breaks and names the counter-plan (slow down, reset feet).",
        source: {
          kind: "podcast",
          url: "https://podcasts.apple.com/us/podcast/serena-williams-on-masterclass/id1524854621?i=1000542693871",
          label: "MasterClass podcast",
        },
        interpretation: "Self-aware stress note indicates Ni-informed correction loop; also surfaces falsification if long-term drift to Fe occurs.",
        weight: "Light",
      },
    ],
    differentials: [
      {
        type: "SEE",
        whyNot: "Less emotive rallying and more tactical talk; she rarely leads with relationship-first language.",
      },
      {
        type: "LIE",
        whyNot: "Prefers kinetic leverage over extended strategic monologues; post-match focus is on action not frameworks.",
      },
    ],
    falsification: [
      "If post-retirement media shifts toward values-first narratives with low emphasis on physical leverage, revisit SEE.",
      "Sustained move into systems-building roles with deep Ni roadmapping could strengthen the LIE hypothesis.",
    ],
    coachingSnapshot: [
      "Double down on decisive roles—she thrives when trusted to call plays in real time.",
      "Embed clear Te dashboards so she can see progress without micromanaging staff.",
      "Design recovery pods that respect her Si discipline while accommodating competitive restlessness.",
    ],
    ethicsNote: "Educational; non-clinical.",
    versionLog: [
      { date: "2025-02-02", change: "Added business interview clips to evidence stack." },
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Serena_Williams_2013_US_Open_%281%29.jpg",
    featured: true,
    debated: false,
    lastUpdated: "2025-02-02",
    dataCoverage: 5,
  },
  {
    slug: "greta-gerwig-2024-director",
    name: "Greta Gerwig",
    role: "Director & Screenwriter",
    domain: "Artist",
    era: "2010s–present",
    nationality: "American",
    proposedType: "IEE",
    overlay: "-",
    confidenceBand: "Medium",
    top2Gap: 0.11,
    altTypes: [
      { type: "EIE", weight: 0.27, note: "Expressive ensemble leadership during press tours" },
      { type: "SEI", weight: 0.22, note: "Warm, sensory storytelling focus when discussing set design" },
    ],
    summary:
      "Playful storyteller who curates ensemble chemistry and explores multiple futures before collapsing on a theme.",
    rationale:
      "Her direction style surfaces Ne possibilities with clear Fi through-lines, matching IEE's adaptive seat.",
    differentiator:
      "Compared to EIE she modulates affect softly and prioritizes personal meaning over orchestrated spectacle.",
    functionMap: {
      Ti: {
        dim: 1,
        str: "L",
        note: "Delegates strict continuity logic to editors and script supervisors.",
      },
      Te: {
        dim: 1,
        str: "L",
        note: "Defers budgeting spreadsheets to producing partners, keeping focus on tone and meaning.",
      },
      Fi: {
        dim: 4,
        str: "H",
        note: "Anchors narratives in intimate value checks, repeatedly referencing 'emotional truth'.",
      },
      Fe: {
        dim: 2,
        str: "M",
        note: "Broadcasts warmth to cast but stays away from theatrical affect.",
      },
      Ni: {
        dim: 2,
        str: "M",
        note: "Locks in final thematic arc late in process after exploring options.",
      },
      Ne: {
        dim: 4,
        str: "H",
        note: "Generates alternative endings and encourages improvisation to find resonance.",
      },
      Si: {
        dim: 2,
        str: "M",
        note: "Obsesses over textures and comfort on set to support cast flow.",
      },
      Se: {
        dim: 1,
        str: "L",
        note: "Relies on DP for assertive blocking; prefers collaborative nudges to hard directives.",
      },
    },
    contexts: {
      flow: "Writers' room sessions show rapid Ne branching anchored by Fi stories from her upbringing.",
      performative: "Late-night interviews dial up Fe charm but default back to reflective anecdotes.",
      stress: "During crunch she references loss of spaciousness and requests Si buffers (rest, playlists).",
    },
    contextBalance: {
      flow: 0.48,
      performative: 0.34,
      stress: 0.18,
    },
    evidence: [
      {
        claim: "Encourages cast to improvise multiple emotional beats before deciding what lands.",
        source: {
          kind: "video",
          url: "https://www.youtube.com/watch?v=Q6sV5un9eds",
          label: "Directors Guild interview",
          timestamp: "06:58",
        },
        interpretation: "Classic Ne exploration paired with Fi resonance testing.",
        weight: "Strong",
      },
      {
        claim: "Frames directing as 'holding space for different possible movies' before choosing one.",
        source: {
          kind: "podcast",
          url: "https://a24films.com/podcasts/greta-gerwig/",
          label: "A24 podcast",
        },
        interpretation: "Highlights Ne-led ideation; also hints at lower Te appetite for rigid structure.",
        weight: "Moderate",
      },
      {
        claim: "Admits to analysis paralysis when faced with aggressive production deadlines.",
        source: {
          kind: "article",
          url: "https://www.vulture.com/2023/07/greta-gerwig-barbie-interview.html",
          label: "Vulture profile",
        },
        interpretation: "Points to Se low dimensionality; serves as falsification if future work shows decisive command by default.",
        weight: "Light",
      },
    ],
    differentials: [
      {
        type: "EIE",
        whyNot: "Less dramaturgical projection; she keeps things cozy and exploratory, not theatrical.",
      },
      {
        type: "SEI",
        whyNot: "Higher appetite for novelty and risk than typical SEI steady-state preference.",
      },
    ],
    falsification: [
      "If upcoming projects show default toward hardline directing with little ideation, revisit EIE hypothesis.",
      "Consistent preference for spreadsheets and budget-first decisions would elevate Te dimensionality arguments.",
    ],
    coachingSnapshot: [
      "Give her ideation sprints early—she refines meaning after seeing multiple futures.",
      "Pair with a trusted Te partner to lock scope when deadlines loom.",
      "Protect Si rituals (music, set ambiance) to keep creativity open under pressure.",
    ],
    ethicsNote: "Educational; non-clinical.",
    versionLog: [
      { date: "2025-01-22", change: "Added Barbie press tour clips to context sample." },
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Greta_Gerwig_Berlinale_2023.jpg",
    featured: true,
    debated: true,
    lastUpdated: "2025-01-22",
    dataCoverage: 4,
  },
];
