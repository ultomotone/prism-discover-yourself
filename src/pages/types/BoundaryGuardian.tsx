import Header from "@/components/Header";

const BoundaryGuardian = () => {
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
                  <span className="text-white font-bold text-2xl">ESI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Principled Guardian</h1>
                  <p className="text-xl text-muted-foreground">Fi–Se • Values Enforcer</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Loyal, boundary-clear protector who reads character quickly and takes firm, practical care of people and commitments.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Loyal, boundary-clear protector who reads character quickly and takes firm, practical care of people and commitments. In PRISM, ESIs typically show high Fi Strength, 3–4D character reading, solid 2–3D Se for real-world enforcement, 1D Ne blind spot, and Top-2 neighbors of EII or LSI.
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <span>References: </span>
                    <a href="https://wikisocion.github.io" target="_blank" rel="noopener" className="text-primary hover:underline">wikisocion.github.io</a> • 
                    <a href="https://sedecology.com" target="_blank" rel="noopener" className="text-primary hover:underline ml-1">sedecology.com</a> • 
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
                        <td className="p-4 font-medium">Fi (Introverted Feeling)</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Fine-grained trust/boundary judgments; consistent ethics under pressure.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se (Extraverted Sensing)</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Calm, decisive backbone; protection/defense over dominance.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te (Extraverted Thinking)</td>
                        <td className="p-4">Aspiring (support sought)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Appreciates clear procedures & proof; prefers trusted experts/systems.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ni (Introverted Intuition)</td>
                        <td className="p-4">Aspiring (growth)</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Developing comfort with long-range uncertainty & timing.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Si (Introverted Sensing)</td>
                        <td className="p-4">Background (quiet strength)</td>
                        <td className="p-4">4D (demonstrative)</td>
                        <td className="p-4">Keeps environments comfortable and rhythm steady—rarely advertises it.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fe (Extraverted Feeling)</td>
                        <td className="p-4">Background (ignoring)</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Reads group mood but resists performative warmth; prefers sincerity.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ti (Introverted Thinking)</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can "sound formal" briefly; tires of hair-splitting.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ne (Extraverted Intuition)</td>
                        <td className="p-4">Low</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes scatter & surprise; prefers proven paths and clear intentions.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note:</strong> Classical stack for ESI is Fi-Se | Ti-Ne | Te-Ni | Fe-Si. PRISM keeps the map but scores Strength and 1D–4D per individual.
                </p>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Fi, Se) anchors values + firm follow-through; Instinctive Self (Fe, Si) quietly stabilizes comfort and tone.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Ti, Ne) hijacks—over-formalizing, pessimistic "what-ifs." Hidden Potential (Te, Ni) under-fired or over-relied on (e.g., sudden rigid rule-making).</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with ESI)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Be sincere, concrete, and consistent</li>
                      <li>• Define duties & boundaries</li>
                      <li>• Show proof of fairness</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Whiplash pivots</li>
                      <li>• Charm in place of integrity</li>
                      <li>• Speculative "what if" planning with no anchor</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7-Day Practice */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7-Day Micro-Practice</h2>
                <div className="space-y-4">
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 1–2 (Te reps)</h3>
                    <p>Convert one value into a checkable metric (e.g., "on-time = &lt;5 min variance").</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 3 (Ni preview)</h3>
                    <p>15-min "three horizons" journal (30/90/365-day implications).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 4 (Se hygiene)</h3>
                    <p>One firm boundary stated with a calm time-boxed script.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 5 (Fe flex)</h3>
                    <p>Open a meeting with one emotion-naming sentence, then proceed to facts.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">Day 6–7 (Si restore)</h3>
                    <p>Design a repeatable recovery ritual (sleep, food, light movement).</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ESI vs. EII</h3>
                    <p>Both value Fi, but ESI enforces with Se (decisive, boundary-forward) while EII persuades with Ne/Te (advice, options, frameworks).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ESI vs. ISFJ-MBTI look-alikes</h3>
                    <p>PRISM separates quiet Si caretaking (background) from Fi principle enforcement (core). Ipsatives force trade-offs between harmony-keeping vs. boundary-keeping.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ESI vs. LSI</h3>
                    <p>Both firm; LSI frames in Ti/Se rules; ESI frames in Fi/Se loyalties.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay (+/–) tells</h3>
                    <p><strong>ESI⁺</strong> = sharper judgments, faster escalation under breach. <strong>ESI⁻</strong> = steadier tone, more patient coaching. Type remains ESI; overlay modulates expression.</p>
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

export default BoundaryGuardian;