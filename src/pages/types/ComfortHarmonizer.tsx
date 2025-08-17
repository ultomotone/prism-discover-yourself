import Header from "@/components/Header";

const ComfortHarmonizer = () => {
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
                  <span className="text-white font-bold text-2xl">SEI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Comfort Harmonizer</h1>
                  <p className="text-xl text-muted-foreground">Si–Fe • Experiential Caregiver</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Atmosphere tuner who notices bodily cues, smooths the room, and makes experiences feel right.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Atmosphere tuner who notices bodily cues, smooths the room, and makes experiences feel right. Best where pacing, quality-of-life, and relational ease drive outcomes. In PRISM you typically see high Si Strength, 3–4D Si, 3D Fe, weak Te/Ni planning, and Top-2 neighbors of ESE or SLI.
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
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Tracks comfort/energy precisely; builds stable rhythms; restores teams' baseline.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Reads mood and brightens tone; keeps interactions light and humane.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can formalize steps in simple schemas; benefits from partner checklists.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Enjoys gentle novelty via trusted guides; avoids scatter/overwhelm.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Background (demonstrative)</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Strong, quiet loyalty sense; guards intimacy without speechifying.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Background (ignoring)</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Can get firm briefly to protect ease; doesn't want prolonged conflict.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can "sound future-wise" in short bursts; tires of long uncertainty.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes cold metrics/time-pressure; may under-optimize throughput.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note (mapping only):</strong> Classic Model A for SEI is Si–Fe | Ni–Te | Ne–Ti | Se–Fi (1→8). PRISM keeps positions; Strength and 1D–4D are continuous.
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
                    <p>Core Drive (Si, Fe) leads; Instinctive Self (Se, Fi) quietly protects boundaries and warmth.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Ni, Te) hijacks—abstract worry or rigid "numbers talk"; Hidden Potential (Ne, Ti) flickers between playful ideas and over-formalizing.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with SEI)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Set humane pace, show practical comfort gains</li>
                      <li>• Present one or two friendly options</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Austerity KPIs with no context</li>
                      <li>• Sudden pivots that trample routines</li>
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
                    <p>Add one measurable definition to a task ("done = …").</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Ni peek)</h3>
                    <p>10-minute "what changes in 90 days?" note.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Se boundary)</h3>
                    <p>Practice one calm "no + alternative."</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Ti tidy)</h3>
                    <p>Turn a recurring chore into a 3-step checklist.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Ne spark)</h3>
                    <p>Try a micro-novelty in a safe ritual.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Si restore)</h3>
                    <p>Sleep/light/nutrition audit; tweak one habit.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SEI vs. ESE</h3>
                    <p>Both warm; SEI optimizes comfort pacing (Si) then mood; ESE optimizes mood (Fe) then comfort.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SEI vs. ISFJ-lookalikes</h3>
                    <p>PRISM separates gentle Si–Fe from duty-bound Si–Te; scenarios expose aversion to hard KPIs.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SEI vs. ILE</h3>
                    <p>Duals—SEI grounds; ILE expands. In conflict, SEI soothes; ILE reframes.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>SEI⁺</strong> = overaccommodates then snaps; avoids hard data under pressure. <strong>SEI⁻</strong> = steadier tone, clearer boundaries sooner.</p>
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

export default ComfortHarmonizer;