import TypeLayout from "@/components/TypeLayout";

const VisionMuse = () => {
  return (
    <TypeLayout>
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
              <p className="text-lg text-foreground">Soft-spoken futurist who senses trajectories, sets emotional tone, and helps people align with a meaningful arc.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Soft-spoken futurist who senses trajectories, sets emotional tone, and helps people align with a meaningful arc. Best where timing, narrative, and mood choreography drive change. In PRISM you typically see high Ni Strength, 3–4D Ni, 3–4D Fe, Te PoLR (1D), Se/Ti valued but developing, and Top-2 neighbors of EIE or SLE.
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
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D (adaptive → portable)</td>
                        <td className="p-4">Feels where things are headed; frames timing; prunes noise to a single storyline.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Tunes group affect; invites, soothes, and crescendos at the right moments.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Practices clean definitions to stabilize vision; can over-schema under stress.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Wants decisive partners and clear "now" steps; benefits from gentle force coaching.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes cold metrics/efficiency talk; can feel invalidated by "just the numbers."</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can "do routine/comfort talk" briefly; tires of pace/maintenance as a focus.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Generates options but discards scatter in favor of one coherent arc.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Quiet, strong sense of sincerity/rapport; rarely foregrounded or politicized.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note (mapping only):</strong> Common Model A mapping for IEI ≈ Ni–Fe | Si–Te | Se–Ti | Ne–Fi by blocks; PRISM keeps positions while scoring Strength and 1D–4D per individual.
                </p>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Ni, Fe) leads; Instinctive Self (Ne, Fi) quietly supplies gentle novelty and sincere rapport.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Si, Te) hijacks—rigid routine talk or KPI anxiety; Hidden Potential (Se, Ti) swings between timid action and over-structuring.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with IEI)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Share the purpose and horizon</li>
                      <li>• Ask for the "pulse" and right moment</li>
                      <li>• Offer clear first steps</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Spreadsheet-only pitches</li>
                      <li>• Rushing pace</li>
                      <li>• Forcing confrontation without framing</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7-Day Practice */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7-Day Micro-Practice</h2>
                <div className="space-y-4">
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D1 (Se step)</h3>
                    <p>One small, time-boxed action toward the vision (10–15 minutes).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Ti trim)</h3>
                    <p>Define 3 crisp criteria for "done" on a current task.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Te bite)</h3>
                    <p>Choose one humane metric tied to the story (what equals progress).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Si anchor)</h3>
                    <p>Install a mini-routine that protects creative energy.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Fe craft)</h3>
                    <p>Open a meeting with a mood label + invitational question.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Ni refine)</h3>
                    <p>10-line "arc" (now → near → far) and one risk to pre-empt.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">IEI vs. EIE</h3>
                    <p>Both narrative-driven; IEI leads with Ni (pulse/timing), EIE leads with Fe (public rally).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">IEI vs. INFJ-lookalikes</h3>
                    <p>PRISM weights scenario & ipsative items to separate Ni–Fe timing/narrative from duty-bound Si/Te caretaking.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">IEI vs. ILI</h3>
                    <p>Both intuitive; IEI frames by mood & meaning (Fe), ILI frames by efficiency & risk (Te).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>IEI⁺</strong> = stronger mood swings, avoidance of hard data, urgency about "bad timelines." <strong>IEI⁻</strong> = steadier pacing, easier boundary-setting, more consistent follow-through.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default VisionMuse;