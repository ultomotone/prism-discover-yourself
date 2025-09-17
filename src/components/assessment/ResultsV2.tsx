import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar as RechartsBar, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Check, Square, TrendingUp, TrendingDown, Users, Target, Zap, Heart } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TYPE_CORE_DESCRIPTIONS } from "@/data/typeCoreDescriptions";
import { prismTypes } from "@/data/prismTypes";
import { StateLegend } from "@/components/common/StateLegend";
import { FUNCS, type Profile, type Func } from "@/features/results/types";

export type Top3Item = { code: string; fit?: number };

export function getTop3List(profile: any): Top3Item[] {
  const fromTypes: Top3Item[] | undefined = profile?.top_types?.map(
    (code: string) => ({
      code,
      fit:
        profile?.type_scores?.[code]?.fit_abs ??
        profile?.type_scores?.[code]?.fit,
    })
  );

  const fromFits: Top3Item[] | undefined = profile?.top_3_fits?.map(
    (x: any) => ({ code: x.code, fit: x.fit })
  );

  const primary: Top3Item[] = profile?.type_code
    ? [
        {
          code: profile.type_code,
          fit:
            profile?.score_fit_calibrated ??
            profile?.score_fit_raw,
        },
      ]
    : [];

  const source = fromTypes?.length
    ? fromTypes
    : fromFits?.length
    ? fromFits
    : primary;

  return (source ?? [])
    .filter((item) => typeof item.code === "string" && item.code.length > 0)
    .slice(0, 3);
}

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
    text: "'+' = more reactive (higher neuroticism/stress), '–' = steadier (lower neuroticism/calm). Tints how your type expresses under pressure."
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
    text: "Regulation state tint; '+' = more reactive/stressed (N+); '–' = calmer/regulated (N−). Core type doesn't change."
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
  const top1Score = profile.type_scores?.[top1];
  const top2Score = profile.type_scores?.[top2];
  
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

