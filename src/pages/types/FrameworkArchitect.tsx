import TypeLayout from "@/components/TypeLayout";

const FrameworkArchitect = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">LII</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Framework Architect</h1>
                  <p className="text-xl text-muted-foreground">Ti–Ne • Systems Theorist</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Precision model-builder who clarifies definitions, strips contradictions, and explores clean alternatives.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Precision model-builder who clarifies definitions, strips contradictions, and explores clean alternatives. Thrives where rules, concepts, and edge-case logic matter. In PRISM you typically see high Ti Strength, 3–4D Ti, 3D Ne, low Se (PoLR 1D), Fe/Si valued but developing, and Top-2 neighbors of ILE or ESE.
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
                        <td className="p-4">Builds minimal, elegant schemas; enforces internal coherence; tidies terminology.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Generates plausible variants; tests implications; keeps options logically sound.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Learns sustainable pacing and comfort baselines; benefits from routine scaffolds.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Wants warm, visible rapport; practices tone in small, structured ways.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Background (mobilizing alt.)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Can operationalize logic into steps/metrics when stakes rise.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Quiet long-arc sense; can forecast trajectories but doesn't foreground it.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Detects personal sentiment but deprioritizes "who feels what" vs. correct logic.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes force-on-the-spot; awkward with sudden confrontation or power plays.</td>
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
                    <p>Core Drive (Ti, Ne) leads; Instinctive Self (Ni, Te) quietly adds horizon sense and "good-enough" ops.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Fe, Se) hijacks—performative warmth or brittle push; Hidden Potential (Si, Fe) seeks comfort/rapport but wobbles.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with LII)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Define terms clearly</li>
                      <li>• Present one problem with constraints</li>
                      <li>• Invite two logic-true options</li>
                      <li>• Agree on crisp criteria</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Vibe-only persuasion</li>
                      <li>• Chaotic debates</li>
                      <li>• Forcing real-time confrontation</li>
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
                    <p>Open one meeting with a human check-in + summary.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Si anchor)</h3>
                    <p>Install a 10-minute recovery ritual post-deep work.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Te bite)</h3>
                    <p>Add one "done = …" metric to a current task.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Se edge)</h3>
                    <p>One calm, time-boxed assertive ask.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Ne funnel)</h3>
                    <p>Generate 3 options; retire 2; ship 1.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Ti tidy)</h3>
                    <p>Remove one contradictory rule and publish the simpler version.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LII vs. ILE</h3>
                    <p>Both Alpha NT. LII codifies first (Ti→Ne), ILE ideates first (Ne→Ti).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LII vs. ESE</h3>
                    <p>Duals—LII seeks Fe/Si scaffolding; ESE supplies tone/pace.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LII vs. INTJ-lookalikes</h3>
                    <p>PRISM separates quiet Ni competence (background) from Ni-led identity.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>LII⁺</strong> = sharper critiques, faster shutdown under pushy Se. <strong>LII⁻</strong> = warmer tone, steadier pacing, easier boundary-setting.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default FrameworkArchitect;