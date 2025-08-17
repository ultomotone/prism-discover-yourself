import TypeLayout from "@/components/TypeLayout";

const SystemsMarshal = () => {
  return (
    <TypeLayout>
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
              <p className="text-lg text-foreground">Rule-first executor who clarifies standards, enforces them fairly, and acts at the right moment.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Rule-first executor who clarifies standards, enforces them fairly, and acts at the right moment. Thrives where consistent structure and real-world compliance matter. In PRISM you typically see high Ti Strength, 3–4D Ti, 3–4D Se, Ne PoLR (1D), and Top-2 neighbors of EIE or SLE.
                  </p>
                </div>
              </section>

              {/* Function Matrix */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Function Matrix (Strength × Dimensionality)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border border-border rounded-lg overflow-hidden">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 font-semibold">Element</th>
                        <th className="text-left p-4 font-semibold">Typical Strength</th>
                        <th className="text-left p-4 font-semibold">Dimensionality</th>
                        <th className="text-left p-4 font-semibold">What it looks like day-to-day</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D (adaptive → portable)</td>
                        <td className="p-4">Builds precise schemas; removes contradictions; keeps governance clean.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Applies timely pressure; protects boundaries; executes decisively when criteria are met.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Seeks help with long-arc timing and contingency mapping.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Practices visible warmth to support cohesion; can feel effortful.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Knows metrics/process but defers to internally coherent rules over raw KPI chase.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Maintains stable routines and physical readiness, often quietly.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can "do courtesy/boundaries" formally; avoids messy sentiment debates.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes scatter and open-ended ideation; prefers proven avenues.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note (mapping only):</strong> Classic Model A for LSI is Ti–Se | Fi–Ne | Te–Si | Fe–Ni (1→8). PRISM keeps positions; Strength and 1D–4D are continuous.
                </p>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Ti, Se) leads; Instinctive Self (Te, Si) quietly supplies throughput and steadiness.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Fi, Ne) hijacks—stiff politeness or anxious what-ifs; Hidden Potential (Fe, Ni) flickers between forced pep and over-forecasting.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with LSI)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Define terms, roles, and enforcement paths</li>
                      <li>• Present one vetted option with criteria met</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Fuzzy requests, last-minute pivots</li>
                      <li>• Brainstorming for its own sake</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7-Day Practice */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7-Day Micro-Practice</h2>
                <div className="space-y-4">
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D1 (Fe rep)</h3>
                    <p>Start one meeting with a human check-in + goal statement.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Ni peek)</h3>
                    <p>10-minute "branching risks" sketch (best/base/worst).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Se hygiene)</h3>
                    <p>One clear boundary set early, not after frustration builds.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Te gate)</h3>
                    <p>Add a single performance metric that serves the rule, not replaces it.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Si restore)</h3>
                    <p>Micro-routine to reset between enforcement tasks.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Ti tidy)</h3>
                    <p>Retire one outdated rule; publish the updated version.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LSI vs. LSE</h3>
                    <p>Both structured; LSI optimizes coherence & enforcement (Ti–Se). LSE optimizes throughput & scheduling (Te–Si).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LSI vs. ISTJ-lookalikes</h3>
                    <p>PRISM scenarios split internal-logic governance (Ti) from policy/metric stewardship (Te).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LSI vs. SLE</h3>
                    <p>Both force-capable; SLE pushes outcomes first (Se→Ti), LSI codifies then applies force (Ti→Se).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>LSI⁺</strong> = sharper tone, quicker clamp-downs; watch Fi rigidity. <strong>LSI⁻</strong> = calmer enforcement, more patient coaching.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default SystemsMarshal;