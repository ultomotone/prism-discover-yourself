import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { CoreTypesCompatibilityMatrix } from "@/components/relational/CoreTypesCompatibilityMatrix";
import { CORE_BASELINE_MATRIX, CORE_BASELINE } from "@/data/coreBaseline";
import ComprehensiveDriftDemo from "./components/ComprehensiveDriftDemo";
import PairReportMini from "./components/PairReportMini";
import MicroLessonsAccordion from "./components/learning/MicroLessonsAccordion";
import QuickSelfCheck from "./components/learning/QuickSelfCheck";
import TinyHabitsTabs from "./components/learning/TinyHabitsTabs";
import ConversationScripts from "./components/learning/ConversationScripts";
import RolePlayAccordion from "./components/learning/RolePlayAccordion";
import MiniCourseChecklist from "./components/learning/MiniCourseChecklist";
import ContextToggleExamples from "./components/learning/ContextToggleExamples";
import MythFactRows from "./components/learning/MythFactRows";
import ReflectionPrompts from "./components/learning/ReflectionPrompts";
import InlineGlossary from "./components/learning/InlineGlossary";
import DebriefBanner from "./components/learning/DebriefBanner";

const toc = [
  { id: "overview", label: "Overview" },
  { id: "tldr", label: "Quick TL;DR" },
  { id: "supply-demand", label: "Supply ↔ Demand" },
  { id: "regulation", label: "Base Regulation" },
  { id: "core", label: "Core Alignment" },
  { id: "drift", label: "Drift: Temporary Orientations" },
  { id: "traits", label: "Trait Nudges (Big Five)" },
  { id: "learn", label: "Learn & Practice" },
  { id: "visuals", label: "Visuals" },
  { id: "how", label: "How the Fit Score Works" },
  { id: "examples", label: "Examples" },
  { id: "debrief", label: "Compatibility Debrief" },
  { id: "faqs", label: "FAQs" }
];

