import Header from "@/components/Header";

const SystemsMarshal = () => {
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
                  <span className="text-white font-bold text-2xl">LSI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Systems Marshal</h1>
                  <p className="text-xl text-muted-foreground">Ti–Se • Compliance Architect</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Codifies rules and applies firm, timely execution.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Systems Marshal (LSI) combines Introverted Thinking's logical structure with Extraverted Sensing's decisive implementation. This type excels at creating systematic approaches and ensuring they are executed with precision and authority.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Ti (Introverted Thinking)</h3>
                    <p>Creates systematic, logical frameworks and rules. Focuses on consistency, accuracy, and proper procedures.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Se (Extraverted Sensing)</h3>
                    <p>Ensures systems are implemented decisively and efficiently, with attention to real-world results and compliance.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent at establishing clear procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Ensures consistent quality and standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Strong enforcement and compliance skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Reliable and systematic in approach</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May be inflexible with established procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can seem rigid or authoritarian</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May struggle with interpersonal dynamics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes resists necessary changes</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Compliance Architect, the Systems Marshal excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Quality assurance and compliance management</li>
                  <li>• Process improvement and standardization</li>
                  <li>• Regulatory affairs and audit functions</li>
                  <li>• Operations management and supervision</li>
                  <li>• Legal and administrative roles</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SystemsMarshal;