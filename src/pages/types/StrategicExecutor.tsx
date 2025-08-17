import Header from "@/components/Header";

const StrategicExecutor = () => {
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
                  <span className="text-white font-bold text-2xl">LIE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Strategic Executor</h1>
                  <p className="text-xl text-muted-foreground">Te–Ni • Outcome Operator</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Optimizes by metrics; scales processes toward long-range aims.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Strategic Executor (LIE) combines Extraverted Thinking's focus on efficient results with Introverted Intuition's long-term vision. This type excels at creating and implementing strategies that deliver measurable outcomes over time.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Te (Extraverted Thinking)</h3>
                    <p>Focuses on efficiency, metrics, and results. Organizes resources and processes to achieve maximum output and effectiveness.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Ni (Introverted Intuition)</h3>
                    <p>Provides strategic vision and long-term perspective, ensuring efforts are aligned with future objectives.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent strategic planning and execution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Strong focus on results and efficiency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Natural leadership in business contexts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Skilled at scaling and optimizing processes</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May prioritize results over people's needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can be impatient with inefficient processes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May overlook emotional and cultural factors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears cold or impersonal</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As an Outcome Operator, the Strategic Executor excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Executive leadership and strategic management</li>
                  <li>• Business development and growth strategies</li>
                  <li>• Operational excellence and optimization</li>
                  <li>• Consulting and organizational improvement</li>
                  <li>• Entrepreneurship and venture development</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StrategicExecutor;