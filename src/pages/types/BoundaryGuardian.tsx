import Header from "@/components/Header";

const BoundaryGuardian = () => {
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
                  <span className="text-white font-bold text-2xl">ESI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Boundary Guardian</h1>
                  <p className="text-xl text-muted-foreground">Fi–Se • Values Enforcer</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Stands for principles; keeps lines clear in the moment.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Boundary Guardian (ESI) combines Introverted Feeling's strong personal values with Extraverted Sensing's immediate action. This type excels at upholding principles and maintaining clear boundaries in real-time situations.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Fi (Introverted Feeling)</h3>
                    <p>Maintains strong personal values and principles, creating clear internal frameworks for what is right and wrong.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Se (Extraverted Sensing)</h3>
                    <p>Takes immediate action to enforce values and boundaries, responding decisively when principles are challenged.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Strong moral compass and integrity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent at maintaining boundaries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Protective of others' rights and dignity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Decisive action when values are threatened</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May be rigid or judgmental</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can struggle with compromise</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May resist new perspectives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears confrontational</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Values Enforcer, the Boundary Guardian excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Ethics and compliance oversight</li>
                  <li>• Advocacy and social justice work</li>
                  <li>• Security and protective services</li>
                  <li>• Quality control and standards enforcement</li>
                  <li>• Customer advocacy and protection</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BoundaryGuardian;