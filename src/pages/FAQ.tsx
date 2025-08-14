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
      a: "Your information processing style, dimensionality (1D–4D), block dynamics, and a calm/reactive overlay."
    },
    {
      q: "Is PRISM the same as MBTI/Enneagram/Big Five?",
      a: "No. PRISM is compatible with ideas from these systems but uses its own model and methods."
    },
    {
      q: "How long is the assessment?",
      a: "About 25–35 minutes."
    },
    {
      q: "Can I game the test?",
      a: "We use multiple item types and quality checks to reduce bias. Honest answers work best."
    },
    {
      q: "What is the ± overlay?",
      a: "A state indicator of calm/reactive expression that modifies behavior, not core wiring."
    },
    {
      q: "What's dimensionality?",
      a: "A 1D–4D capability lens: from narrow to broadly adaptable and time-savvy."
    },
    {
      q: "What if I'm between two types?",
      a: "We show probabilities and confidence. If it's close, you'll see that."
    },
    {
      q: "How often should I retake PRISM?",
      a: "After major changes or development work, or annually if you're tracking growth."
    },
    {
      q: "Is PRISM a clinical test?",
      a: "No—it's a personal development tool."
    },
    {
      q: "Will you share my data?",
      a: "No personal data is shared. Research is aggregate and anonymized."
    },
    {
      q: "Can teams use PRISM?",
      a: "Yes—there's a team report and workshop."
    },
    {
      q: "Do you offer coaching?",
      a: "Contact us to discuss coaching options and availability."
    },
    {
      q: "Can I get my raw scores?",
      a: "Yes—your report summarizes scales; ask for a raw export if needed."
    },
    {
      q: "How accurate is PRISM?",
      a: "We provide confidence with each result and validity flags."
    },
    {
      q: "Does mood affect results?",
      a: "It can, which is why we capture state and adjust interpretation."
    },
    {
      q: "Is there a free version?",
      a: "You can take the assessment; advanced features/reports may be paid later."
    },
    {
      q: "Can I use PRISM with students?",
      a: "Yes, with appropriate guidance and non-clinical framing."
    },
    {
      q: "Can PRISM change over time?",
      a: "Patterns are stable, but expression and dimensionality can grow."
    },
    {
      q: "How is PRISM scored?",
      a: "Multi-method scales, normalization, and probabilistic type matching."
    },
    {
      q: "Where do I start?",
      a: "Take the assessment and read your one-page plan."
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