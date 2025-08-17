import Header from "@/components/Header";

const IntegrityGuide = () => {
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
                  <span className="text-white font-bold text-2xl">EII</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Integrity Guide</h1>
                  <p className="text-xl text-muted-foreground">Fi–Ne • Ethics Consultant</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Orients by values, then explores humane options.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Integrity Guide (EII) combines Introverted Feeling's strong value system with Extraverted Intuition's exploration of possibilities. This type excels at maintaining ethical standards while finding creative, humane solutions to complex problems.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Fi (Introverted Feeling)</h3>
                    <p>Maintains strong personal values and ethical principles, creating a moral compass that guides decisions and actions.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Ne (Extraverted Intuition)</h3>
                    <p>Explores possibilities and options that align with values, finding creative ways to honor principles while solving problems.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Strong ethical foundation and integrity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Creative problem-solving with human focus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent at seeing multiple perspectives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Natural counselor and advisor</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May be overly idealistic or perfectionist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can struggle with pragmatic compromises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May avoid necessary but unpleasant decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears indecisive or passive</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As an Ethics Consultant, the Integrity Guide excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Ethics consulting and compliance</li>
                  <li>• Counseling and therapeutic services</li>
                  <li>• Social work and advocacy</li>
                  <li>• Creative writing and journalism</li>
                  <li>• Non-profit leadership and development</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntegrityGuide;