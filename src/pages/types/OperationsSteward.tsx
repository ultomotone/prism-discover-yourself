import TypeLayout from "@/components/TypeLayout";

const OperationsSteward = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">LSE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Operations Steward</h1>
                  <p className="text-xl text-muted-foreground">Te–Si • Process Manager</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Throughput-first organizer who standardizes workflows, watches quality, and delivers on time.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Throughput-first organizer who standardizes workflows, watches quality, and delivers on time. Excels where reliability, scheduling, and measurable outcomes matter. In PRISM you typically see high Te Strength, 3–4D Te, 3–4D Si, Fi PoLR (1D), and Top-2 neighbors of LIE or EII.
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
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D (adaptive → portable)</td>
                        <td className="p-4">Builds dashboards, SOPs, and feedback loops; iterates by evidence.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Sets humane pace, maintains standards, notices drift and wear.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Tightens definitions when stakes rise; risks over-schema in crunch.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Wants clean, bounded force from partners; benefits from assertiveness coaching.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Can "turn on" social warmth for team morale; not identity-defining.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Understands long-range talk but deprioritizes it versus concrete plans.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can brainstorm variants briefly; prefers converging to one plan.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Struggles with unspoken personal loyalties; prefers role clarity over vibes.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Model note (mapping only):</strong> Classic Model A for LSE ≈ Te–Si | Ne–Fi | Ni–Fe | Se–Ti by blocks; PRISM keeps positions while scoring Strength and 1D–4D per individual.
                </p>
              </section>

              {/* Block Map */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Map (calm vs. stress)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Calm / Flow</h3>
                    <p>Core Drive (Te, Si) leads; Instinctive Self (Ni, Fe) quietly supplies horizon sense and friendly tone.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Ne, Fi) hijacks—scatter ("what-ifs") or guilt/personalization; Hidden Potential (Se, Ti) wobbles between over-push and over-rules.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with LSE)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Bring clear requirements, metrics, and SLA windows</li>
                      <li>• Agree on one standard then automate</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Fuzzy requests, last-minute pivots</li>
                      <li>• "It's personal" arguments without roles</li>
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
                    <p>Refactor one SOP to ≤5 crisp rules.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Se edge)</h3>
                    <p>One time-boxed assertive ask with a yes/no gate.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Fe craft)</h3>
                    <p>Open stand-up with quick morale scan + thanks.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Ni peek)</h3>
                    <p>10-min risk timeline (30/90/180-day).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Si restore)</h3>
                    <p>Install a micro-recovery at mid-shift.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Te loop)</h3>
                    <p>Add a metric → action trigger to one process.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LSE vs. LIE</h3>
                    <p>Both Te-led. LSE optimizes stability & throughput (Te–Si). LIE optimizes leverage & bets (Te–Ni).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LSE vs. LSI</h3>
                    <p>Both structured. LSI enforces internal logic (Ti–Se); LSE scales by external metrics (Te–Si).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">LSE vs. SEI</h3>
                    <p>SEI centers comfort/atmosphere; LSE centers delivery/standards.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>LSE⁺</strong> = tighter deadlines, shorter patience for ambiguity. <strong>LSE⁻</strong> = steadier pacing, more coaching before escalation.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default OperationsSteward;