import Header from "@/components/Header";

const AtmosphereHost = () => {
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
                  <span className="text-white font-bold text-2xl">ESE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Atmosphere Host</h1>
                  <p className="text-xl text-muted-foreground">Fe–Si • Social Facilitator</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Tone-first coordinator who reads the room, lifts energy, and keeps experiences pleasant and on-pace.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Tone-first coordinator who reads the room, lifts energy, and keeps experiences pleasant and on-pace. Thrives where morale, hospitality, and day-to-day rhythm drive outcomes. In PRISM you typically see high Fe Strength, 3–4D Fe, 3–4D Si, low Ti (PoLR 1D), Ne/Fi valued but developing, and Top-2 neighbors of SEI or LII.
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
                        <td className="p-4">Tunes group affect; synchronizes; creates shared moments; diffuses friction early.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Maintains humane pace and comfort; notices drift; keeps quality consistent.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Enjoys light novelty and playful ideas from trusted sources.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Works on 1:1 sincerity and boundary clarity beneath public warmth.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can speak KPIs/policies briefly to support logistics; tires of "cold metrics."</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Surprising firmness when needed; protects the space decisively, then relaxes.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Understands long-arc talk but downplays it in favor of today's experience.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes abstract hair-splitting; struggles with rigid taxonomies without help.</td>
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
                    <p>Core Drive (Fe, Si) leads; Instinctive Self (Se, Ni) quietly guards boundaries and horizon sense.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Te, Ti) hijacks—rigid KPI talk or brittle logic; Hidden Potential (Ne, Fi) flickers between scatter and over-personalizing.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with ESE)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Set a humane pace</li>
                      <li>• Show how the plan improves people's experience</li>
                      <li>• Give 1–2 friendly options with simple criteria</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Sterile logic fights</li>
                      <li>• Comfort-blind urgency</li>
                      <li>• Big pivots without social prep</li>
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
                    <p>State one boundary kindly ("When X happens, I'll do Y").</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Te bite)</h3>
                    <p>Add a single "done = …" metric to an event/task.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Se hygiene)</h3>
                    <p>Practice one calm "no + alternative."</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Ne spark)</h3>
                    <p>Introduce a micro-novelty to a recurring routine.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Ti tidy)</h3>
                    <p>Name one classification rule in plain language.</p>
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
                    <h3 className="text-lg font-semibold mb-3">ESE vs. SEI</h3>
                    <p>Both Alpha SF. ESE leads with public tone (Fe), SEI leads with comfort pacing (Si).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ESE vs. ENFJ-lookalikes</h3>
                    <p>PRISM scenarios separate Fe–Si hospitality from Fe–Ni rally/mission framing.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ESE vs. LII</h3>
                    <p>Duals—ESE supplies tone/pace; LII supplies clean frameworks.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>ESE⁺</strong> = bigger crescendos, quicker people-pleasing then fatigue. <strong>ESE⁻</strong> = steadier warmth, clearer boundaries earlier.</p>
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

export default AtmosphereHost;