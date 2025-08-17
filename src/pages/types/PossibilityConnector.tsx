import Header from "@/components/Header";

const PossibilityConnector = () => {
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
                  <span className="text-white font-bold text-2xl">IEE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Possibility Connector</h1>
                  <p className="text-xl text-muted-foreground">Ne–Fi • Opportunity Catalyst</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Warm scout who spots emerging fits between people and ideas, reframes impasses, and champions potential.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Warm scout who spots emerging fits between people and ideas, reframes impasses, and champions potential. Thrives where options, relationships, and humane change matter. In PRISM you typically see high Ne Strength, 3–4D Ne, 3–4D Fi, weak Ti (PoLR), and Top-2 neighbors of EII or SLI.
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
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D (adaptive → portable)</td>
                        <td className="p-4">Surfaces options quickly; reframes stalemates; tracks weak signals.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Reads sincerity/boundaries; advocates for congruent choices.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Mobilizing</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Learns to ground ideas in simple KPIs/steps; risks over-hustle without it.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Suggestive</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Craves sustainable routines/pace support; benefits from comfort scaffolds.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Quiet long-arc sense; can time moves but doesn't foreground it.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Reads group mood yet prefers sincerity to performance.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Mobilizing (alt)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Practices clean asks and timely pushes; developing assertiveness.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes rigid taxonomies/"gotcha" logic; prefers lived coherence.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Ne, Fi) leads; Instinctive Self (Ni, Fe) quietly supplies timing and light social smoothing.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Te, Ti) hijacks—sudden KPI policing or brittle logic fights; Hidden Potential (Si, Se) seeks comfort/force but wobbles.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with IEE)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Share the value at stake</li>
                      <li>• Invite 2–3 options, then co-pick one</li>
                      <li>• Provide simple metric and first step</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Boxing into rigid categories</li>
                      <li>• Comfort-blind urgency</li>
                      <li>• Debating abstractions for sport</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7-Day Practice */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7-Day Micro-Practice</h2>
                <div className="space-y-4">
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D1 (Te bite)</h3>
                    <p>Add a single "done = …" metric to one idea.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Si anchor)</h3>
                    <p>Install a 10-min daily recovery ritual.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Se step)</h3>
                    <p>One clean, time-boxed assertive ask.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Ni refine)</h3>
                    <p>10-line arc (now → near → far) for a favored idea.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Fi care)</h3>
                    <p>Name one person's need and meet it concretely.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Ne funnel)</h3>
                    <p>Generate 3 options; retire 2; commit to 1.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">IEE vs. EII</h3>
                    <p>Both Fi-valuing. IEE scouts options and mobilizes; EII counsels depth and congruence.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">IEE vs. ENFP-lookalikes</h3>
                    <p>PRISM weights ipsatives/scenarios to separate Ne–Fi congruence from high-Fe performance styles.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">IEE vs. SLI</h3>
                    <p>Duals—IEE expands possibilities and people-fit; SLI grounds them in durable systems.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>IEE⁺</strong> = faster pivots, sharper withdrawal from rigid rules. <strong>IEE⁻</strong> = steadier tone, clearer follow-through on one chosen path.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PossibilityConnector;