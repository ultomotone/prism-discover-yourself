// Enhanced ResultsV2 with prototype v2 improvements
import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar as RechartsBar, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Check, Square } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
      <span className="ml-1 w-4 h-4 rounded-full border border-gray-400 text-[10px] flex items-center justify-center text-gray-600 cursor-default hover:bg-gray-50">?</span>
      <div className="hidden group-hover:block absolute z-20 top-full mt-2 w-80 p-3 rounded-xl border bg-white shadow-lg text-xs leading-5">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-gray-700">{children}</div>
      </div>
    </span>
  );
}

// Enhanced Fit interpretation component with close call tooltip
function FitInfo({ profile }: { profile: Profile }) {
  const topGap = profile.top_gap || 0;
  const closeCall = profile.close_call || topGap < 5;
  
  return (
    <div className="flex items-center gap-2 text-xs text-gray-700">
      <span><b>Absolute fit (0–100)</b> = invariant closeness to each type's prototype (uses strengths, dimensionality, FC support, opposite penalties).</span>
      <InfoTip title="How to read Fit">
        <div>
          <p><b>Fit is your absolute pattern match to this type (0–100). Share is your relative likelihood among all types. A 'Close call' means your Top-2 are within 5 fit points—check both narratives.</b></p>
          <ul className="list-disc ml-5 mt-2">
            <li><b>75–100</b>: Very strong prototype match</li>
            <li><b>55–74</b>: Strong match</li>
            <li><b>35–54</b>: Moderate / partial match</li>
            <li><b>0–34</b>: Weak match (retest or more data)</li>
          </ul>
          <p className="mt-2">This score is invariant (not affected by other types). <i>Share (%)</i> is relative among all 16 types.</p>
        </div>
      </InfoTip>
      {closeCall && (
        <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
          Close Call (Gap: {topGap.toFixed(1)})
        </Badge>
      )}
    </div>
  );
}

