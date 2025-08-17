import TypeLayout from "@/components/TypeLayout";

const TacticalCommander = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">SLE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Tactical Commander</h1>
                  <p className="text-xl text-muted-foreground">Se–Ti • Field Strategist</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Field-driven executor who reads the room fast, seizes openings, and applies clean logic to win the moment.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Field-driven executor who reads the room fast, seizes openings, and applies clean logic to win the moment. Best where decisive pressure, boundary-setting, and real-time tactics matter. In PRISM you typically see high Se Strength, 3–4D Se, 3–4D Ti, low Fi (PoLR), Ni/Fe valued but developing, and Top-2 neighbors of LSI or IEI.
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
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D (adaptive → portable)</td>
                        <td className="p-4">Detects leverage immediately; asserts cleanly; times pushes and retreats.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Strips contradictions; sets crisp criteria; enforces fair rules-of-engagement.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Practices visible warmth to rally teams; can feel effortful or brief.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Seeks future timing & "bigger picture" support; appreciates strategic counsel.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can speak KPIs/policies for a while; tires of bureaucracy and bean-counting.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Struggles with private loyalty nuances; dislikes personalized moral framing.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Knows comfort/routine but deprioritizes it for momentum; restores only when necessary.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Produces options on tap under pressure; uses brainstorming tactically, not as identity.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note (mapping only):</strong> Classic Model A for SLE ≈ Se–Ti | Te–Fi | Si–Ne | Ni–Fe in block order; PRISM preserves positions but measures Strength and 1D–4D continuously.
                </p>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Se, Ti) leads; Instinctive Self (Si, Ne) quietly stabilizes recovery and out-of-the-box angles.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Te, Fi) hijacks—rigid policy talk or messy personalization; Hidden Potential (Ni, Fe) wobbles between over-forecasting and over-cheering.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with SLE)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• State the objective, constraints, and non-negotiables</li>
                      <li>• Ask for their read of the terrain</li>
                      <li>• Decide fast</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Long abstract debates</li>
                      <li>• Guilt-based appeals</li>
                      <li>• Comfort-first pacing that blunts initiative</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7-Day Practice */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">7-Day Micro-Practice</h2>
                <div className="space-y-4">
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D1 (Ni peek)</h3>
                    <p>10-minute "two moves ahead" map (if X, then Y; if not-X, then Z).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Fe rep)</h3>
                    <p>Open one meeting by naming the emotional target + rally line.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Fi hygiene)</h3>
                    <p>Deliver one boundary using behavior, not motives ("When X, I will Y.").</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Te bite)</h3>
                    <p>Add a single KPI gate to a decision ("ship if &gt; N signups").</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Si restore)</h3>
                    <p>Insert a short recovery ritual after high-intensity pushes.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Ti tidy)</h3>
                    <p>Retire one vague rule; publish a clearer criterion.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SLE vs. LSI</h3>
                    <p>Both firm. SLE pushes outcomes then codifies (Se→Ti). LSI codifies then applies force (Ti→Se).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SLE vs. ENTJ-lookalikes</h3>
                    <p>PRISM scenarios separate Se timing from Te throughput; SLE hates bureaucracy but loves crisp rules.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SLE vs. SEE</h3>
                    <p>Both Se-heavy; SEE frames in Fi (personal bonds), SLE frames in Ti (impersonal fairness).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>SLE⁺</strong> = faster escalation, shorter fuse with dithering. <strong>SLE⁻</strong> = steadier tone, more patient coaching before push.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default TacticalCommander;