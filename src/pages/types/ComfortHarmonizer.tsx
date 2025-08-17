import Header from "@/components/Header";

const ComfortHarmonizer = () => {
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
                  <span className="text-white font-bold text-2xl">SEI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Comfort Harmonizer</h1>
                  <p className="text-xl text-muted-foreground">Si–Fe • Experiential Caregiver</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Tunes into bodily cues and mood; creates ease for people.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Comfort Harmonizer (SEI) combines Introverted Sensing's awareness of physical comfort and well-being with Extraverted Feeling's attunement to group harmony. This type excels at creating comfortable, peaceful environments where people feel at ease.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Si (Introverted Sensing)</h3>
                    <p>Highly attuned to physical sensations, comfort, and well-being. Creates stable, pleasant environments and routines.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Fe (Extraverted Feeling)</h3>
                    <p>Reads and responds to group emotional dynamics, ensuring everyone feels comfortable and included.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Creates warm, welcoming environments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent at reading people's needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Promotes harmony and reduces conflict</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Reliable and consistent in relationships</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May avoid necessary confrontations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can resist change and new challenges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May prioritize harmony over progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears passive or indecisive</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As an Experiential Caregiver, the Comfort Harmonizer excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Healthcare and wellness services</li>
                  <li>• Human resources and employee relations</li>
                  <li>• Hospitality and customer service</li>
                  <li>• Therapeutic and counseling roles</li>
                  <li>• Team support and coordination</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComfortHarmonizer;