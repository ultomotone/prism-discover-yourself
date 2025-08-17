import TypeLayout from "@/components/TypeLayout";

const IntegrityGuide = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">EII</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Integrity Guide</h1>
                  <p className="text-xl text-muted-foreground">Fi–Ne • Ethics Consultant</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Principle-first counselor who reads character deeply, explores humane options, and steers choices toward congruence.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Principle-first counselor who reads character deeply, explores humane options, and steers choices toward congruence. Thrives where trust, ethics, and long-term fit matter. In PRISM you typically see high Fi Strength, 3–4D Fi, 3–4D Ne, Se PoLR (1D), and Top-2 neighbors of ESI or LSE.
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
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D (adaptive → portable)</td>
                        <td className="p-4">Fine-grained boundary/loyalty judgments; keeps relationships congruent under pressure.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Surfaces humane alternatives; reframes stalemates; spots emerging fits.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Wants clear facts, criteria, and workflows from trusted sources.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Builds sustainable routines and health practices with encouragement.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Quiet foresight; senses trajectories but seldom foregrounds them.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Reads group mood yet resists performative affect; prefers sincerity.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can "sound formal/logical" briefly; tires of hair-splitting.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes direct force and abrupt confrontations; freezes or overreacts.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note (mapping only):</strong> Classic Model A for EII ≈ Fi–Ne | Ti–Se | Si–Te | Ni–Fe by blocks; PRISM preserves positions while scoring Strength and 1D–4D per individual.
                </p>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Fi, Ne) leads; Instinctive Self (Ni, Fe) quietly adds timing sense and gentle social smoothing.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Ti, Se) hijacks—stiff formalism or avoidance/over-push; Hidden Potential (Si, Te) wobbles between comfort-seeking and sudden rule-making.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with EII)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• State the value at stake, provide evidence kindly</li>
                      <li>• Offer a humane option set</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Pressuring pace, public spectacles</li>
                      <li>• KPI-only arguments with no ethical frame</li>
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
                    <p>Define one measurable "done" for a current task.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Si anchor)</h3>
                    <p>Install a 10-min daily recovery ritual.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Se step)</h3>
                    <p>One calm boundary set early (behavioral, not moral labels).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Ni refine)</h3>
                    <p>10-line horizon note (now → near → far implications).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Fe flex)</h3>
                    <p>Begin a meeting with one emotion-label + invitation.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Ne funnel)</h3>
                    <p>Generate 3 options, retire 2, commit to 1.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">EII vs. ESI</h3>
                    <p>Both Fi-valuing. EII persuades with options and principles (Fi–Ne); ESI enforces with decisive presence (Fi–Se).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">EII vs. IEI</h3>
                    <p>Both intuitive. EII frames by values/options (Fi–Ne); IEI frames by timing/mood (Ni–Fe).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">EII vs. INFJ-lookalikes</h3>
                    <p>PRISM scenarios split Fi congruence + Ne options from duty-bound Si/Te caretaking.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>EII⁺</strong> = faster moral alarms, quicker withdrawal under pressure. <strong>EII⁻</strong> = warmer tone, more tolerance for slow consensus.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default IntegrityGuide;