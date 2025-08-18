import TypeLayout from "@/components/TypeLayout";

const ForesightAnalyst = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">ILI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Foresight Analyst</h1>
                  <p className="text-xl text-muted-foreground">Ni–Te • Risk & Signals Analyst</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Quiet strategist who models trajectories, quantifies risk, and recommends efficient bets.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Snapshot */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Snapshot</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed">
                    Quiet strategist who models trajectories, quantifies risk, and recommends efficient bets. Best where signal detection, timing, and resource optimization matter. In PRISM you typically see high Ni Strength, 3–4D Ni, 3–4D Te, Fe PoLR (1D), Se/Fi valued but developing, and Top-2 neighbors of LIE or IEI.
                  </p>
                </div>
              </section>

              {/* Profile */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Profile</h2>
                <div className="prism-card p-6">
                  <div className="space-y-4 text-base leading-relaxed">
                    <p>
                      You are a strategic, independent thinker who excels at visionary planning and systematic execution. Dominant Introverted Intuition (Ni) gives you a penetrating focus on future outcomes – you instinctively see how events will unfold over time and devise complex mental models to understand the world. You often have a "master plan" in mind, whether it's a career path, a project blueprint, or an intellectual framework you're constructing.
                    </p>
                    
                    <p>
                      Auxiliary Extraverted Thinking (Te) complements this by driving you to organize, decide, and implement your ideas efficiently. You are quick to notice ineffectiveness or chaos and just as quick to formulate a better system or solution. This combination makes you a natural architect or executive type – you not only dream up how things could be, but also have the will to make them happen.
                    </p>
                    
                    <p>
                      You value competence, knowledge, and results, often holding both yourself and others to high standards of performance. INTJs tend to be confident and self-directed; you prefer to figure things out independently and can be remarkably self-sufficient in your learning and problem-solving.
                    </p>
                    
                    <p>
                      In flow, you're in the zone when tackling a complex challenge that requires long-term strategy – for example, mapping out a novel theory, debugging an intricate system, or leading a project toward a clear goal. At such times you feel a powerful sense of control and purpose, channeling your foresight and logic into reality. Others might notice your eyes "light up" when you talk about a vision you're passionate about – that's a sign you're operating in your element.
                    </p>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-primary">Internal Critic & Growth</h3>
                      <p className="mb-3">
                        Your internal critic (tertiary Fi, inferior Se in this case) often stays in the background, but it can bite you with surprising force, especially in interpersonal or work-life balance areas. You take pride in your rationality, so you may secretly criticize yourself for any "irrational" feelings or value-driven doubts (that's your Fi whispering). Similarly, inferior Se means practical details or sudden changes can really frustrate you – and you might internally scold yourself for not being as present or physically adept as others in some situations.
                      </p>
                      
                      <p className="mb-3">
                        Under extreme stress, an INTJ can experience "Se-grip" episodes: for instance, you might impulsively overindulge in sensory pleasures (binging TV, food, etc.) or become uncharacteristically reactive and short-tempered about immediate issues, as all that suppressed Se bursts out. Generally, though, you keep a handle on overt emotions; your struggles are more often felt internally.
                      </p>
                      
                      <p className="mb-3">
                        Challenges for INTJ include relating to others' emotional needs and being patient with less competent folks. You may come across as aloof or uncompromising – colleagues might find you impatient with inefficient systems or people, and loved ones might wish you were more emotionally demonstrative. It's important to remember that not everyone sees the world with your clarity of vision, so try to explain your insights and also listen to others' concerns (even if they seem "illogical").
                      </p>
                      
                      <p>
                        On the plus side, your Hidden Potential block (Ne/Fi or Fi/Ne, depending on model) suggests you can tap into more creativity and empathy than you show – many INTJs, later in life or when relaxed, reveal a witty imaginative side and a principled, values-driven core that surprises others.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-primary">Guiding Light</h3>
                      <p>
                        Embrace your role as a visionary builder – your ability to foresee and systematically achieve is a rare strength. In flow, you operate like an architect of the future, which not only yields great personal satisfaction but also can lead to extraordinary accomplishments. Just keep an eye on the human element (both your own feelings and others') so your grand designs truly succeed in the real world.
                      </p>
                    </div>
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
                        <th className="text-left p-4 font-semibold">What it looks like day-to-day</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ni</td>
                        <td className="p-4">High</td>
                        <td className="p-4">3–4D (adaptive → portable)</td>
                        <td className="p-4">Spots trendlines; prunes noise; chooses the path of least wasted motion.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Te</td>
                        <td className="p-4">Med–High</td>
                        <td className="p-4">3–4D</td>
                        <td className="p-4">Grounds foresight in evidence; builds lean metrics and feedback loops.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Fi</td>
                        <td className="p-4">Aspiring (mobilizing)</td>
                        <td className="p-4">2–3D</td>
                        <td className="p-4">Works on stating personal boundaries/values plainly; prefers respectful 1:1s.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Se</td>
                        <td className="p-4">Aspiring (suggestive)</td>
                        <td className="p-4">1–2D</td>
                        <td className="p-4">Wants decisive partners and clean execution; benefits from assertiveness coaching.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Ti</td>
                        <td className="p-4">Demonstrative</td>
                        <td className="p-4">4D</td>
                        <td className="p-4">Can tighten definitions on demand; keeps internal logic tidy in the background.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Ne</td>
                        <td className="p-4">Ignoring</td>
                        <td className="p-4">3D</td>
                        <td className="p-4">Generates options but discards scatter; stays with the chosen arc.</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium">Si</td>
                        <td className="p-4">Role</td>
                        <td className="p-4">2D</td>
                        <td className="p-4">Can maintain routines briefly; tires of comfort/maintenance as focus.</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-4 font-medium">Fe</td>
                        <td className="p-4">Vulnerable (PoLR)</td>
                        <td className="p-4">1D</td>
                        <td className="p-4">Dislikes performative affect; misreads or avoids high-emotion group moments.</td>
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
                    <p>Core Drive (Ni, Te) leads; Instinctive Self (Ti, Si) quietly supplies coherent rules and baseline upkeep.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Stress / Crunch</h3>
                    <p>Internal Critic (Fe, Ne) hijacks—awkward public tone or anxious scatter; Hidden Potential (Fi, Se) swings between over-softness and under-assertion.</p>
                  </div>
                </div>
              </section>

              {/* Communication Tips */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Comms & Decision Tips (for/with ILI)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">Do</h3>
                    <ul className="space-y-2">
                      <li>• Present data + uncertainty bands</li>
                      <li>• Ask for "most likely path" and failure points</li>
                      <li>• Agree on a lean KPI</li>
                    </ul>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Avoid</h3>
                    <ul className="space-y-2">
                      <li>• Hypey rallies</li>
                      <li>• Brainstorm for its own sake</li>
                      <li>• Forcing on-the-spot confrontation</li>
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
                    <p>One small, time-boxed assertive action (email/ask with a deadline).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D2 (Fi rep)</h3>
                    <p>State a boundary in behavioral terms ("When X, I will Y").</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D3 (Te gate)</h3>
                    <p>Add a single metric to an advice you give (what equals "green").</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D4 (Si anchor)</h3>
                    <p>Install a 10-minute recovery ritual post-deep work.</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D5 (Ni refine)</h3>
                    <p>Write a 10-line scenario tree (base/best/worst).</p>
                  </div>
                  <div className="prism-card p-4">
                    <h3 className="font-semibold mb-2">D6–D7 (Ti tidy)</h3>
                    <p>Remove one contradictory rule; publish the simpler version.</p>
                  </div>
                </div>
              </section>

              {/* Mistype Disambiguators */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">"If-Not-This-Then-That" (mistype disambiguators)</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ILI vs. LIE</h3>
                    <p>Both Ni–Te; ILI optimizes prediction & risk control, LIE optimizes throughput & leverage.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ILI vs. IEI</h3>
                    <p>Both Ni-heavy; ILI frames with metrics (Te), IEI frames with mood/meaning (Fe).</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">ILI vs. INTJ-lookalikes</h3>
                    <p>PRISM scenarios separate quiet Ni–Te advisorship from Te-led command roles.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Overlay tells</h3>
                    <p><strong>ILI⁺</strong> = sharper pessimism, quicker withdrawal from noisy rooms. <strong>ILI⁻</strong> = steadier tone, easier stepwise execution.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default ForesightAnalyst;