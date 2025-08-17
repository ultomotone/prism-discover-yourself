import Header from "@/components/Header";

const ForesightAnalyst = () => {
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
                  <span className="text-white font-bold text-2xl">ILI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Foresight Analyst</h1>
                  <p className="text-xl text-muted-foreground">Ni–Te • Risk & Signals Analyst</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Models likely futures; recommends efficient bets.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Foresight Analyst (ILI) combines Introverted Intuition's deep pattern recognition with Extraverted Thinking's practical analysis. This type excels at predicting future trends and recommending strategic actions based on likely scenarios.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Ni (Introverted Intuition)</h3>
                    <p>Sees deep patterns and future trajectories, synthesizing complex information to model likely future scenarios.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Te (Extraverted Thinking)</h3>
                    <p>Translates insights into practical recommendations and efficient strategies for achieving objectives.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Exceptional at predicting future trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Strong analytical and strategic thinking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent risk assessment capabilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Independent and objective perspective</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May be overly pessimistic or cautious</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can struggle with immediate action</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May appear detached or aloof</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes overlooks human factors</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Risk & Signals Analyst, the Foresight Analyst excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Strategic planning and forecasting</li>
                  <li>• Risk management and assessment</li>
                  <li>• Investment analysis and research</li>
                  <li>• Technology trend analysis</li>
                  <li>• Policy development and planning</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForesightAnalyst;