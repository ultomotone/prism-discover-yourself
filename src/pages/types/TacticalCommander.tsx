import Header from "@/components/Header";

const TacticalCommander = () => {
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
                  <span className="text-white font-bold text-2xl">SLE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Tactical Commander</h1>
                  <p className="text-xl text-muted-foreground">Se–Ti • Field Strategist</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Reads the field and acts decisively; enforces clear logic.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Tactical Commander (SLE) combines Extraverted Sensing's real-time awareness and decisive action with Introverted Thinking's logical analysis. This type excels at reading dynamic situations and implementing clear, logical strategies.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Se (Extraverted Sensing)</h3>
                    <p>Constantly aware of the immediate environment and opportunities. Takes decisive action and adapts quickly to changing conditions.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Ti (Introverted Thinking)</h3>
                    <p>Provides logical framework and analysis to guide actions, ensuring strategies are sound and efficient.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent crisis management and leadership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Quick decision-making under pressure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Practical and results-oriented approach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Strong presence and natural authority</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May be impatient with long-term planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can appear blunt or insensitive</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May overlook emotional considerations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes acts too quickly without full information</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Field Strategist, the Tactical Commander excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Operations and project management</li>
                  <li>• Sales and business development</li>
                  <li>• Emergency response and crisis management</li>
                  <li>• Military and law enforcement</li>
                  <li>• Entrepreneurship and startup leadership</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TacticalCommander;