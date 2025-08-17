import TypeLayout from "@/components/TypeLayout";

const InspirationOrchestrator = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">EIE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Inspiration Orchestrator</h1>
                  <p className="text-xl text-muted-foreground">Fe–Ni • Change Mobilizer</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Emotion-first mobilizer who rallies people around a compelling future.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Emotion-first mobilizer who rallies people around a compelling future. Tunes the room's tone, frames a shared narrative, and moves groups toward action. In PRISM you typically see high Fe Strength, 3–4D Fe, 3–4D Ni, Si PoLR (1D), and Top-2 neighbors of LSI or IEI.
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
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D (adaptive → portable)</td>
                        <td className="p-4">Reads/crafts group affect; energizes, synchronizes, and escalates/softens tone on cue.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Spots trajectories; frames "where this is going"; times pushes and pauses.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Wants firm, decisive follow-through; benefits from clear, bounded force.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Craves clean rules/definitions to support the vision; over-formalizes when anxious.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can speak metrics for a while; tires of cold KPI talk without narrative.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Weak comfort/pacing sense; risks burnout or neglecting bodily signals.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Detects one-to-one sentiment but deprioritizes private loyalties vs. public cause.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Can brainstorm options on tap, but funnels quickly back to one storyline (Ni).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note (mapping only):</strong> Classic Model A for EIE is Fe–Ni | Te–Si | Se–Ti | Fi–Ne (1→8). PRISM preserves positions but measures Strength and 1D–4D continuously.
                </p>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Fe, Ni) leads; Instinctive Self (Fi, Ne) quietly rounds out sincerity and options.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Te, Si) hijacks—rigid KPI policing or body neglect; Hidden Potential (Se, Ti) wobbles between over-push and over-rules.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with EIE)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Anchor discussions in meaning + timing</li>
                      <li>• Bring a light rule set to support action</li>
                      <li>• Create visible "moments"</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Sterile dashboards without story</li>
                      <li>• Comfort-first pacing that diffuses momentum</li>
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
                    <p>Define 3 non-negotiable principles for the current push.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Se edge)</h3>
                    <p>One clear, bounded ask with a yes/no gate.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Si pit-stop)</h3>
                    <p>Schedule two micro-recoveries around big events.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Ni refine)</h3>
                    <p>10-line "arc of change" (now → near → far).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Te bite)</h3>
                    <p>One metric tied to the arc (what equals "moved the needle").</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Fe craft)</h3>
                    <p>Open/close meetings with emotion labels + concrete next step.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">EIE vs. IEI</h3>
                    <p>Both narrative-driven; EIE leads with Fe (rally), IEI leads with Ni (muse/pulse).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">EIE vs. ENFJ-lookalikes</h3>
                    <p>PRISM scenarios separate public affect + timing (Fe–Ni) from harmony caretaking (Fe–Si).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">EIE vs. LSI</h3>
                    <p>Same quadra. EIE persuades the room; LSI codifies/enforces the rule.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>EIE⁺</strong> = hotter crescendos, faster escalations; watch Si neglect. <strong>EIE⁻</strong> = steadier tone, cleaner pacing, fewer over-pushes.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default InspirationOrchestrator;