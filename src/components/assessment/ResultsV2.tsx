import React from "react";

// thresholds for labels (tune later)
const LABEL_THRESH = {
  dimHighlight: 3,          // ≥3D dims gets highlighted
  suppressedStrength: 2.4,  // ≤2.4 strength shows "suppressed"
};

function InfoTip({ title, children }:{
  title: string; children: React.ReactNode;
}) {
  return (
    <span className="relative group inline-flex items-center">
      <span className="ml-1 w-4 h-4 rounded-full border border-gray-400 text-[10px] flex items-center justify-center text-gray-600 cursor-default">?</span>
      <div className="hidden group-hover:block absolute z-20 top-full mt-2 w-72 p-3 rounded-xl border bg-white shadow text-xs leading-5">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-gray-700">{children}</div>
      </div>
    </span>
  );
}

const FUNCS = ["Ti","Te","Fi","Fe","Ni","Ne","Si","Se"] as const;

type Func = typeof FUNCS[number];

type Profile = {
  type_code: string; base_func: Func; creative_func: Func; overlay: "+"|"–";
  strengths: Record<Func, number>;
  dimensions: Record<Func, number>; // 1..4
  blocks: { Core:number; Critic:number; Hidden:number; Instinct:number };
  blocks_norm: { Core:number; Critic:number; Hidden:number; Instinct:number };
  neuroticism: { raw_mean:number; z:number };
  validity: { inconsistency:number; sd_index:number };
  confidence: "High"|"Moderate"|"Low";
  type_scores: Record<string, { fit_abs:number; share_pct:number }>;
  top_types: string[]; // e.g., ["LIE","ILE","LSE"]
  dims_highlights: { coherent: Func[]; unique: Func[] };
};

// ---------- Glossary (inline; can be moved to DB later) --------------------
const GLOSSARY = {
  strength: {
    label: "Functional Strength",
    text: "How frequently/intensely you use a function day‑to‑day (1–5). High = go‑to tool; Low = background."
  },
  dimensionality: {
    label: "Dimensionality (1–4)",
    text: "Depth and flexibility of a function. 1D personal only → 4D broad, adaptable, and time‑aware mastery."
  },
  blocks: {
    label: "Blocks",
    items: [
      {k:"Core", v:"Primary engines (Base + Creative): what you do best and value most."},
      {k:"Critic", v:"Pain points (Role + Vulnerable): sensitive/effortful areas; be kind here."},
      {k:"Hidden", v:"Growth edges (Suggestive + Mobilizing): yearned‑for abilities; blossom with support."},
      {k:"Instinct", v:"Background talents (Ignoring + Demonstrative): strong but undervalued or on autopilot."}
    ]
  },
  overlay: {
    label: "Neuro Overlay",
    text: "'+' = more reactive (higher neuroticism), '–' = steadier (lower). Tints how your type expresses under pressure."
  },
  states: {
    label: "States",
    text: "Context like stress, sleep, mood influences expression. We factor it for confidence and guidance; your core type remains."
  }
};

