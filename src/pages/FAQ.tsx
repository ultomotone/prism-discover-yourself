import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      q: "What does PRISM measure?",
      a: "Your information processing style (8 information elements), dimensionality (1D–4D), block dynamics (Core/Critic/Hidden/Instinct), and a light state overlay (±) that explains calm vs. reactive expression."
    },
    {
      q: "Is PRISM the same as MBTI/Enneagram/Big Five?",
      a: "No. PRISM is compatible with ideas from these systems but uses its own model and methods (multi-method measurement, ipsative trade-offs, dimensionality, and confidence-based type calls)."
    },
    {
      q: "How long is the assessment?",
      a: "About 25–35 minutes."
    },
    {
      q: "Can I game the test?",
      a: "We use multiple item types (Likert + forced-choice + scenarios) and quality checks (attention, inconsistency pairs, social desirability, state). Honest, intuitive answers produce the best results."
    },
    {
      q: "What is the ± overlay?",
      a: "A state indicator: \"+\" = more reactive baseline (arousal rises faster under pressure), \"–\" = steadier baseline. It tints expression, not core wiring. We adjust interpretation accordingly."
    },
    {
      q: "What's dimensionality?",
      a: "A capability lens (1D–4D) showing the breadth, portability, and time-awareness of each function: 1D personal/narrow • 2D role/limited • 3D broad/context-aware • 4D expert-level, highly adaptable."
    },
    {
      q: "What if I'm between two types?",
      a: "We show your Top-3 with Fit (0–100) and Share (%), plus an Accuracy band (High/Moderate/Low) that reflects separation from the runner-up and data quality. If it's close, we say so and suggest a short micro-retest."
    },
    {
      q: "How often should I retake PRISM?",
      a: "After major life or role changes, significant development work, or annually if you're tracking growth. We also support micro-retests to clarify close calls."
    },
    {
      q: "Is PRISM a clinical test?",
      a: "No—it's a personal development and team communication tool. It is not a diagnostic instrument and is not for hiring decisions."
    },
    {
      q: "Will you share my data?",
      a: "No. Your personal data is not sold or shared. Research is aggregate and anonymized. Data is stored securely; you can request deletion."
    },
    {
      q: "Can teams use PRISM?",
      a: "Yes. Team reports map cognitive diversity, clarify handoffs, and help navigate stress dynamics. (Not for hiring selection.)"
    },
    {
      q: "Do you offer coaching?",
      a: "Yes—coaching and workshops are available. Contact us for options."
    },
    {
      q: "Can I get my raw scores?",
      a: "Yes. Your report summarizes scales; you can request a raw export (functions, dimensionality, blocks, fit/accuracy metrics)."
    },
    {
      q: "How accurate is PRISM?",
      a: "Each result includes: Fit (0–100) per type (invariant closeness to prototype), Share (%) relative among all 16 types, Accuracy (margin + coherence + quality) with High/Moderate/Low band. Validity flags highlight noisy data."
    },
    {
      q: "Does mood affect results?",
      a: "State matters, which is why we capture stress/mood/sleep/time-pressure/focus and adjust weighting (lean more on forced-choice/scenarios when state is \"hot\")."
    },
    {
      q: "Is there a free version?",
      a: "You can take the assessment; some advanced features/reports may be paid."
    },
    {
      q: "Can I use PRISM with students?",
      a: "Yes, with non-clinical framing and appropriate guidance/consent. Results focus on strengths, learning fit, and communication."
    },
    {
      q: "Can PRISM change over time?",
      a: "Your core pattern tends to be stable. Dimensionality and expression can grow with practice and context; PRISM tracks these changes."
    },
    {
      q: "How is PRISM scored?",
      a: "Multi-method evidence → functional strength (1–5) and dimensionality (1–4), plus forced-choice support and opposite-function penalties. We compute Fit (0–100), Share (%), and an Accuracy index; results are adjusted for state and validity."
    },
    {
      q: "Where do I start?",
      a: "Take the assessment and review your one-page plan in the report. From there, explore your type overview, flow/stress guidance, and next-step practices."
    },
    {
      q: "What do \"type-coherent\", \"unique\", and \"suppressed\" mean?",
      a: "Type-coherent: ≥3D on your Base/Creative functions (native engine). Unique: ≥3D on non-core functions (developed breadth). Suppressed: low usage (strength ≤ ~2.4/5), even if you understand it—often crowded out by stronger tools."
    },
    {
      q: "What's the difference between Fit, Share, and Accuracy?",
      a: "Fit (0–100): invariant closeness to a type's prototype. Share (%): relative weight among all 16 types. Accuracy: how confident we are in the top call vs #2, factoring margin, dimensional coherence, opposite-pressure, and validity."
    },
    {
      q: "What are \"blocks\"?",
      a: "Four functional clusters that reconfigure with context: Core (Base+Creative), Critic (Role+Vulnerable), Hidden (Suggestive+Mobilizing), Instinct (Ignoring+Demonstrative). Your report shows raw and normalized mix."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              Frequently Asked Questions
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about PRISM, how it works, and how to use your results.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="prism-shadow-card">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full p-6 text-left hover:bg-muted/30 prism-transition flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <HelpCircle className="h-5 w-5 text-accent mr-3 flex-shrink-0" />
                      <h3 className="font-semibold text-primary pr-4">{item.q}</h3>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        openItems.includes(index) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openItems.includes(index) && (
                    <div className="px-6 pb-6">
                      <div className="pl-8 border-l-2 border-accent/20">
                        <p className="text-muted-foreground">{item.a}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;