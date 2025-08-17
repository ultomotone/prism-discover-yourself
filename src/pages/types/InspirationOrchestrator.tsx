import Header from "@/components/Header";

const InspirationOrchestrator = () => {
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
                  <span className="text-white font-bold text-2xl">EIE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Inspiration Orchestrator</h1>
                  <p className="text-xl text-muted-foreground">Fe–Ni • Change Mobilizer</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Rallies emotion around a compelling future narrative.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Inspiration Orchestrator (EIE) combines Extraverted Feeling's ability to mobilize people emotionally with Introverted Intuition's visionary insights. This type excels at creating compelling narratives that inspire others toward meaningful change.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Fe (Extraverted Feeling)</h3>
                    <p>Mobilizes groups through emotional connection and shared purpose, creating unity around common goals and values.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Ni (Introverted Intuition)</h3>
                    <p>Provides visionary insights and future-focused narratives that give direction and meaning to group efforts.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Natural leadership and inspirational ability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent at motivating teams toward goals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Creates compelling visions and narratives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Strong emotional intelligence and charisma</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May be overly dramatic or intense</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can neglect practical implementation details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May be impatient with systematic processes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears manipulative or pushy</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Change Mobilizer, the Inspiration Orchestrator excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Organizational change and transformation</li>
                  <li>• Public speaking and advocacy</li>
                  <li>• Marketing and brand storytelling</li>
                  <li>• Executive leadership and vision setting</li>
                  <li>• Social movement and cause leadership</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InspirationOrchestrator;