import Header from "@/components/Header";

const PracticalOptimizer = () => {
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
                  <span className="text-white font-bold text-2xl">SLI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Practical Optimizer</h1>
                  <p className="text-xl text-muted-foreground">Si–Te • Hands-on Engineer</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Improves comfort and efficiency with tangible fixes.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Practical Optimizer (SLI) combines Introverted Sensing's awareness of comfort and efficiency with Extraverted Thinking's focus on practical results. This type excels at making tangible improvements that enhance both comfort and functionality.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Si (Introverted Sensing)</h3>
                    <p>Highly attuned to comfort, efficiency, and practical needs. Notices what works well and what could be improved.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Te (Extraverted Thinking)</h3>
                    <p>Implements practical solutions and improvements, focusing on tangible results and measurable enhancements.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent at identifying practical improvements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Strong hands-on problem-solving skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Creates comfortable, efficient environments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Reliable and methodical in approach</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May resist dramatic changes or innovation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can be slow to make decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May struggle with interpersonal dynamics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears unambitious or complacent</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Hands-on Engineer, the Practical Optimizer excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Engineering and technical problem-solving</li>
                  <li>• Process improvement and optimization</li>
                  <li>• Quality assurance and testing</li>
                  <li>• Facilities management and maintenance</li>
                  <li>• Product development and refinement</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PracticalOptimizer;