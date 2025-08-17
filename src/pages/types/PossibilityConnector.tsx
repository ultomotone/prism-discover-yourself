import Header from "@/components/Header";

const PossibilityConnector = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="prism-container py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">IEE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Possibility Connector</h1>
                  <p className="text-xl text-muted-foreground">Ne–Fi • Opportunity Catalyst</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Spots emerging fits between people/ideas; champions potential.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Possibility Connector (IEE) combines Extraverted Intuition's ability to see connections and potential with Introverted Feeling's values-based filter. This type excels at identifying meaningful opportunities and championing people's potential.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Ne (Extraverted Intuition)</h3>
                    <p>Sees connections, possibilities, and potential in people and situations. Constantly exploring new opportunities and combinations.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Fi (Introverted Feeling)</h3>
                    <p>Filters opportunities through personal values and care for individuals, championing what feels meaningful and authentic.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Exceptional at seeing people's potential</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Natural connector and networker</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Champions meaningful causes and values</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Creates inclusive and inspiring environments</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May struggle with follow-through</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can be overly optimistic about outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May avoid necessary confrontations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears scattered or unfocused</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As an Opportunity Catalyst, the Possibility Connector excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Talent development and coaching</li>
                  <li>• Innovation and opportunity development</li>
                  <li>• Community building and networking</li>
                  <li>• Creative and artistic pursuits</li>
                  <li>• Social entrepreneurship and advocacy</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PossibilityConnector;