//  Enhanced retest banner with v1.1 calibrated thresholds
function RetestBanner({ profile }: { profile: Profile }) {
  const topFit = profile.score_fit_calibrated ?? (profile.type_scores?.[profile.top_types?.[0]]?.fit_abs || 0);
  const topGap = profile.top_gap || 0;
  const confidence = profile.confidence;
  const fitBand = profile.fit_band;
  
  // Show banner for low fit band or close calls (v1.1 criteria)
  const shouldShowBanner = fitBand === 'Low' || topGap < 3;
  
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
        {fitBand === 'Low' && "Low fit band • "}
        {topGap < 3 && "Close call between types • "}
        {confidence === 'Low' && "Low confidence rating • "}
        Additional data will improve accuracy.
      </div>
    </div>
  );
}
function Top3({ p }:{ p:Profile }){
  const topItems = getTop3List(p);
  const primary = topItems[0]?.code || p.top_types?.[0] || p.type_code || '';
  const strengthValues = Object.values(p.strengths ?? {});
  const sortedStrengths = [...strengthValues].sort((a, b) => a - b);
  const medianStrength = sortedStrengths.length
    ? sortedStrengths[Math.floor(sortedStrengths.length / 2)]
    : 0;
  const suppressedThreshold = medianStrength - 1; // >1 SD below median (simplified)

  const overlay = p.overlay ?? '';

  return (
    <section className="p-5 border rounded-2xl bg-card">
      <div className="flex items-end gap-3 mb-3">
        <h3 className="font-semibold">Top matches</h3>
        <span className="text-xs text-muted-foreground">Absolute fit = invariant (0–100). Share = relative among all types.</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {topItems.map(({ code, fit }) => {
          const typeScore = p.type_scores?.[code];
          const share = typeScore?.share_pct ?? 0;
          const title = TYPE_KB[code]?.title || code;
          const isMain = code === primary;
          const calibratedFit = typeof typeScore?.fit_abs === 'number' ? typeScore.fit_abs : undefined;
          const fallbackFit =
            typeof fit === 'number'
              ? fit
              : typeof typeScore?.fit_abs === 'number'
              ? typeScore.fit_abs
              : undefined;
          const displayFit = calibratedFit ?? fallbackFit ?? 0;
          return (
            <div key={code} className={`p-4 border rounded-xl ${isMain ? 'bg-muted/50' : ''}`}>
              <div className="flex justify-between items-baseline">
                <div className="font-semibold">{code}{isMain ? overlay : ''}</div>
                <div className="text-xs text-muted-foreground">Share {share}%</div>
              </div>
              <div className="text-sm text-muted-foreground">{title}</div>
              <div className="mt-2 text-sm">
                <span className="font-semibold">
                  Fit
                  <span
                    className={`cursor-help ${calibratedFit !== undefined ? 'text-foreground' : 'text-orange-600'}`}
                    title={calibratedFit !== undefined
                      ? 'Individual calibrated fit for this specific type'
                      : 'Using fallback fit value - check type_scores data'}
                  >
                    {displayFit}
                  </span>
                </span>
              </div>
              {isMain && (
                <div className="mt-2 text-xs">
                  <div className="mb-1 flex items-center gap-1">
                    <b>Coherent dims</b>: {p.dims_highlights.coherent.join(', ') || '—'}
                    <InfoTip title="Coherent Functions">
                      <div>{GLOSSARY.coherent.text}</div>
                    </InfoTip>
                  </div>
                  <div className="flex items-center gap-1">
                    <b>Unique dims</b>: <span className="text-primary">{p.dims_highlights.unique.join(', ') || '—'}</span>
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
        data={topItems.map(({ code, fit }) => {
          const typeScore = p.type_scores?.[code];
          const chartFit =
            typeof typeScore?.fit_abs === 'number'
              ? typeScore.fit_abs
              : typeof fit === 'number'
              ? fit
              : typeof typeScore?.fit_abs === 'number'
              ? typeScore.fit_abs
              : 0;
          return {
            code,
            fit: chartFit,
            share: typeScore?.share_pct ?? 0,
          };
        })}
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
  if (p?.meta?.diagnostics?.considered && FUNCS) {
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
  console.log('🔵 Dimensions component called with profile dimensions data:', {
    hasDimensions: !!p.dimensions,
    dimensions: p.dimensions,
    dimensionsKeys: p.dimensions ? Object.keys(p.dimensions) : 'No dimensions'
  });

  // Check if dimensions exists and has non-zero values
  const hasValidDimensionsData = p.dimensions && 
    typeof p.dimensions === 'object' && 
    Object.values(p.dimensions).some(val => val && val > 0);

  if (!hasValidDimensionsData) {
    console.warn('🔴 Missing or zero dimensions data in profile:', p.dimensions);
    return (
      <section className="p-5 border rounded-2xl bg-card">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold">Dimensionality (1–4)</h3>
          <InfoTip title={GLOSSARY.dimensionality.label}>
            <div>{GLOSSARY.dimensionality.text}</div>
          </InfoTip>
        </div>
        <div className="text-center text-muted-foreground py-8">
          <div className="mb-2">Dimensionality analysis not available</div>
          <div className="text-sm">This assessment may be incomplete or using test data</div>
        </div>
      </section>
    );
  }

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
  console.log('🔵 Blocks component called with profile blocks data:', {
    hasBlocks: !!p.blocks,
    hasBlocksNorm: !!p.blocks_norm,
    blocks: p.blocks,
    blocks_norm: p.blocks_norm
  });

  // Check if blocks_norm exists and has non-zero values
  const hasValidBlocksData = p.blocks_norm && 
    typeof p.blocks_norm === 'object' && 
    Object.values(p.blocks_norm).some(val => val && val > 0);

  if (!hasValidBlocksData) {
    console.warn('🔴 Missing or zero blocks_norm data in profile:', p.blocks_norm);
    return (
      <section className="p-5 border rounded-2xl bg-card">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold">Blocks (%)</h3>
          <InfoTip title="Block Analysis">
            <div>
              {GLOSSARY.blocks.items.map(({k,v})=>(
                <div key={k} className="mb-2">
                  <b>{k}</b>: {v}
                </div>
              ))}
            </div>
          </InfoTip>
        </div>
        <div className="text-center text-muted-foreground py-8">
          <div className="mb-2">Block analysis data not available</div>
          <div className="text-sm">This assessment may be incomplete or using test data</div>
        </div>
      </section>
    );
  }

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

// Enhanced Core Description component using centralized data
function TypeCoreSection({ typeCode }: { typeCode: string }) {
  console.log('🔵 TypeCoreSection called with typeCode:', typeCode, 'Available TYPE_CORE_DESCRIPTIONS keys:', Object.keys(TYPE_CORE_DESCRIPTIONS));
  
  if (!typeCode) {
    console.warn('🔴 TypeCoreSection: No typeCode provided');
    return null;
  }
  
  const coreData = TYPE_CORE_DESCRIPTIONS[typeCode];
  
  if (!coreData) {
    console.warn('🔴 TypeCoreSection: No core data found for typeCode:', typeCode, 'Available codes:', Object.keys(TYPE_CORE_DESCRIPTIONS));
    return (
      <section className="p-6 border rounded-2xl bg-card prism-shadow-card">
        <h2 className="text-xl font-bold mb-4 text-primary">Core</h2>
        <p className="text-muted-foreground">
          Core description not available for type: {typeCode}
        </p>
      </section>
    );
  }
  
  console.log('🟢 TypeCoreSection: Successfully found core data for', typeCode, 'with', coreData.paragraphs.length, 'paragraphs');
  
  return (
    <section className="p-6 border rounded-2xl bg-card prism-shadow-card">
      <h2 className="text-xl font-bold mb-4 text-primary">Core</h2>
      {coreData.paragraphs.map((paragraph, index) => (
        <p key={index} className="text-lg leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      ))}
    </section>
  );
}

// State Overlay Section with description
function StateOverlaySection({ overlay }: { overlay: string }) {
  const overlayData = {
    '+': {
      label: 'Elevated Reactivity',
      icon: <TrendingUp className="h-6 w-6 text-red-600" />,
      description: 'You\'re currently in a heightened state with more intense, reactive responses. This means higher vigilance, faster action, and more emotional intensity. Your core functions may be more rigid, and you might be more sensitive to stressors.',
      color: 'border-red-200 bg-red-50'
    },
    '–': {
      label: 'Steady Reactivity', 
      icon: <TrendingDown className="h-6 w-6 text-green-600" />,
      description: 'You\'re in a calmer, more measured state with stable responses. This means lower reactivity, more deliberate thinking, and consistent energy. Your core functions operate smoothly and you recover faster from setbacks.',
      color: 'border-green-200 bg-green-50'
    },
    'neutral': {
      label: 'Neutral State',
      icon: <TrendingDown className="h-6 w-6 text-blue-600" />,
      description: 'Your assessment indicates a balanced emotional state without significant elevation or suppression of reactivity.',
      color: 'border-blue-200 bg-blue-50'
    }
  };

  const data = overlayData[overlay as keyof typeof overlayData] || overlayData.neutral;
  
  return (
    <section className={`p-6 border rounded-2xl ${data.color}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {data.icon}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2 text-primary">
            State Overlay: {data.label} ({overlay})
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground mb-4">
            {data.description}
          </p>
          
          <div className="mb-2">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>State Overlay.</strong> We show <em>Reg+/0/−</em> as a friendlier alias for Neuroticism states:
              <em> Reg+ = N− (calm)</em>, <em>Reg0 = N0</em>, <em>Reg− = N+ (stressed)</em>.
              More Reg+ generally raises fit; more Reg− generally lowers it.
            </p>
            <StateLegend />
          </div>
        </div>
      </div>
    </section>
  );
}

// Core Alignment Section 
function CoreAlignmentSection({ typeCode }: { typeCode: string }) {
  const coreAlignments = {
    'innovative-harmonizers': {
      name: "Innovative Harmonizers",
      formerly: "Alpha Quadra",
      icon: <Zap className="h-6 w-6 text-primary" />,
      archetype: "Enthusiastic explorers who seek out new ideas and shared comfort. This group embodies playful creativity, warm sociability, and a positive, inclusive outlook.",
      coreValues: "Openness to possibilities and intellectual playfulness. They prize explorative thinking and brainstorming, combined with a love of personal comfort and present-moment enjoyment.",
      types: ["ILE", "SEI", "ESE", "LII"]
    },
    'driven-idealists': {
      name: "Driven Idealists",
      formerly: "Beta Quadra", 
      icon: <Target className="h-6 w-6 text-primary" />,
      archetype: "Intense crusaders motivated by vision, loyalty, and impact. This group is defined by passionate energy and a strong sense of purpose.",
      coreValues: "Mission, unity, and honor. They value having a clear vision or belief to fight for, and esteem group loyalty and shared principles.",
      types: ["SLE", "IEI", "EIE", "LSI"]
    },
    'pragmatic-realists': {
      name: "Pragmatic Realists", 
      formerly: "Gamma Quadra",
      icon: <Users className="h-6 w-6 text-primary" />,
      archetype: "Hard-nosed yet principled achievers who keep their eyes on the prize. This group is all about practical results, personal responsibility, and realistic goals.",
      coreValues: "Efficacy and authenticity. They prize effective action and concrete success above idle speculation, demanding grounded logic and proof.",
      types: ["SEE", "ILI", "LIE", "ESI"]
    },
    'humanitarian-stabilizers': {
      name: "Humanitarian Stabilizers",
      formerly: "Delta Quadra",
      icon: <Heart className="h-6 w-6 text-primary" />,
      archetype: "Conscientious facilitators who cultivate stability, growth, and well-being for all. This group is characterized by steady, supportive efforts to build a better life.",
      coreValues: "Steady improvement and ethical sincerity. They value doing what's right and what works in the long run, emphasizing integrity, trust, and personal values.",
      types: ["LSE", "SLI", "IEE", "EII"]
    }
  };

  // Find which core alignment this type belongs to
  const alignment = Object.entries(coreAlignments).find(([_, data]) => 
    data.types.includes(typeCode)
  )?.[1];

  if (!alignment) return null;

  return (
    <section className="p-6 border rounded-2xl bg-card prism-shadow-card">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {alignment.icon}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2 text-primary">
            Core Alignment: {alignment.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Formerly: {alignment.formerly}
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-primary mb-1">Archetype</h3>
              <p className="text-muted-foreground">{alignment.archetype}</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-1">Core Values</h3>
              <p className="text-muted-foreground">{alignment.coreValues}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Enhanced Functions Analysis Section
function FunctionsAnalysis({ p }: { p: Profile }) {
  // Calculate user's median strength for suppressed detection
  const strengthValues = Object.values(p.strengths);
  const medianStrength = strengthValues.sort((a, b) => a - b)[Math.floor(strengthValues.length / 2)];
  const suppressedThreshold = medianStrength - 1;
  
  // Categorize functions based on type and performance
  const functionsData = (FUNCS || []).map(func => {
    const strength = safeGet(p, `strengths.${func}`, 0);
    const dimension = safeGet(p, `dimensions.${func}`, 0);
    const isSuppressed = strength <= suppressedThreshold;
    const isCoherent = safeArray(p.dims_highlights?.coherent).includes(func);
    const isUnique = safeArray(p.dims_highlights?.unique).includes(func);
    
    let category = 'Typical';
    if (isSuppressed) category = 'Suppressed';
    else if (isUnique) category = 'Unique';
    else if (isCoherent) category = 'Typical';
    
    return { func, strength, dimension, category, isSuppressed, isCoherent, isUnique };
  });

  const categoryColors = {
    'Typical': 'text-foreground',
    'Suppressed': 'text-red-600',
    'Unique': 'text-blue-600'
  };

  return (
    <section className="p-5 border rounded-2xl bg-card">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">Functions Analysis</h3>
        <InfoTip title="Functions Categories">
          <div className="space-y-2">
            <div><b>Typical:</b> {GLOSSARY.coherent.text}</div>
            <div><b>Unique:</b> {GLOSSARY.unique.text}</div>
            <div><b>Suppressed:</b> {GLOSSARY.suppressed.text}</div>
          </div>
        </InfoTip>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-muted-foreground mb-3">Judging Functions</div>
          {functionsData.filter(f => ['Ti', 'Te', 'Fi', 'Fe'].includes(f.func)).map(f => (
            <div key={f.func} className="flex items-center justify-between py-2 border-b border-muted last:border-0">
              <div className="flex items-center gap-3">
                <span className={`font-medium ${categoryColors[f.category]}`}>{f.func}</span>
                <Badge variant="outline" className={`text-xs ${
                  f.category === 'Suppressed' ? 'border-red-300 text-red-600' :
                  f.category === 'Unique' ? 'border-blue-300 text-blue-600' :
                  'border-gray-300'
                }`}>
                  {f.category}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{f.strength.toFixed(1)}</div>
                <Chip n={f.dimension} />
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-3">Perceiving Functions</div>
          {functionsData.filter(f => ['Ni', 'Ne', 'Si', 'Se'].includes(f.func)).map(f => (
            <div key={f.func} className="flex items-center justify-between py-2 border-b border-muted last:border-0">
              <div className="flex items-center gap-3">
                <span className={`font-medium ${categoryColors[f.category]}`}>{f.func}</span>
                <Badge variant="outline" className={`text-xs ${
                  f.category === 'Suppressed' ? 'border-red-300 text-red-600' :
                  f.category === 'Unique' ? 'border-blue-300 text-blue-600' :
                  'border-gray-300'
                }`}>
                  {f.category}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{f.strength.toFixed(1)}</div>
                <Chip n={f.dimension} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TypeNarrative({ typeCode }:{ typeCode:string }){
  const kb = TYPE_KB[typeCode]; 
  const prismType = prismTypes.find(t => t.code === typeCode);
  
  if(!kb || !prismType) return null;
  
  return (
    <section className="p-5 border rounded-2xl bg-card">
      <h3 className="text-xl font-bold mb-3">{typeCode} - {prismType.publicArchetype}</h3>
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
  console.log('🔵 MetaInfo component called with profile validity data:', {
    hasValidity: !!p.validity,
    validity: p.validity,
    inconsistency: p.validity?.inconsistency,
    sd_index: p.validity?.sd_index,
    validityStatus: p.validity_status,
    confidence: p.confidence,
    conf_band: p.conf_band
  });

  const validityColor = p.validity_status === "pass" ? "text-green-600" :
                       p.validity_status === "warning" ? "text-orange-600" : "text-red-600";

  const overlay = p.overlay ?? '';
  
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
          <div className="flex items-center gap-2">
            <b>Confidence</b>: 
            <Badge 
              variant={
                (p.conf_band || p.confidence) === 'High' ? 'default' : 
                (p.conf_band || p.confidence) === 'Moderate' ? 'secondary' : 'destructive'
              } 
              className="text-xs px-2 py-1"
            >
              {p.conf_band || p.confidence}
            </Badge>
            {p.conf_calibrated && (
              <InfoTip title="Calibrated Confidence">
                <div className="space-y-1">
                  <p><b>Calibrated Probability:</b> {Math.round((p.conf_calibrated) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">
                    Calibrated from cohort outcomes using isotonic regression; 
                    reflects empirical accuracy for similar profiles.
                  </p>
                  {p.conf_raw && (
                    <p className="text-xs"><b>Raw confidence:</b> {p.conf_raw.toFixed(3)}</p>
                  )}
                </div>
              </InfoTip>
            )}
          </div>
          <div className={validityColor}><b>Validity Status</b>: {p.validity_status || 'pass'}</div>
          <div><b>Fit Band</b>: {p.fit_band || 'Unknown'}</div>
          {p.close_call && <div className="text-orange-600"><b>Close Call</b>: Top-gap = {p.top_gap?.toFixed(1)}</div>}
        </div>
        <div className="space-y-2">
          <div><b>Inconsistency</b>: {
            p.validity?.inconsistency && p.validity.inconsistency > 0 
              ? p.validity.inconsistency.toFixed(2) 
              : p.validity?.inconsistency === 0 
                ? '0 (test/incomplete data)' 
                : 'Not available'
          }</div>
          <div><b>Social desirability</b>: {
            p.validity?.sd_index && p.validity.sd_index > 0 
              ? p.validity.sd_index.toFixed(2) 
              : p.validity?.sd_index === 0 
                ? '0 (test/incomplete data)' 
                : 'Not available'
          }</div>
          {p.fc_answered_ct && <div><b>FC Answered</b>: {p.fc_answered_ct}</div>}
          <div className="flex items-center gap-1">
            <b>Overlay</b>: {overlay}
            <InfoTip title="Overlay ±">
              <div>{GLOSSARY.overlayDetailed.text}</div>
            </InfoTip>
          </div>
        </div>
      </div>
    </section>
  );
}

// Wrapper function to safely render components with error boundaries
function SafeComponent<T extends Record<string, any>>({ 
  component: Component, 
  props, 
  fallbackName 
}: { 
  component: React.ComponentType<T>; 
  props: T; 
  fallbackName: string;
}) {
  try {
    console.log(`🔵 SafeComponent: About to render ${fallbackName} with props:`, props);
    const result = <Component {...props} />;
    console.log(`✅ SafeComponent: Successfully rendered ${fallbackName}`);
    return result;
  } catch (error) {
    console.error(`🔴 SafeComponent Error in ${fallbackName}:`, error);
    console.error(`🔴 SafeComponent Props that caused error:`, props);
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <h3 className="font-semibold text-red-700">Error in {fallbackName}</h3>
        <p className="text-red-600 text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-1 text-red-500">{error instanceof Error ? error.stack : String(error)}</pre>
        </details>
      </div>
    );
  }
}

// ---------- Main export -----------------------------------------------------
export const ResultsV2: React.FC<{ profile: Profile }> = ({ profile: p }) => {
  console.log('🟢 ResultsV2 component rendering with profile:', p);
  console.log('🟢 Profile keys:', p ? Object.keys(p) : 'No profile');
  
  // Early return for missing profile
  if (!p) {
    console.error('🔴 ResultsV2: No profile provided');
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="border rounded-lg p-6 bg-muted">
          <h2 className="text-xl font-bold mb-2 text-destructive">Profile Data Missing</h2>
          <p className="text-muted-foreground">Unable to load assessment results. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
  
  const primary = p.top_types?.[0] || p.type_code;
  const overlay = p.overlay ?? '';
  console.log('🟡 Primary type determined as:', primary);
  console.log('🟡 Available data:', {
    top_types: p.top_types,
    type_code: p.type_code,
    overlay,
    strengths: p.strengths ? Object.keys(p.strengths) : 'Missing',
    blocks: p.blocks ? Object.keys(p.blocks) : 'Missing'
  });
  
  // Early return for missing primary type
  if (!primary) {
    console.error('🔴 ResultsV2: No primary type found', { top_types: p.top_types, type_code: p.type_code });
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="border rounded-lg p-6 bg-muted">
          <h2 className="text-xl font-bold mb-2 text-destructive">Type Classification Error</h2>
          <p className="text-muted-foreground">Unable to determine personality type from results. Please contact support.</p>
        </div>
      </div>
    );
  }
  
  try {
    console.log('🟡 About to render components, profile data check:', {
      hasBlocks: !!p.blocks,
      hasBlocksNorm: !!p.blocks_norm,
      hasDimensions: !!p.dimensions,
      hasStrengths: !!p.strengths,
      hasValidity: !!p.validity,
      hasTypeCode: !!p.type_code,
      primaryType: primary,
      blocksKeys: p.blocks ? Object.keys(p.blocks) : 'No blocks',
      blocksNormKeys: p.blocks_norm ? Object.keys(p.blocks_norm) : 'No blocks_norm',
      dimensionsKeys: p.dimensions ? Object.keys(p.dimensions) : 'No dimensions',
      strengthsKeys: p.strengths ? Object.keys(p.strengths) : 'No strengths',
    });

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SafeComponent component={Top3} props={{ p }} fallbackName="Top3" />
        <SafeComponent component={StateOverlaySection} props={{ overlay }} fallbackName="StateOverlaySection" />
        <SafeComponent component={TypeCoreSection} props={{ typeCode: primary }} fallbackName="TypeCoreSection" />
        <SafeComponent component={TypeNarrative} props={{ typeCode: primary }} fallbackName="TypeNarrative" />
        <SafeComponent component={FunctionsAnalysis} props={{ p }} fallbackName="FunctionsAnalysis" />
        <div className="grid md:grid-cols-2 gap-6">
          <SafeComponent component={Strengths} props={{ p }} fallbackName="Strengths" />
          <SafeComponent component={Dimensions} props={{ p }} fallbackName="Dimensions" />
        </div>
        <SafeComponent component={Blocks} props={{ p }} fallbackName="Blocks" />
        <SafeComponent component={CoreAlignmentSection} props={{ typeCode: primary }} fallbackName="CoreAlignmentSection" />
        <SafeComponent component={MetaInfo} props={{ p }} fallbackName="MetaInfo" />
      </div>
    );
  } catch (error) {
    console.error('🔴 ResultsV2 rendering error:', error);
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="border rounded-lg p-6 bg-muted">
          <h2 className="text-xl font-bold mb-2 text-destructive">Rendering Error</h2>
          <p className="text-muted-foreground">An error occurred while displaying results: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
};