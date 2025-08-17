import TypeLayout from "@/components/TypeLayout";

const RelationalDriver = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">SEE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Relational Driver</h1>
                  <p className="text-xl text-muted-foreground">Se–Fi • Persuasive Operator</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Charismatic mover who reads the room, pushes for outcomes, and protects personal bonds.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Charismatic mover who reads the room, pushes for outcomes, and protects personal bonds. Best where influence, timing, and relationship capital move results. In PRISM you typically see high Se Strength, 3–4D Se, 3D Fi, Ti PoLR (1D), Ni/Te valued but developing, and Top-2 neighbors of ESI or SLE.
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
                        <td className="p-4">Senses leverage instantly; asserts cleanly; makes timely moves in social/market spaces.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Tracks trust/loyalty; advocates for "my people"; draws firm personal lines.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Learns to anchor pushes in evidence/process; risks over-hustle without it.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Wants guidance on long-arc timing; benefits from strategic counsel.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Can amplify group energy on demand; doesn't rely on it as identity.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Knows comfort pacing but deprioritizes it for momentum; restores when needed.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can brainstorm briefly; prefers to converge and act.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes abstract rule hair-splitting; patience for formal logic is low.</td>
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
                    <p>Core Drive (Se, Fi) leads; Instinctive Self (Fe, Si) quietly boosts tone and stabilizes pace.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Te, Ti) hijacks—sudden KPI policing or brittle formalism; Hidden Potential (Ni, Te) over- or under-plans.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with SEE)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Define the win, the stakes, and the boundary</li>
                      <li>• Give quick proof points</li>
                      <li>• Let them move</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Abstract rule debates</li>
                      <li>• Comfort-first pacing that kills urgency</li>
                      <li>• Endless ideation with no action</li>
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
                    <p>10-minute "two moves ahead" map for one push.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Te bite)</h3>
                    <p>Add one measurable criterion to go/no-go.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Ti hygiene)</h3>
                    <p>Replace a debate with a single if/then rule.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Fi care)</h3>
                    <p>Name one person's need and meet it concretely.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Si restore)</h3>
                    <p>Add a short post-push recovery ritual.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Se aim)</h3>
                    <p>Choose one high-leverage action; decline two low-leverage ones.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SEE vs. ESI</h3>
                    <p>Both value Fi. SEE leads with push & presence (Se→Fi), ESI leads with principle & defense (Fi→Se).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SEE vs. SLE</h3>
                    <p>Both Se-heavy. SEE frames through relationships (Fi), SLE through impersonal rules (Ti).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">SEE vs. ESFP-lookalikes</h3>
                    <p>PRISM weights scenarios to separate Se leverage + Fi loyalty from vibe-first Fe performers.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>SEE⁺</strong> = faster escalation, stronger "in-group/out-group" reactions. <strong>SEE⁻</strong> = steadier tone, more measured pacing before a push.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default RelationalDriver;