export default function RelationalFitPage() {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Helmet 
        title="PRISM Relational Fit"
        meta={[
          {
            name: "description",
            content: "See how your natural style, current regulation, and what you supply vs. need add up to everyday chemistry."
          }
        ]}
      />
      <Header />

      {/* Hero */}
      <section className="bg-background py-12 pt-24 text-center">
        <h1 className="mb-4 text-4xl font-bold">Relational Fit = Need‑meeting in real life</h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-muted-foreground">
          See how your natural style, current regulation, and what you supply vs. need add up to everyday chemistry.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <a href="/relational-fit" aria-label="Launch Interactive Tool">
              Launch Interactive Tool
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/relational-fit/heatmap" aria-label="View Detailed Heatmap">
              View Detailed Heatmap
            </a>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          PRISM builds on classic type relations by weighting real‑world states and a simple supply↔demand balance.
        </p>
      </section>

      {/* Main content with ToC */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <button
          className="mb-4 rounded border px-3 py-2 text-sm lg:hidden"
          onClick={() => setTocOpen((o) => !o)}
          aria-expanded={tocOpen}
          aria-controls="toc-nav"
        >
          Contents
        </button>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px,1fr]">
          <nav
            id="toc-nav"
            className={`${tocOpen ? "block" : "hidden"} lg:block lg:sticky lg:top-20 h-fit border rounded-2xl p-4 bg-white/70 backdrop-blur`}
          >
            <div className="mb-2 text-sm font-semibold">On this page</div>
            <ul className="space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-12">
            {/* Overview */}
            <section id="overview">
              <h2 className="mb-2 text-xl font-semibold">Overview</h2>
              <p>
                PRISM Relational Fit gauges how two people connect by layering Core Alignment, Base Regulation,
                Supply↔Demand, and light Trait Nudges. We turn that into a simple band—Supportive, Stretch, or Friction—plus
                two tiny habits you can use this week.
              </p>
            </section>

            {/* TL;DR */}
            <section id="tldr">
              <h2 className="mb-2 text-xl font-semibold">Quick TL;DR</h2>
              <p>Three levers drive fit:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Core match: some pairs start easier than others.</li>
                <li>Base regulation: more calm time → more patience and better listening.</li>
                <li>
                  Supply↔Demand (the big one): your strengths meeting their needs (and vice versa).
                </li>
              </ul>
              <p className="mt-2">
                We highlight Supply↔Demand because it explains why non‑ideal type matches can feel great—or "textbook" pairs
                can struggle.
              </p>
            </section>

            {/* Supply Demand */}
            <section id="supply-demand">
              <h2 className="mb-2 text-xl font-semibold">Supply ↔ Demand (front and center)</h2>
              <p>
                Think of your relationship as a tiny economy.
              </p>
              <p className="mt-2">
                Supply = what you give easily and consistently (without draining yourself)
              </p>
              <p>
                Demand = what you reliably value and ask for (explicitly or implicitly)
              </p>
              <p>Good fit = your supply covers their demand, and their supply covers yours</p>
              <p className="mt-2">We map five role lanes:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Structure / Clarity — planning, decisions, expectations</li>
                <li>Care / Boundaries — empathy, values, conflict limits</li>
                <li>Energy / Initiation — momentum, push, follow‑through</li>
                <li>Sensing / Timing — tempo, comfort, practicality</li>
                <li>Insight / Meaning — patterns, why, shared narrative</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span>Lane status:</span>
                <Badge className="bg-rf-supportive text-white">🟩 supply meets demand</Badge>
                <Badge className="bg-rf-stretch text-white">🟨 partial</Badge>
                <Badge className="bg-rf-friction text-white">🟥 unmet/misaligned</Badge>
              </div>
              <Card className="mt-4 bg-muted/40 p-4 text-sm">
                Supply↔Demand is heavily weighted in the overall score.
              </Card>
              <p className="mt-2 text-sm text-muted-foreground">
                <span role="img" aria-label="hint">
                  💡
                </span>{" "}
                <span className="ml-1">Green lanes are your relationship cash‑flow.</span>
              </p>
            </section>

            {/* Regulation */}
            <section id="regulation">
              <h2 className="mb-2 text-xl font-semibold">Base Regulation (Calm / Neutral / Stressed)</h2>
              <p>People oscillate between states. We track the mix you're usually in:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Calm (Reg+) — well‑regulated; more bandwidth and generosity</li>
                <li>Neutral (Reg0) — steady baseline</li>
                <li>Stressed (Reg−) — reactive; supply shrinks, demand rises</li>
              </ul>
              <p className="mt-2">
                Plain rule: more Calm/Neutral overlap → higher fit. Stressed×Stressed time → more friction. We measure your
                overlap by context (Flow, Performative, Stress).
              </p>
            </section>

            {/* Core */}
            <section id="core">
              <h2 className="mb-2 text-xl font-semibold">Core Alignment (baseline)</h2>
              <p>
                Your underlying type styles can be complementary, adjacent, or opposed. Core alignment is where you start, not
                where you must end.
              </p>
            </section>

            {/* Drift */}
            <section id="drift">
              <h2 className="mb-2 text-xl font-semibold">Drift: Temporary Orientations</h2>
              <p>
                You have a core type (e.g., LIE) but also drift into temporary orientations that resemble other types (e.g., ILI,
                LSI)—especially across contexts like Flow, Performative, or Stress. Drift matters because lane coverage shifts
                with it, and because partners may not drift in overlapping directions at the same time.
              </p>
              <p className="mt-2">
                Why "duals" can still clash: if both partners drift away from overlapping orientations—or meet mostly in
                Stress—the trade balance goes negative even when the baseline match is "ideal."
              </p>
              <div className="mt-4">
                <ComprehensiveDriftDemo />
              </div>
            </section>

            {/* Traits */}
            <section id="traits">
              <h2 className="mb-2 text-xl font-semibold">Trait Nudges (Big Five)</h2>
              <p>
                Traits like Agreeableness and Conscientiousness gently lift fit; high Neuroticism lowers it. These are small dials,
                not destiny.
              </p>
            </section>

            {/* Learn & Practice */}
            <section id="learn" className="space-y-10">
              <header>
                <h2 className="text-xl font-semibold">Learn & Practice</h2>
                <p className="text-muted-foreground">Short lessons and ready-to-use exercises—no charts, just clarity.</p>
              </header>

              <MicroLessonsAccordion />
              <QuickSelfCheck />
              <TinyHabitsTabs />
              <ConversationScripts />
              <RolePlayAccordion />
              <MiniCourseChecklist />
              <ContextToggleExamples />
              <MythFactRows />
              <ReflectionPrompts />
              <InlineGlossary />
              <DebriefBanner />
            </section>

            {/* Visuals */}
            <section id="visuals">
              <h2 className="mb-4 text-xl font-semibold">Visuals</h2>
              <div className="space-y-8">
                <div>
                  <CoreTypesCompatibilityMatrix matrix={CORE_BASELINE_MATRIX} map={CORE_BASELINE} />
                  <div className="mt-6 text-center">
                    <Button asChild variant="outline" size="lg">
                      <a href="/relational-fit/heatmap" aria-label="View Detailed Heatmap">
                        View Detailed Interactive Heatmap
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
                <PairReportMini />
              </div>
            </section>

            {/* How it works */}
            <section id="how">
              <h2 className="mb-2 text-xl font-semibold">How the Fit Score Works</h2>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-mono text-sm mb-3">
                  Fit = 0.5×(Supply↔Demand) + 0.35×(Core × Regulation) + 0.15×(Drift overlap)
                </p>
                <ul className="space-y-2 text-sm">
                  <li><strong>Supply↔Demand:</strong> How completely each partner's supply covers the other's demand across five lanes</li>
                  <li><strong>Core × Regulation:</strong> Baseline alignment scaled by Calm/Neutral vs. Stressed overlap</li>
                  <li><strong>Drift overlap:</strong> How often temporary orientations meet in compatible zones</li>
                  <li><strong>Traits:</strong> Small final nudges from Big Five patterns</li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">
                  Output: 🟩/🟨/🟥 band + what's working + watch-outs + two tiny habits
                </p>
              </div>
            </section>

            {/* Examples */}
            <section id="examples">
              <h2 className="mb-2 text-xl font-semibold">Examples</h2>
              <div className="space-y-4">
                <Card className="p-4 border-green-200 bg-green-50/50">
                  <p className="font-semibold text-green-800 mb-2">🟩 Supportive: Close to Dual & Well-regulated</p>
                  <p className="text-sm mb-2">Strong lane coverage (4 greens), Calm/Neutral dominant.</p>
                  <p className="text-sm"><strong>Tiny Habits:</strong> 15-min weekly pacing sync; use a "pause word" for values friction.</p>
                </Card>
                
                <Card className="p-4 border-yellow-200 bg-yellow-50/50">
                  <p className="font-semibold text-yellow-800 mb-2">🟨 Stretch: Great Core, Weak Lane Coverage</p>
                  <p className="text-sm mb-2">Missing Care/Boundaries and Timing; Stressed overlap is common.</p>
                  <p className="text-sm"><strong>Tiny Habits:</strong> Time-box emotional labor; end-of-day handoff ritual.</p>
                </Card>
              </div>
            </section>

            {/* Debrief */}
            <section id="debrief" className="text-center">
              <h2 className="mb-2 text-xl font-semibold">Compatibility Debrief</h2>
              <p className="mb-4">
                Want a personalized breakdown? Book a 1-on-1 Compatibility Debrief—we'll walk through your lanes, state mix, and
                drift map, and set two tiny habits you can use this week.
              </p>
              <Button asChild size="lg" className="mx-auto">
                <a href="/book/compatibility-debrief" aria-label="Book Compatibility Debrief">
                  Book a Compatibility Debrief
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </section>

            {/* FAQs */}
            <section id="faqs">
              <h2 className="mb-4 text-xl font-semibold">FAQs</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Does this replace classic intertype relations?</h4>
                  <p className="text-sm text-muted-foreground">No—PRISM builds on them and adds regulation and lane coverage for day-to-day accuracy.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Why emphasize Supply↔Demand?</h4>
                  <p className="text-sm text-muted-foreground">It's the best proxy for how supported people feel most days.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Can a red lane improve?</h4>
                  <p className="text-sm text-muted-foreground">Yes—through rituals, boundaries, or targeted role swaps.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Is stress a deal-breaker?</h4>
                  <p className="text-sm text-muted-foreground">No—recover capacity first, then tackle big decisions.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}