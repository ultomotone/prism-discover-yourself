import Header from "@/components/Header";

const AtmosphereHost = () => {
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
                  <span className="text-white font-bold text-2xl">ESE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Atmosphere Host</h1>
                  <p className="text-xl text-muted-foreground">Fe–Si • Social Facilitator</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Lifts group affect; organizes experiences that feel good.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Atmosphere Host (ESE) leads with Extraverted Feeling to create positive group dynamics, supported by Introverted Sensing to organize comfortable, enjoyable experiences. This type excels at bringing people together and ensuring everyone has a good time.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Fe (Extraverted Feeling)</h3>
                    <p>Actively manages group emotions and atmosphere, creating positive, inclusive environments where everyone feels valued.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Si (Introverted Sensing)</h3>
                    <p>Draws on past experiences to create pleasant, comfortable experiences and traditions that bring people together.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Natural leader in social situations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent at organizing events and gatherings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Creates inclusive, welcoming environments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Highly empathetic and supportive</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May take on too much responsibility for others</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can be overwhelmed by negative emotions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May struggle with objective analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes neglects own needs for others</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Social Facilitator, the Atmosphere Host excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Event planning and coordination</li>
                  <li>• Community outreach and engagement</li>
                  <li>• Training and development</li>
                  <li>• Public relations and communications</li>
                  <li>• Team leadership and culture building</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AtmosphereHost;