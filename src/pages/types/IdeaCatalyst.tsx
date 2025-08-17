import Header from "@/components/Header";

const IdeaCatalyst = () => {
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
                  <span className="text-white font-bold text-2xl">ILE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Idea Catalyst</h1>
                  <p className="text-xl text-muted-foreground">Ne–Ti • Exploratory Analyst</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Generates options and prototypes clean logical frames.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Idea Catalyst (ILE) combines the boundless exploration of Extraverted Intuition with the analytical precision of Introverted Thinking. This type excels at generating multiple possibilities and then organizing them into coherent, logical frameworks.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Ne (Extraverted Intuition)</h3>
                    <p>Constantly scanning for new possibilities, connections, and potential. Thrives on brainstorming and exploring multiple angles.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Ti (Introverted Thinking)</h3>
                    <p>Provides logical structure and analysis to the flood of ideas, creating coherent frameworks and models.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Exceptional at generating creative solutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Quick to see patterns and connections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Adaptable and flexible in thinking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Natural innovator and conceptualizer</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May struggle with routine implementation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can lose interest once the idea is developed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May neglect emotional considerations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears scattered or unfocused</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As an Exploratory Analyst, the Idea Catalyst excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Research and development</li>
                  <li>• Strategic planning and innovation</li>
                  <li>• Consulting and problem-solving</li>
                  <li>• Creative industries and design thinking</li>
                  <li>• Technology and systems analysis</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IdeaCatalyst;