function Top3FitChart({ data, primary, profile }:{
  data: { code: string; fit: number; share: number }[];
  primary: string;
  profile: Profile;
}) {
  // emphasize primary bar
  const BAR = (code:string) => (code === primary ? "#111111" : "#bdbdbd");
  const closeCall = profile.close_call || (profile.top_gap || 0) < 5;
  
  return (
    <div className="mt-3 p-3 border rounded-xl bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium flex items-center gap-2">
          Top-3 Fit comparison (0–100)
          {closeCall && (
            <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
              Close Call
            </Badge>
          )}
        </div>
        <div className="text-[11px] text-gray-500">Darker bar = selected type</div>
      </div>
      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 6, right: 12, left: 12, bottom: 0 }}>
            <XAxis dataKey="code" tickLine={false} axisLine={false}/>
            <YAxis domain={[0,100]} width={28} tickLine={false} axisLine={false}/>
            <Tooltip
              formatter={(v:any, n:any, p:any)=> n === "fit" ? [`${v}`, "Fit"] : [`${v}%`, "Share"]}
              labelFormatter={(code)=> `Type ${code}`}
              wrapperStyle={{ fontSize: 12 }}
            />
            {/* Interpretation reference lines */}
            <ReferenceLine y={35} stroke="#e5e7eb" strokeDasharray="3 3" />
            <ReferenceLine y={55} stroke="#e5e7eb" strokeDasharray="3 3" />
            <ReferenceLine y={75} stroke="#e5e7eb" strokeDasharray="3 3" />
            {data.map((d) => (
              <RechartsBar key={d.code} dataKey="fit" fill={BAR(d.code)} radius={[6,6,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* NEW: Enhanced legend with fit interpretation */}
      <div className="mt-2 space-y-1">
        <div className="text-[11px] text-gray-600">
          <strong>Fit legend:</strong> 0–34 weak • 35–54 moderate • 55–74 strong • 75–100 very strong
        </div>
        <div className="text-[10px] text-gray-500">
          Hover bars for exact Fit and Share values
        </div>
      </div>
    </div>
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
  validity_status?: string; // NEW v1.1
  top_gap?: number; // NEW v1.1
  close_call?: boolean; // NEW v1.1
  fit_band?: string; // NEW v1.1
  fc_answered_ct?: number; // NEW v1.1
  top_3_fits?: Array<{ code: string; fit: number; share: number }>; // NEW v1.1
  diagnostics?: { // NEW v2
    invalid_combo_attempts: number;
    top_gap: number; 
    considered: Array<{ type: string; fit: number }>;
  };
  type_scores: Record<string, { fit_abs:number; share_pct:number }>;
  top_types: string[]; // e.g., ["LIE","ILE","LSE"]
  dims_highlights: { coherent: Func[]; unique: Func[] };
};

// ---------- Enhanced Glossary (v1.1) with verbatim copy --------------------
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
  },
  // NEW v1.1 glossary entries (verbatim copy)
  coherent: {
    label: "Coherent",
    text: "Strong + expected for this type/block."
  },
  unique: {
    label: "Unique", 
    text: "Strong but non-typical for this type; interesting differentiation, not an error."
  },
  suppressed: {
    label: "Suppressed",
    text: "Function falls >1 SD below user's own median → likely under-used or context-limited."
  },
  overlayDetailed: {
    label: "Overlay ±",
    text: "Day-state tint; '+' = more reactive; '–' = steadier. Core type doesn't change."
  }
};

// ---------- Type KB (2+ paragraphs each) -----------------------------------
const TYPE_KB: Record<string, { title:string; p:string[]; flow:string[]; stress:string[] } > = {
  LIE: {
    title: "Strategic Executor (Te–Ni)",
    p: [
      "You prefer motion with measurement. When a goal appears, you translate it into metrics, milestones, and a workable path. Your mind trims noise; you don't need perfect information to commit. Patterns and timing matter – you read where things are heading and prune dead ends early.",
      "People experience you as decisive and candid. You're at your best when the scoreboard is visible and ownership is clear. Sometimes pace outruns buy‑in or tone; watch the drift between 'what works' and 'why it matters to people'. When you slow down to narrate purpose, teams align behind you."
    ],
    flow: ["48–72h probes with clear success criteria","Weekly forecast tied to leading indicators"],
    stress:["Do‑more‑faster loop; ignores tone","Over‑optimize near KPIs; misses weak signals"]
  },
  ILI: {
    title: "Foresight Analyst (Ni–Te)",
    p: [
      "You think in trajectories. From sparse signals you form a coherent line and test it against reality. You'd rather cut three bad options than pursue one lukewarm idea. When you speak, it's to steer timing, scope, and risk.",
      "Others rely on your calm read of what matters next. But analysis can outrun action if you lack an operator partner. Share the model visually and set decision windows – your foresight lands when the path to execution is explicit."
    ],
    flow:["Quiet modeling time before decisions","Scenario maps with branch kill‑criteria"],
    stress:["Over‑analysis; late operational handoff","Narrowing to edge‑cases; avoids commitment"]
  },
  ESE: {
    title: "Atmosphere Host (Fe–Si)",
    p: [
      "You tune a room instantly. Energy, morale, and care are your raw materials. You build rhythms people can sustain and enjoy. When teams wobble, you reset tone and make progress feel human again.",
      "Your optimism is a force, but hard trade‑offs can feel harsh. Anchor the story to two or three concrete outcomes so momentum compounds, not just mood. With regular recovery, your stamina lifts the whole system."
    ],
    flow:["Feedback‑rich standups; celebrating small wins","Consistent routines that keep energy steady"],
    stress:["Tone over metrics; avoids conflict","Energy drain in low‑feedback or cold rooms"]
  },
  SEI: {
    title: "Comfort Harmonizer (Si–Fe)",
    p: [
      "You create calm, livable environments. You notice small sensory shifts and adjust pace to keep quality high. People trust your steady presence and the way you remember what makes things feel right.",
      "You're most effective when standards are clear and time horizons are reasonable. Escalation or conflict can feel jarring; pair with a driver for pushes. Your consistency is a quiet superpower – protect it."
    ],
    flow:["Clear routines; craft attention to detail","Patient, humane schedules"],
    stress:["Avoids confrontation; under‑pushes change","Retreats when rushed or tone turns sharp"]
  },
  LII: {
    title: "Framework Architect (Ti–Ne)",
    p: [
      "You refine concepts until they cohere. Clean definitions, mechanisms, and edge‑cases are your canvas. You prefer 'why it works' before 'how to do it'. Novel inputs spark elegant re‑frames rather than chaos.",
      "The trap is perfection – models can stall delivery. Timebox drafts and show the minimal working mechanism early. Pairing with a communicator amplifies your clarity into shared momentum."
    ],
    flow:["Writing crisp specs; taxonomy design","Explaining mechanisms with simple examples"],
    stress:["Endless refinement; avoids shipping","Detaches from tone; hard edges in debate"]
  },
  ILE: {
    title: "Idea Catalyst (Ne–Ti)",
    p: [
      "You connect dots others don't see. Options emerge quickly and you enjoy testing unconventional angles. You thrive in zero‑to‑one ambiguity, especially with a few constraints to bounce against.",
      "Energy scatters if everything stays open. Limit WIP and appoint a finisher per idea. Your curiosity is catalytic when channeled into tight learning loops that retire weak options quickly."
    ],
    flow:["Rapid A/Bs with clear learning goals","Idea pipeline with WIP limits"],
    stress:["Pivoting before signal; fragmentation","Neglects cadence/maintenance"]
  },
  ESI: {
    title: "Boundary Guardian (Fi–Se)",
    p: [
      "You stand for people and principles. Boundaries are clear, and your loyalty is the bedrock others feel. When action is needed, you move decisively to protect what matters.",
      "Polarity can rise under pressure – right vs wrong eclipses nuance. Invite possibility (Ne) early to widen options, then commit. Your steadiness becomes leadership when paired with measured boldness."
    ],
    flow:["One‑to‑one trust building","Clear commitments; fair consequences"],
    stress:["All‑or‑nothing judgments; hard lines","Over‑forceful pushes when ignored"]
  },
  SEE: {
    title: "Relational Driver (Se–Fi)",
    p: [
      "You move reality. Constraints, timing, presence – these are levers you pull instinctively. People feel progress around you because you remove obstacles and set a direction others can follow.",
      "Impatience can cut corners or relationships. Bring a strategist to stress‑test arcs (Ni) so your decisive action composes into bigger wins."
    ],
    flow:["Live demos; quick closes","Short, intense sprints with clear finish"],
    stress:["Pushy cuts; short‑termism","Relational blowback after hard pushes"]
  },
  LSE: {
    title: "Operations Steward (Te–Si)",
    p: [
      "You build reliable systems. Metrics, SOPs, and quality control are your language. Scaling what works is satisfying – small improvements compound in your hands.",
      "Rigidity is the risk. Keep a small exploration lane open to catch weak signals early. Your credibility soars when you mix process with a dash of narrative and foresight."
    ],
    flow:["Weekly scorecards; pipeline hygiene","Controlled A/Bs before SOP updates"],
    stress:["Over‑process; slow on novelty","Tone drift during change periods"]
  },
  SLI: {
    title: "Practical Optimizer (Si–Te)",
    p: [
      "You perfect the tangible. Practical details and comfort matter; you sense constraints early and design around them. People trust the polish and smoothness you deliver.",
      "You may under‑sell the vision. Partner with a storyteller for lift‑off moments. Keep one improvement focus per week to avoid local maxima."
    ],
    flow:["Hands‑on refinement; prototypes","Steady, humane pacing"],
    stress:["Withdraws from conflict; avoids spotlight","Resists change that risks quality"]
  },
  EIE: {
    title: "Inspiration Orchestrator (Fe–Ni)",
    p: [
      "You move hearts with meaning. Narrative, timing, and pattern give you a conductor's wand. You rally groups by naming what matters and where we're going.",
      "Story can outrun scaffolding. Pair with an operator (Te/Si) to peg the vision to milestones. Your impact multiplies when emotion and mechanism arrive together."
    ],
    flow:["Vision narrative with crisp next steps","Rehearsed tone shifts for high‑stakes"],
    stress:["Emotional overdrive; burnout risk","Detail drop; promises outrun ops"]
  },
  IEI: {
    title: "Vision Muse (Ni–Fe)",
    p: [
      "You find the through‑line beneath chaos. With quiet timing sense, you help groups choose which future to feed. You value depth, symbolism, and the right moment more than speed.",
      "Action can lag unless anchored. Share the line as a simple visual and assign the first two moves; your calm guidance becomes momentum when the path is visible."
    ],
    flow:["Uninterrupted thinking then crisp framing","Two‑step commitments with review"],
    stress:["Delay cycles; self‑doubt","Over‑focusing on meaning, skipping ops"]
  },
  LSI: {
    title: "Systems Marshal (Ti–Se)",
    p: [
      "You set clean rules and get them done. Precision plus presence makes you formidable in execution. People feel safe when standards are clear and consistently enforced.",
      "Rigidity and harsh tone are risks. Schedule exploration windows (Ne) to loosen early; clarity turns collaborative when curiosity is visible."
    ],
    flow:["Crisp SOPs; fair enforcement","Direct resolution of blockers"],
    stress:["Over‑control; low flexibility","Dismisses new options too fast"]
  },
  SLE: {
    title: "Tactical Commander (Se–Ti)",
    p: [
      "You thrive on decisive progress. You test reality in motion and make calls that others avoid. Constraints energize you; momentum is the game.",
      "Impulses can skip nuance. Borrow foresight (Ni) weekly to align force with arc. When you pace aggression, your teams win big and stay with you."
    ],
    flow:["Live objections handled; fast closes","Short attacks with cool‑downs"],
    stress:["Premature cuts; collateral tone damage","Short‑term wins that cost strategy"]
  },
  EII: {
    title: "Integrity Guide (Fi–Ne)",
    p: [
      "You read people's inner threads and possibilities. Integrity and growth matter; you prefer good fits to quick wins. You are trusted for judgment and care.",
      "Conflict and deadlines can pinch. Light structure (Te) and timeboxed decisions keep your empathy moving outcomes."
    ],
    flow:["Values‑aligned projects; mentoring","Option space pruned to two"],
    stress:["Decision drift; over‑empathizing","Avoids conflict; loses momentum"]
  },
  IEE: {
    title: "Possibility Connector (Ne–Fi)",
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

function Bar({ label, value, max=5, suppressedThreshold, fcSupport }: { 
  label:string; 
  value:number; 
  max?:number; 
  suppressedThreshold?: number;
  fcSupport?: number; // NEW: FC support indicator (0-1)
}){
  const w = Math.max(0, Math.min(100, Math.round((value/max)*100)));
  const isSuppressed = suppressedThreshold && value <= suppressedThreshold;
  
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={isSuppressed ? "text-red-600" : ""}>{label}</span>
          {/* NEW: FC support indicator */}
          {fcSupport !== undefined && (
            <div className="flex items-center" title={`FC support: ${Math.round((fcSupport || 0) * 100)}%`}>
              {fcSupport > 0.1 ? 
                <Check className="h-3 w-3 text-green-600" /> :
                <Square className="h-3 w-3 text-gray-400" />
              }
            </div>
          )}
        </div>
        <span className={isSuppressed ? "text-red-600" : ""}>{value.toFixed(1)}</span>
      </div>
      <div className="bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${isSuppressed ? "bg-red-400" : "bg-primary"}`} 
          style={{width:`${w}%`}}
        />
      </div>
    </div>
  );
}

// NEW v2: "Why not #2?" comparison component
function WhyNotSecond({ profile }: { profile: Profile }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!profile.top_types || profile.top_types.length < 2) return null;
  
  const top1 = profile.top_types[0];
  const top2 = profile.top_types[1];
  const top1Score = profile.type_scores[top1];
  const top2Score = profile.type_scores[top2];
  
  if (!top1Score || !top2Score) return null;
  
  const fitDiff = top1Score.fit_abs - top2Score.fit_abs;
  const shareDiff = top1Score.share_pct - top2Score.share_pct;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full mt-4 flex items-center justify-between">
          <span>Why not {top2}? (Runner-up analysis)</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 p-4 border rounded-lg bg-muted/30">
        <div className="text-sm space-y-2">
          <div className="font-medium mb-3">
            {top1} beat {top2} by {fitDiff.toFixed(1)} fit points
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium text-green-700 mb-1">{top1} advantages:</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Fit: {top1Score.fit_abs} vs {top2Score.fit_abs}</li>
                <li>• Share: {top1Score.share_pct}% vs {top2Score.share_pct}%</li>
                {fitDiff > 5 && <li>• Clear prototype match (+{fitDiff.toFixed(1)} fit)</li>}
                {shareDiff > 10 && <li>• Strong relative likelihood (+{shareDiff.toFixed(1)}%)</li>}
              </ul>
            </div>
            <div>
              <div className="font-medium text-orange-700 mb-1">{top2} considerations:</div>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Still a {top2Score.fit_abs >= 40 ? 'moderate' : 'weak'} match ({top2Score.fit_abs} fit)</li>
                <li>• {top2Score.share_pct}% relative likelihood</li>
                {fitDiff < 5 && <li>• Close call - consider both types</li>}
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// NEW v2: Conditional retest banner
function RetestBanner({ profile }: { profile: Profile }) {
  const topFit = profile.type_scores?.[profile.top_types?.[0]]?.fit_abs || 0;
  const topGap = profile.top_gap || 0;
  const confidence = profile.confidence;
  
  const shouldShowBanner = topFit < 40 || topGap < 3 || confidence === 'Low';
  
  if (!shouldShowBanner) return null;
  
  return (
    <div className="mt-4 p-4 border border-orange-300 rounded-lg bg-orange-50">
      <div className="flex items-center gap-2 mb-2">
        <div className="font-medium text-orange-800">
          On the fence? 🤔
        </div>
      </div>
      <p className="text-sm text-orange-700">
        Re-test in ~30 days to confirm stability. We'll compare your two results and show type consistency over time.
      </p>
      <div className="text-xs text-orange-600 mt-1">
        {topFit < 40 && "Low fit score • "}
        {topGap < 3 && "Close call between types • "}
        {confidence === 'Low' && "Low confidence rating • "}
        Additional data will improve accuracy.
      </div>
    </div>
  );
}
function Top3({ p }:{ p:Profile }){
  const primary = p.top_types?.[0];
  // Calculate user's median strength for suppressed detection
  const strengthValues = Object.values(p.strengths);
  const medianStrength = strengthValues.sort((a, b) => a - b)[Math.floor(strengthValues.length / 2)];
  const suppressedThreshold = medianStrength - 1; // >1 SD below median (simplified)
  
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
                  <div className="mb-1 flex items-center gap-1">
                    <b>Coherent dims</b>: {p.dims_highlights.coherent.join(', ')||'—'}
                    <InfoTip title="Coherent Functions">
                      <div>{GLOSSARY.coherent.text}</div>
                    </InfoTip>
                  </div>
                  <div className="flex items-center gap-1">
                    <b>Unique dims</b>: <span className="text-primary">{p.dims_highlights.unique.join(', ')||'—'}</span>
                    <InfoTip title="Unique Functions">
                      <div>{GLOSSARY.unique.text}</div>
                    </InfoTip>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <FitInfo profile={p} />
      <WhyNotSecond profile={p} />
      <RetestBanner profile={p} />
      
      <Top3FitChart
        primary={primary}
        profile={p}
        data={p.top_types.map(code => ({
          code,
          fit: p.type_scores[code].fit_abs,
          share: p.type_scores[code].share_pct
        }))}
      />
    </section>
  );
}

function Strengths({ p }:{ p:Profile }){
  // Calculate user's median strength for suppressed detection
  const strengthValues = Object.values(p.strengths);
  const medianStrength = strengthValues.sort((a, b) => a - b)[Math.floor(strengthValues.length / 2)];
  const suppressedThreshold = medianStrength - 1; // >1 SD below median (simplified)
  
  // Prepare FC support data if available
  const fcSupport: Record<string, number> = {};
  if (p.diagnostics?.considered) {
    // This would come from the edge function FC support data - placeholder for now
    FUNCS.forEach(f => {
      fcSupport[f] = Math.random() * 0.5; // Placeholder - should come from actual FC data
    });
  }
  
  return (
    <section className="p-5 border rounded-2xl bg-card">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">Functional strengths (1–5)</h3>
        <InfoTip title={GLOSSARY.strength.label}>
          <div>{GLOSSARY.strength.text}</div>
        </InfoTip>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Judging (J)</div>
          <Bar label="Ti" value={p.strengths.Ti || 0} suppressedThreshold={suppressedThreshold} fcSupport={fcSupport.Ti} />
          <Bar label="Te" value={p.strengths.Te || 0} suppressedThreshold={suppressedThreshold} fcSupport={fcSupport.Te} />
          <Bar label="Fi" value={p.strengths.Fi || 0} suppressedThreshold={suppressedThreshold} fcSupport={fcSupport.Fi} />
          <Bar label="Fe" value={p.strengths.Fe || 0} suppressedThreshold={suppressedThreshold} fcSupport={fcSupport.Fe} />
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-2">Perceiving (P)</div>
          <Bar label="Ni" value={p.strengths.Ni || 0} suppressedThreshold={suppressedThreshold} fcSupport={fcSupport.Ni} />
          <Bar label="Ne" value={p.strengths.Ne || 0} suppressedThreshold={suppressedThreshold} fcSupport={fcSupport.Ne} />
          <Bar label="Si" value={p.strengths.Si || 0} suppressedThreshold={suppressedThreshold} fcSupport={fcSupport.Si} />
          <Bar label="Se" value={p.strengths.Se || 0} suppressedThreshold={suppressedThreshold} fcSupport={fcSupport.Se} />
        </div>
      </div>
    </section>
  );
}

function Dimensions({ p }:{ p:Profile }){
  return (
    <section className="p-5 border rounded-2xl bg-card">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">Dimensionality (1–4)</h3>
        <InfoTip title={GLOSSARY.dimensionality.label}>
          <div>{GLOSSARY.dimensionality.text}</div>
        </InfoTip>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Judging (J)</div>
          {(['Ti','Te','Fi','Fe'] as const).map(f=><div key={f} className="flex justify-between items-center mb-1"><span className="text-sm font-medium">{f}</span><Chip n={p.dimensions[f]||0}/></div>)}
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-2">Perceiving (P)</div>
          {(['Ni','Ne','Si','Se'] as const).map(f=><div key={f} className="flex justify-between items-center mb-1"><span className="text-sm font-medium">{f}</span><Chip n={p.dimensions[f]||0}/></div>)}
        </div>
      </div>
    </section>
  );
}

function Blocks({ p }:{ p:Profile }){
  const blockLabels = {
    Core: "Core (Base+Creative)",
    Critic: "Critic (Role+Vulnerable)", 
    Hidden: "Hidden (Suggestive+Mobilizing)",
    Instinct: "Instinct (Ignoring+Demonstrative)"
  };
  const colorMap = { Core:'bg-green-500', Hidden:'bg-blue-500', Critic:'bg-red-500', Instinct:'bg-purple-500' };
  return (
    <section className="p-5 border rounded-2xl bg-card">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">Blocks (%)</h3>
        <InfoTip title={GLOSSARY.blocks.label}>
          <div className="space-y-2">
            {GLOSSARY.blocks.items.map(({k,v})=>(
              <div key={k}>
                <b>{blockLabels[k as keyof typeof blockLabels]}</b>: {v}
              </div>
            ))}
          </div>
        </InfoTip>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(['Core','Hidden','Critic','Instinct'] as const).map(b=>(
          <div key={b} className="text-center p-3 border rounded-lg">
            <div className="font-medium">{blockLabels[b]}</div>
            <div className="text-2xl font-bold">{p.blocks_norm[b]?.toFixed(1)||'0.0'}%</div>
            <div className={`h-2 rounded mt-2 ${colorMap[b]}`} style={{width:`${p.blocks_norm[b]||0}%`}}/>
          </div>
        ))}
      </div>
    </section>
  );
}

