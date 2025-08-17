import Header from "@/components/Header";

const VisionMuse = () => {
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
                  <span className="text-white font-bold text-2xl">IEI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Vision Muse</h1>
                  <p className="text-xl text-muted-foreground">Ni–Fe • Narrative Futurist</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Senses trajectories and evokes meaning through tone.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Vision Muse (IEI) combines Introverted Intuition's deep pattern recognition with Extraverted Feeling's ability to inspire and connect emotionally. This type excels at sensing future possibilities and communicating them in ways that resonate with others.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Ni (Introverted Intuition)</h3>
                    <p>Sees deep patterns and future trajectories, synthesizing complex information into unified insights and visions.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Fe (Extraverted Feeling)</h3>
                    <p>Communicates insights through emotional tone and narrative, inspiring others with compelling visions of the future.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Exceptional at seeing long-term patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Creates inspiring and meaningful narratives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Deeply empathetic and emotionally intelligent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Natural talent for artistic expression</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May struggle with practical implementation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can be overwhelmed by too many options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May avoid confrontation and difficult decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears dreamy or impractical</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Narrative Futurist, the Vision Muse excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Creative writing and storytelling</li>
                  <li>• Strategic visioning and future planning</li>
                  <li>• Coaching and personal development</li>
                  <li>• Artistic and cultural endeavors</li>
                  <li>• Inspirational speaking and communication</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisionMuse;