import TypeLayout from "@/components/TypeLayout";

const StrategicExecutor = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">LIE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Strategic Executor</h1>
                  <p className="text-xl text-muted-foreground">Te–Ni • Outcome Operator</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Optimizes by metrics; scales processes toward long-range aims.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Outcome-first builder who spots leverage, sets metrics, and moves fast. Best in ambiguous markets or projects where a clear scoreboard and long-range trajectory matter. In PRISM reports, LIEs typically show high Te Strength, 3–4D Te, 3–4D Ni, low Si dimensionality, and a Top-2 neighbor of LSE or ILI. Core type is stable; expression shifts with ± overlay (reactivity) and context.
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <span>References: </span>
                    <a href="https://sedecology.com" target="_blank" rel="noopener" className="text-primary hover:underline">sedecology.com</a> • 
                    <a href="https://wikisocion.github.io" target="_blank" rel="noopener" className="text-primary hover:underline ml-1">wikisocion.github.io</a> • 
                    <a href="https://library.socionic.info" target="_blank" rel="noopener" className="text-primary hover:underline ml-1">library.socionic.info</a>
                  </div>
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
                        <th className="text-left p-4 font-semibold">What that looks like day-to-day</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te (Extraverted Thinking)</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D "adaptive → portable"</td>
                        <td className="p-4">Operates by evidence, KPIs, iteration; turns ideas into processes; delegates by metrics.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ni (Introverted Intuition)</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Reads trend lines, timing, risk; prunes noise; sets strategic arcs.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Se (Extraverted Sensing)</td>
                        <td className="p-4">Low–Med (aspiring)</td>
                        <td className="p-4">2D "routine"</td>
                        <td className="p-4">Pushes when needed; developing situational force (often over/under-shoots early).</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fi (Introverted Feeling)</td>
                        <td className="p-4">Low–Med (aspiring)</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Working on boundaries & one-to-one attunement; principled but can feel "costly."</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ti (Introverted Thinking)</td>
                        <td className="p-4">Background</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Can tighten models when required but deprioritizes purity for outcomes.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ne (Extraverted Intuition)</td>
                        <td className="p-4">Background</td>
                        <td className="p-4">4D (demonstrative)</td>
                        <td className="p-4">Quiet flood of options when stuck; uses as a tool, not an identity.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fe (Extraverted Feeling)</td>
                        <td className="p-4">Situational (role)</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can "turn on" group energy briefly; tires of it fast.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si (Introverted Sensing)</td>
                        <td className="p-4">Low</td>
                        <td className="p-4">1D "emerging"</td>
                        <td className="p-4">Blind spot for comfort/pace; risks overdrive & recovery crashes.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note:</strong> In classical Model A the LIE stack is Te-Ni | Fe-Si | Fi-Se | Ti-Ne (1→8). PRISM preserves the mapping but measures Strength and 1D–4D continuously (not as absolutes).
                </p>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Te, Ni) leads; Instinctive Self (Ti, Ne) cleans edges; fast, strategic execution.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Fe, Si) hijacks—over-managing tone or ignoring body needs; Hidden Potential (Fi, Se) oscillates between too soft and too forceful.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with LIE)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Bring numbers, deadlines, constraints</li>
                      <li>• Ask for the success metric</li>
                      <li>• Propose two viable options</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Vibe-only arguments</li>
                      <li>• Open-ended "what ifs" without payoff</li>
                      <li>• Slow consensus circles</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7-Day Practice */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7-Day Micro-Practice</h2>
                <div className="space-y-4">
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 1–2 (Fi reps)</h3>
                    <p>10-minute debrief after tough calls—"Which values did I protect/harm?"</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 3 (Si pit-stop)</h3>
                    <p>Schedule micro-recovery (nutrition/sleep) around sprints.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 4 (Se edge)</h3>
                    <p>One deliberate confrontation with clear ask & exit criteria.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 5 (Ni refine)</h3>
                    <p>Write a 5-line "failure pre-mortem."</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 6–7 (Te system)</h3>
                    <p>Automate one recurring decision with a simple KPI gate.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LIE vs. LSE</h3>
                    <p>Both metric-driven. LSE favors Si routine & stability; LIE favors Ni bets & pivots. Ask a scenario: optimize the factory (LSE) vs reposition the product (LIE).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LIE vs. ILI</h3>
                    <p>Both strategic. LIE acts to move markets (Te/Se), ILI analyzes risk and times moves (Ni/Te with lower Se).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LIE vs. ENTJ-style MBTI</h3>
                    <p>PRISM will down-weight mood-driven Likerts; ipsatives & scenarios separate Te-led execution from Fe-led leadership theatre.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay (+/–) tells</h3>
                    <p><strong>LIE⁺</strong> = impatient, sharper pushes, "just ship it." <strong>LIE⁻</strong> = steadier pacing, cleaner delegation. Type remains LIE; overlay only modulates expression.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default StrategicExecutor;