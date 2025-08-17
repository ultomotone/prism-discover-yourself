import TypeLayout from "@/components/TypeLayout";

const IdeaCatalyst = () => {
  return (
    <TypeLayout>
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
              <p className="text-lg text-foreground">Restless option-finder who prototypes possibilities, stress-tests them with clean logic, and kicks off experiments.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Restless option-finder who prototypes possibilities, stress-tests them with clean logic, and kicks off experiments. Thrives where novelty, hypotheses, and rapid reframes are needed. In PRISM you typically see high Ne Strength, 3–4D Ne, 3D Ti, weak Fi/Si execution comfort, and Top-2 neighbors of LII or SEI.
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
                        <td className="p-4">Spots patterns/anomalies fast; generates multiple workable angles; pivots easily.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3D (adaptive)</td>
                        <td className="p-4">Clarifies terms/assumptions; trims contradictions; builds minimal, elegant rules.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2D (routine)</td>
                        <td className="p-4">Wants positive tone but "turns it on" in bursts; learns group cues by practice.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D (emerging → routine)</td>
                        <td className="p-4">Craves stable routines/comfort but underbuilds them alone; benefits from guides.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Background (demonstrative)</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Quietly pulls data/process know-how when cornered; not an identity driver.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Background (ignoring)</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Can foresee trajectories but downplays "single path" focus; prefers branching.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can assert briefly (deadline pushes, demos) but doesn't enjoy prolonged force.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Struggles with unspoken personal boundaries/loyalties; misreads "it's about us."</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note (mapping only):</strong> Classic Model A for ILE is Ne–Ti | Se–Fi | Si–Fe | Ni–Te (1→8). PRISM preserves positions but measures Strength and 1D–4D continuously.
                </p>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span>Reference: </span>
                  <a href="https://sedecology.com" target="_blank" rel="noopener" className="text-primary hover:underline">sedecology.com</a>
                </div>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Ne, Ti) leads; Instinctive Self (Ni, Te) quietly stabilizes with "just enough" forecasting/metrics.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Se, Fi) hijacks—either abrupt pushing (Se) or awkward personalization (Fi). Hidden Potential (Si, Fe) seeks comfort/affect but wobbles.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with ILE)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Give problem constraints, let them riff 2–3 options</li>
                      <li>• Co-define a "good enough" rule</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Rigid single-path plans without sandbox time</li>
                      <li>• Guilt-tripping appeals to loyalty</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7-Day Practice */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7-Day Micro-Practice</h2>
                <div className="space-y-4">
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D1 (Ti trim)</h3>
                    <p>Rewrite one process in ≤5 rules.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Si anchor)</h3>
                    <p>Fix a 10-minute daily recovery ritual.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Fe rep)</h3>
                    <p>Open a meeting with one emotion-label + ask.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Te gate)</h3>
                    <p>Add a KPI stop/go to one idea.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Ni lane)</h3>
                    <p>10-line "if we don't pivot" consequence sketch.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6 (Se edge)</h3>
                    <p>One clean, time-boxed assertive ask.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D7 (Ne funnel)</h3>
                    <p>Kill two ideas to ship one.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ILE vs. LII</h3>
                    <p>Both logical; ILE ideates first, codifies second (Ne→Ti). LII formalizes first, explores variants later (Ti→Ne).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ILE vs. ENTP-lookalikes</h3>
                    <p>PRISM ipsatives separate showy Fe from true Ne–Ti rule-making.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ILE vs. SEI</h3>
                    <p>Duals—SEI optimizes comfort & tone now; ILE optimizes options & logic rules.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>ILE⁺</strong> = faster pivots, edgy humor, impatience for closure. <strong>ILE⁻</strong> = calmer pacing, tidier follow-through.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default IdeaCatalyst;