import Header from "@/components/Header";

const FrameworkArchitect = () => {
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
                  <span className="text-white font-bold text-2xl">LII</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Framework Architect</h1>
                  <p className="text-xl text-muted-foreground">Ti–Ne • Systems Theorist</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Builds precise models; explores implications and edge cases.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Framework Architect (LII) leads with Introverted Thinking to build comprehensive, logical systems, supported by Extraverted Intuition to explore all possible implications and edge cases. This type excels at creating robust theoretical frameworks.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Ti (Introverted Thinking)</h3>
                    <p>Creates precise, internally consistent logical frameworks and models. Focuses on accuracy and theoretical completeness.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Ne (Extraverted Intuition)</h3>
                    <p>Explores implications, possibilities, and edge cases within the logical framework, ensuring comprehensive coverage.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Exceptional analytical and theoretical thinking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Creates comprehensive, robust systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Identifies logical inconsistencies quickly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Independent and objective thinker</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May over-analyze and delay decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can seem detached from practical concerns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May struggle with emotional dynamics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears overly critical</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Systems Theorist, the Framework Architect excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Theoretical research and modeling</li>
                  <li>• Systems architecture and design</li>
                  <li>• Academic and scientific research</li>
                  <li>• Policy analysis and development</li>
                  <li>• Quality assurance and logical review</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FrameworkArchitect;