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
              <p className="text-lg text-foreground">Quiet fixer who notices wear-and-tear, streamlines workflows, and delivers durable results.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Quiet fixer who notices wear-and-tear, streamlines workflows, and delivers durable results. Thrives where pacing, quality, and hands-on efficiency matter. In PRISM you typically see high Si Strength, 3–4D Si, 3–4D Te, weak Fe (PoLR), and Top-2 neighbors of SEI or LSE.
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
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D (adaptive → portable)</td>
                        <td className="p-4">Tunes comfort/pace precisely; prevents drift; keeps systems reliable.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Converts fixes into SOPs; iterates by evidence; chooses lean tools.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can speak timing/trajectories briefly; tires of long hypotheticals.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes performative emotion; awkward in high-affect settings.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Suggestive</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Enjoys gentle novelty via trusted guides; avoids scatter for its own sake.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Mobilizing</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Works on stating boundaries kindly; values steady, loyal ties.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Keeps internal logic tidy but won't debate abstractions for long.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Surprising firmness when needed; acts decisively, then powers down.</td>
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
                    <p>Core Drive (Si, Te) leads; Instinctive Self (Ti, Se) quietly provides crisp rules and timely push.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Ni, Fe) hijacks—worrying about "the future vibe"; Hidden Potential (Ne, Fi) seeks novelty/support yet wobbles.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with SLI)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Show the defect, the metric, and the simplest fix</li>
                      <li>• Agree on pace and standards</li>
                      <li>• Let them implement</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Hypey rallies</li>
                      <li>• Last-minute pivots</li>
                      <li>• Emotional pressure in place of facts</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7-Day Practice */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7-Day Micro-Practice</h2>
                <div className="space-y-4">
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D1 (Fi rep)</h3>
                    <p>State one boundary in behavioral terms ("When X, I'll do Y").</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Ne spark)</h3>
                    <p>Try one low-risk novelty inside a safe routine.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Fe hygiene)</h3>
                    <p>One calm "no + alternative" in a social ask.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Ni peek)</h3>
                    <p>10-min horizon note (30/90/180-day wear points).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Te loop)</h3>
                    <p>Add a metric → action trigger to one task.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Si restore)</h3>
                    <p>Sleep/light/nutrition tune-up; adjust one habit.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SLI vs. LSE</h3>
                    <p>Both Te–Si. SLI optimizes comfort & hands-on fixes; LSE optimizes throughput & scheduling.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SLI vs. SEI</h3>
                    <p>Both Si-valuing. SLI codifies into lean processes (Te); SEI focuses on atmosphere/people flow (Fe).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SLI vs. ISTJ-lookalikes</h3>
                    <p>PRISM scenarios separate Si–Te tinkering/efficiency from Si–Te policy enforcement cultures.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>SLI⁺</strong> = shorter patience for sloppy hand-offs; sharper "no." <strong>SLI⁻</strong> = steadier tone, more coaching before escalation.</p>
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

export default PracticalOptimizer;