// ---------- Type KB (2+ paragraphs each) -----------------------------------
const TYPE_KB: Record<string, { title:string; p:string[]; flow:string[]; stress:string[] } > = {
  LIE: {
    title: "Entrepreneur‑Strategist (Te–Ni)",
    p: [
      "You prefer motion with measurement. When a goal appears, you translate it into metrics, milestones, and a workable path. Your mind trims noise; you don't need perfect information to commit. Patterns and timing matter – you read where things are heading and prune dead ends early.",
      "People experience you as decisive and candid. You're at your best when the scoreboard is visible and ownership is clear. Sometimes pace outruns buy‑in or tone; watch the drift between 'what works' and 'why it matters to people'. When you slow down to narrate purpose, teams align behind you."
    ],
    flow: ["48–72h probes with clear success criteria","Weekly forecast tied to leading indicators"],
    stress:["Do‑more‑faster loop; ignores tone","Over‑optimize near KPIs; misses weak signals"]
  },
  ILI: {
    title: "Forecaster (Ni–Te)",
    p: [
      "You think in trajectories. From sparse signals you form a coherent line and test it against reality. You'd rather cut three bad options than pursue one lukewarm idea. When you speak, it's to steer timing, scope, and risk.",
      "Others rely on your calm read of what matters next. But analysis can outrun action if you lack an operator partner. Share the model visually and set decision windows – your foresight lands when the path to execution is explicit."
    ],
    flow:["Quiet modeling time before decisions","Scenario maps with branch kill‑criteria"],
    stress:["Over‑analysis; late operational handoff","Narrowing to edge‑cases; avoids commitment"]
  },
  ESE: {
    title: "Catalyst (Fe–Si)",
    p: [
      "You tune a room instantly. Energy, morale, and care are your raw materials. You build rhythms people can sustain and enjoy. When teams wobble, you reset tone and make progress feel human again.",
      "Your optimism is a force, but hard trade‑offs can feel harsh. Anchor the story to two or three concrete outcomes so momentum compounds, not just mood. With regular recovery, your stamina lifts the whole system."
    ],
    flow:["Feedback‑rich standups; celebrating small wins","Consistent routines that keep energy steady"],
    stress:["Tone over metrics; avoids conflict","Energy drain in low‑feedback or cold rooms"]
  },
  SEI: {
    title: "Stabilizer (Si–Fe)",
    p: [
      "You create calm, livable environments. You notice small sensory shifts and adjust pace to keep quality high. People trust your steady presence and the way you remember what makes things feel right.",
      "You're most effective when standards are clear and time horizons are reasonable. Escalation or conflict can feel jarring; pair with a driver for pushes. Your consistency is a quiet superpower – protect it."
    ],
    flow:["Clear routines; craft attention to detail","Patient, humane schedules"],
    stress:["Avoids confrontation; under‑pushes change","Retreats when rushed or tone turns sharp"]
  },
  LII: {
    title: "Architect (Ti–Ne)",
    p: [
      "You refine concepts until they cohere. Clean definitions, mechanisms, and edge‑cases are your canvas. You prefer 'why it works' before 'how to do it'. Novel inputs spark elegant re‑frames rather than chaos.",
      "The trap is perfection – models can stall delivery. Timebox drafts and show the minimal working mechanism early. Pairing with a communicator amplifies your clarity into shared momentum."
    ],
    flow:["Writing crisp specs; taxonomy design","Explaining mechanisms with simple examples"],
    stress:["Endless refinement; avoids shipping","Detaches from tone; hard edges in debate"]
  },
  ILE: {
    title: "Explorer (Ne–Ti)",
    p: [
      "You connect dots others don't see. Options emerge quickly and you enjoy testing unconventional angles. You thrive in zero‑to‑one ambiguity, especially with a few constraints to bounce against.",
      "Energy scatters if everything stays open. Limit WIP and appoint a finisher per idea. Your curiosity is catalytic when channeled into tight learning loops that retire weak options quickly."
    ],
    flow:["Rapid A/Bs with clear learning goals","Idea pipeline with WIP limits"],
    stress:["Pivoting before signal; fragmentation","Neglects cadence/maintenance"]
  },
  ESI: {
    title: "Guardian (Fi–Se)",
    p: [
      "You stand for people and principles. Boundaries are clear, and your loyalty is the bedrock others feel. When action is needed, you move decisively to protect what matters.",
      "Polarity can rise under pressure – right vs wrong eclipses nuance. Invite possibility (Ne) early to widen options, then commit. Your steadiness becomes leadership when paired with measured boldness."
    ],
    flow:["One‑to‑one trust building","Clear commitments; fair consequences"],
    stress:["All‑or‑nothing judgments; hard lines","Over‑forceful pushes when ignored"]
  },
  SEE: {
    title: "Driver (Se–Fi)",
    p: [
      "You move reality. Constraints, timing, presence – these are levers you pull instinctively. People feel progress around you because you remove obstacles and set a direction others can follow.",
      "Impatience can cut corners or relationships. Bring a strategist to stress‑test arcs (Ni) so your decisive action composes into bigger wins."
    ],
    flow:["Live demos; quick closes","Short, intense sprints with clear finish"],
    stress:["Pushy cuts; short‑termism","Relational blowback after hard pushes"]
  },
  LSE: {
    title: "Operator (Te–Si)",
    p: [
      "You build reliable systems. Metrics, SOPs, and quality control are your language. Scaling what works is satisfying – small improvements compound in your hands.",
      "Rigidity is the risk. Keep a small exploration lane open to catch weak signals early. Your credibility soars when you mix process with a dash of narrative and foresight."
    ],
    flow:["Weekly scorecards; pipeline hygiene","Controlled A/Bs before SOP updates"],
    stress:["Over‑process; slow on novelty","Tone drift during change periods"]
  },
  SLI: {
    title: "Craftsman (Si–Te)",
    p: [
      "You perfect the tangible. Practical details and comfort matter; you sense constraints early and design around them. People trust the polish and smoothness you deliver.",
      "You may under‑sell the vision. Partner with a storyteller for lift‑off moments. Keep one improvement focus per week to avoid local maxima."
    ],
    flow:["Hands‑on refinement; prototypes","Steady, humane pacing"],
    stress:["Withdraws from conflict; avoids spotlight","Resists change that risks quality"]
  },
  EIE: {
    title: "Orchestrator (Fe–Ni)",
    p: [
      "You move hearts with meaning. Narrative, timing, and pattern give you a conductor's wand. You rally groups by naming what matters and where we're going.",
      "Story can outrun scaffolding. Pair with an operator (Te/Si) to peg the vision to milestones. Your impact multiplies when emotion and mechanism arrive together."
    ],
    flow:["Vision narrative with crisp next steps","Rehearsed tone shifts for high‑stakes"],
    stress:["Emotional overdrive; burnout risk","Detail drop; promises outrun ops"]
  },
  IEI: {
    title: "Visioneer (Ni–Fe)",
    p: [
      "You find the through‑line beneath chaos. With quiet timing sense, you help groups choose which future to feed. You value depth, symbolism, and the right moment more than speed.",
      "Action can lag unless anchored. Share the line as a simple visual and assign the first two moves; your calm guidance becomes momentum when the path is visible."
    ],
    flow:["Uninterrupted thinking then crisp framing","Two‑step commitments with review"],
    stress:["Delay cycles; self‑doubt","Over‑focusing on meaning, skipping ops"]
  },
  LSI: {
    title: "Marshal (Ti–Se)",
    p: [
      "You set clean rules and get them done. Precision plus presence makes you formidable in execution. People feel safe when standards are clear and consistently enforced.",
      "Rigidity and harsh tone are risks. Schedule exploration windows (Ne) to loosen early; clarity turns collaborative when curiosity is visible."
    ],
    flow:["Crisp SOPs; fair enforcement","Direct resolution of blockers"],
    stress:["Over‑control; low flexibility","Dismisses new options too fast"]
  },
  SLE: {
    title: "Commander (Se–Ti)",
    p: [
      "You thrive on decisive progress. You test reality in motion and make calls that others avoid. Constraints energize you; momentum is the game.",
      "Impulses can skip nuance. Borrow foresight (Ni) weekly to align force with arc. When you pace aggression, your teams win big and stay with you."
    ],
    flow:["Live objections handled; fast closes","Short attacks with cool‑downs"],
    stress:["Premature cuts; collateral tone damage","Short‑term wins that cost strategy"]
  },
  EII: {
    title: "Advisor (Fi–Ne)",
    p: [
      "You read people's inner threads and possibilities. Integrity and growth matter; you prefer good fits to quick wins. You are trusted for judgment and care.",
      "Conflict and deadlines can pinch. Light structure (Te) and timeboxed decisions keep your empathy moving outcomes."
    ],
    flow:["Values‑aligned projects; mentoring","Option space pruned to two"],
    stress:["Decision drift; over‑empathizing","Avoids conflict; loses momentum"]
  },
  IEE: {
    title: "Connector (Ne–Fi)",
    p: [
      "You sense opportunities in people and ideas. Networks, reframes, and openings appear to you before others notice them. You love to spark and link.",
      "Boundaries and follow‑through are the work. Pair curiosity with clear commitments and an operator partner; your serendipity becomes compound progress."
    ],
    flow:["Warm intros; multi‑option proposals","Two‑week learn‑and‑ship loops"],
    stress:["Too many plates; scattered energy","Says yes too much; burnout risk"]
  }
};