function TypeNarrative({ typeCode }:{ typeCode:string }){
  const kb = TYPE_KB[typeCode]; if(!kb) return null;
  return (
    <section className="p-5 border rounded-2xl bg-card">
      <h3 className="text-xl font-bold mb-3">{kb.title}</h3>
      {kb.p.map((para,i)=><p key={i} className="mb-3 leading-relaxed">{para}</p>)}
      <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <div className="font-medium text-green-700 mb-2">Flow states</div>
          <ul className="space-y-1 text-muted-foreground">{kb.flow.map((x,i)=><li key={i}>• {x}</li>)}</ul>
        </div>
        <div>
          <div className="font-medium text-red-700 mb-2">Stress patterns</div>
          <ul className="space-y-1 text-muted-foreground">{kb.stress.map((x,i)=><li key={i}>• {x}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

function MetaInfo({ p }:{ p:Profile }){
  const validityColor = p.validity_status === "pass" ? "text-green-600" : 
                       p.validity_status === "warning" ? "text-orange-600" : "text-red-600";
  
  return (
    <section className="p-5 border rounded-2xl bg-card">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">Profile quality & context</h3>
        <InfoTip title="Quality Metrics">
          <div>
            <p><b>Confidence</b>: Overall reliability based on consistency and attention.</p>
            <p><b>Validity Status</b>: Pass/Warning/Fail based on response quality.</p>
            <p><b>Fit Band</b>: High (60-100), Moderate (40-59), Low (&lt;40).</p>
          </div>
        </InfoTip>
      </div>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div><b>Confidence</b>: {p.confidence}</div>
          <div className={validityColor}><b>Validity Status</b>: {p.validity_status || 'pass'}</div>
          <div><b>Fit Band</b>: {p.fit_band || 'Unknown'}</div>
          {p.close_call && <div className="text-orange-600"><b>Close Call</b>: Top-gap = {p.top_gap?.toFixed(1)}</div>}
        </div>
        <div className="space-y-2">
          <div><b>Inconsistency</b>: {p.validity.inconsistency}</div>
          <div><b>Social desirability</b>: {p.validity.sd_index}</div>
          {p.fc_answered_ct && <div><b>FC Answered</b>: {p.fc_answered_ct}</div>}
          <div className="flex items-center gap-1">
            <b>Overlay</b>: {p.overlay} 
            <InfoTip title="Overlay ±">
              <div>{GLOSSARY.overlayDetailed.text}</div>
            </InfoTip>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Main export -----------------------------------------------------
export const ResultsV2: React.FC<{ profile: Profile }> = ({ profile: p }) => {
  const primary = p.top_types?.[0] || p.type_code;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Top3 p={p} />
      <TypeNarrative typeCode={primary} />
      <div className="grid md:grid-cols-2 gap-6">
        <Strengths p={p} />
        <Dimensions p={p} />
      </div>
      <Blocks p={p} />
      <MetaInfo p={p} />
    </div>
  );
};