// ---------- UI helpers ------------------------------------------------------
function Chip({ n=0 }:{ n:number }){
  const total=4, filled=Math.max(0,Math.min(total,n));
  return (<div className="flex gap-1">{Array.from({length:total}).map((_,i)=>(<span key={i} className={`w-2 h-2 rounded-full ${i<filled? 'bg-foreground':'bg-muted'}`}/>))}</div>);
}

function Bar({ label, value, max=5 }:{ label:string; value:number; max?:number }){
  const w = Math.max(0, Math.min(100, Math.round((value/max)*100)));
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span>{value?.toFixed ? value.toFixed(2) : value}</span></div>
      <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-2 bg-foreground" style={{width:`${w}%`}}/></div>
    </div>
  );
}

function Top3({ p }:{ p:Profile }){
  const primary = p.top_types?.[0];
  return (
    <section className="p-5 border rounded-2xl bg-card">
      <div className="flex items-end gap-3 mb-3">
        <h3 className="font-semibold">Top matches</h3>
        <span className="text-xs text-muted-foreground">Absolute fit = invariant (0–100). Share = relative among all types.</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {p.top_types.map(code=>{
          const t = p.type_scores[code];
          const title = TYPE_KB[code]?.title || code;
          const isMain = code===primary;
          return (
            <div key={code} className={`p-4 border rounded-xl ${isMain?'bg-muted/50':''}`}>
              <div className="flex justify-between items-baseline">
                <div className="font-semibold">{code}{isMain ? p.overlay : ''}</div>
                <div className="text-xs text-muted-foreground">Share {t.share_pct}%</div>
              </div>
              <div className="text-sm text-muted-foreground">{title}</div>
              <div className="mt-2 text-sm"><b>Fit</b> {t.fit_abs}</div>
              {isMain && (
                <div className="mt-2 text-xs">
                  <div className="mb-1"><b>Coherent dims</b>: {p.dims_highlights.coherent.join(', ')||'—'}</div>
                  <div><b>Unique dims</b>: <span className="text-primary">{p.dims_highlights.unique.join(', ')||'—'}</span></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Glossary(){
  return (
    <section className="p-5 border rounded-2xl bg-card">
      <h3 className="font-semibold mb-3">What your scores mean</h3>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div><b>{GLOSSARY.strength.label}</b><div className="text-muted-foreground">{GLOSSARY.strength.text}</div></div>
        <div><b>{GLOSSARY.dimensionality.label}</b><div className="text-muted-foreground">{GLOSSARY.dimensionality.text}</div></div>
        <div>
          <b>{GLOSSARY.blocks.label}</b>
          <ul className="list-disc ml-5 text-muted-foreground">{GLOSSARY.blocks.items.map(x=> <li key={x.k}><b>{x.k}:</b> {x.v}</li>)}</ul>
        </div>
        <div><b>{GLOSSARY.overlay.label}</b><div className="text-muted-foreground">{GLOSSARY.overlay.text}</div></div>
        <div><b>Suppressed</b><div className="text-muted-foreground">Low usage (≤2.4/5) regardless of dimensionality; may indicate avoidance or being crowded out by stronger tools.</div></div>
        <div className="md:col-span-2"><b>{GLOSSARY.states.label}</b><div className="text-muted-foreground">{GLOSSARY.states.text}</div></div>
      </div>
    </section>
  );
}

function Narrative({ p }:{ p:Profile }){
  const main = p.top_types?.[0] || p.type_code.slice(0,3);
  const kb = TYPE_KB[main] || { title: main, p:["",""], flow:[], stress:[] };
  const dims = p.dimensions;
  const fTop = [...FUNCS].sort((a,b)=> (p.strengths[b]||0) - (p.strengths[a]||0)).slice(0,2);
  const weak = [...FUNCS].sort((a,b)=> (p.strengths[a]||0) - (p.strengths[b]||0))[0];
  return (
    <section className="p-5 border rounded-2xl bg-card">
      <div className="flex items-baseline gap-3 mb-3">
        <h3 className="font-semibold">{kb.title} — {main}{p.overlay}</h3>
        <span className="text-xs text-muted-foreground">
          ({p.base_func}-{p.creative_func}) • Confidence: <span className={`font-semibold ${p.confidence === "Low" ? "text-red-600" : p.confidence === "Moderate" ? "text-amber-600" : "text-emerald-700"}`}>{p.confidence}</span>
          {p.validity && (
            <> · Inconsistency: {p.validity.inconsistency?.toFixed?.(2)} · SD: {p.validity.sd_index?.toFixed?.(2)}</>
          )}
        </span>
      </div>
      {kb.p.map((para, i)=> <p key={i} className="mb-3 text-sm leading-6">{para}</p>)}
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold mb-1">In flow</h4>
          <ul className="list-disc ml-5 text-muted-foreground">{kb.flow.map((x,i)=><li key={i}>{x}</li>)}</ul>
        </div>
        <div>
          <h4 className="font-semibold mb-1">Under stress</h4>
          <ul className="list-disc ml-5 text-muted-foreground">{kb.stress.map((x,i)=><li key={i}>{x}</li>)}</ul>
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">Top functions: <b>{fTop.join(" + ")}</b> • Stretch: <b>{weak}</b></div>
    </section>
  );
}

function FunctionsAndDims({ p }:{
  p: {
    strengths: Record<string, number>;
    dimensions: Record<string, number>; // 1..4
    base_func: string; creative_func: string;
    dims_highlights: { coherent: string[]; unique: string[] };
  }
}) {
  const labelFor = (f:string)=>{
    const str = p.strengths[f] ?? 0;
    const dim = p.dimensions[f] ?? 0;
    const isB = f === p.base_func;
    const isC = f === p.creative_func;

    if (dim >= LABEL_THRESH.dimHighlight && (isB || isC)) return { t:"type-coherent", cls:"bg-green-50", hint:
      <>This function shows **high dimensionality (≥3D)** in your **core pair (Base/Creative)**. It's part of your native engine and flexes well across contexts.</> };

    if (dim >= LABEL_THRESH.dimHighlight && !(isB || isC)) return { t:"unique", cls:"bg-blue-50", hint:
      <>You've developed **high dimensionality (≥3D)** outside the core pair → **breadth** beyond typical for your type.</> };

    if (str <= LABEL_THRESH.suppressedStrength) return { t:"suppressed", cls:"bg-gray-50", hint:
      <>Low day-to-day **use** (≤{LABEL_THRESH.suppressedStrength.toFixed(1)} on 1–5). May be avoided or crowded out by stronger tools.</> };

    return { t:"—", cls:"", hint: <>Neutral range. Neither highlighted nor suppressed.</> };
  };

  const Bar = ({ label, value, max=5 }:{ label:string; value:number; max?:number })=>{
    const w = Math.max(0, Math.min(100, Math.round((value/max)*100)));
    return (
      <div className="mb-2">
        <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span>{value?.toFixed ? value.toFixed(2) : value}</span></div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-2 bg-black" style={{width:`${w}%`}}/></div>
      </div>
    );
  };

  const Chip = ({ n=0 }:{ n:number })=>{
    const total=4, filled=Math.max(0,Math.min(total,n));
    return (<div className="flex gap-1">{Array.from({length:total}).map((_,i)=>(<span key={i} className={`w-2 h-2 rounded-full ${i<filled? 'bg-black':'bg-gray-300'}`}/>))}</div>);
  };

  return (
    <section className="p-5 border rounded-2xl bg-white">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">Functions</h3>
        <InfoTip title="How to read this">
          <p className="mb-2"><b>Strength</b> = usage (1–5). <b>Dimensionality</b> = depth/flexibility (1–4).</p>
          <ul className="list-disc ml-5">
            <li><b>type-coherent</b>: ≥3D on Base/Creative → native engine</li>
            <li><b>unique</b>: ≥3D outside Base/Creative → developed breadth</li>
            <li><b>suppressed</b>: strength ≤{LABEL_THRESH.suppressedStrength.toFixed(1)} → under-used</li>
          </ul>
        </InfoTip>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {FUNCS.map(f=> <Bar key={f} label={f} value={p.strengths[f]||0}/>) }
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FUNCS.map(f=>{
            const L = labelFor(f);
            return (
              <div key={f} className={`p-3 border rounded-xl ${L.cls}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{f}</span>
                  <Chip n={p.dimensions[f]||0}/>
                </div>
                <div className="text-[10px] mt-1 text-gray-600 flex items-center">
                  {L.t}
                  <InfoTip title={f}>{L.hint}</InfoTip>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <b>Legend:</b> green = type-coherent, blue = unique, gray = suppressed.  
        Thresholds live in <code>LABEL_THRESH</code>.
      </div>
    </section>
  );
}

function BlocksAndNeuro({ p }:{
  p: {
    blocks: { Core:number; Critic:number; Hidden:number; Instinct:number };
    blocks_norm?: { Core:number; Critic:number; Hidden:number; Instinct:number };
    neuroticism: { raw_mean:number; z:number };
    overlay: "+"|"–";
  }
}) {
  const Bar = ({ label, value, max=100 }:{ label:string; value:number; max?:number })=>{
    const w = Math.max(0, Math.min(100, Math.round((value/max)*100)));
    return (
      <div className="mb-2">
        <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span>{value.toFixed(2)}</span></div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-2 bg-black" style={{width:`${w}%`}}/></div>
      </div>
    );
  };

  const percentile = (z:number)=>{ const t=1/(1+0.2316419*Math.abs(z)); const d=0.3989423*Math.exp(-z*z/2); let s=1 - d*(1.330274*t - 1.821256*t**2 + 1.781478*t**3 - 0.356564*t**4 + 0.3193815*t**5); if(z<0) s=1-s; return Math.round(s*100); };

  const bn = p.blocks_norm ?? (() => {
    const s = p.blocks.Core + p.blocks.Critic + p.blocks.Hidden + p.blocks.Instinct || 1;
    return {
      Core: Math.round((p.blocks.Core/s)*1000)/10,
      Critic: Math.round((p.blocks.Critic/s)*1000)/10,
      Hidden: Math.round((p.blocks.Hidden/s)*1000)/10,
      Instinct: Math.round((p.blocks.Instinct/s)*1000)/10
    };
  })();

  const overlayText = p.overlay === "+"
    ? "More reactive baseline (higher neuroticism). Under pressure, signals intensify faster; we lean more on forced-choice and scenarios."
    : "Steadier baseline (lower neuroticism). Day-to-day ratings are usually reliable; reactivity spikes are rarer and shorter.";

  const mix = (()=> {
    const entries = Object.entries(bn).sort((a,b)=> b[1]-a[1]);
    const [top, second] = entries;
    return `Your block mix today leans ${top[0]} (${top[1]}%) with ${second[0]} next (${second[1]}%).`;
  })();

  return (
    <section className="p-5 border rounded-2xl bg-white">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">Blocks & Overlay</h3>
        <InfoTip title="What are blocks?">
          <ul className="list-disc ml-5">
            <li><b>Core</b> (Base+Creative): native engine; where you prefer to operate.</li>
            <li><b>Critic</b> (Role+Vulnerable): effortful/sensitive; handle with care.</li>
            <li><b>Hidden</b> (Suggestive+Mobilizing): yearned-for abilities; grow with support.</li>
            <li><b>Instinct</b> (Ignoring+Demonstrative): strong but undervalued or on autopilot.</li>
          </ul>
        </InfoTip>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Bar label="Core" value={p.blocks.Core} max={100}/>
          <Bar label="Critic" value={p.blocks.Critic} max={100}/>
          <Bar label="Hidden" value={p.blocks.Hidden} max={100}/>
          <Bar label="Instinct" value={p.blocks.Instinct} max={100}/>
          <div className="text-[10px] text-gray-500 mt-1">Normalized mix: Core {bn.Core}% · Critic {bn.Critic}% · Hidden {bn.Hidden}% · Instinct {bn.Instinct}%</div>
        </div>

        <div className="text-sm">
          <div className="mb-2">{mix}</div>
          <div>
            Neuro mean: <b>{p.neuroticism.raw_mean.toFixed(2)}</b> · z <b>{p.neuroticism.z.toFixed(2)}</b>
            (~{percentile(p.neuroticism.z)}th percentile) → Overlay <b>{p.overlay}</b>
            <InfoTip title="What does ± mean?">
              <p className="mb-1"><b>'+'</b> = more reactive baseline; <b>'–'</b> = steadier baseline.</p>
              <p>We separate **trait** from **state**. Higher reactivity → we down-weight some Likert and lean more on forced-choice/scenario evidence.</p>
            </InfoTip>
          </div>
          <div className="text-xs text-gray-600 mt-2">{overlayText}</div>
        </div>
      </div>
    </section>
  );
}

export function ResultsV2({ profile }:{ profile: Profile }){
  const p = profile;
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Top3 p={p}/>
      <Glossary/>
      <Narrative p={p}/>
      <FunctionsAndDims p={p}/>
      <BlocksAndNeuro p={p}/>
    </div>
  );
}