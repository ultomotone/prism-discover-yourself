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
                  <span className="text-white font-bold text-2xl">ILI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Vision Muse</h1>
                  <p className="text-xl text-muted-foreground">Ni–Te • Strategic Analyst</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Thoughtful and inquisitive analyst, driven by an insatiable curiosity to understand how things work.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Base & Creative Functions */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Base & Creative Functions (Core Dynamics)</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    ILI's Base function is Introverted Intuition (Ni), a 4-dimensional perceptive focus on patterns over time, meaning, and foresight. This makes ILIs quintessential analysts and forecasters – they are comfortable dwelling in contemplation, mapping out how situations are likely to unfold and distilling complex trends into fundamental insights.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Their Creative function is Extraverted Logic (Te), a 3-dimensional pragmatic function oriented to facts, efficiency, and external results. The Ni–Te pairing defines the ILI's Core: they quietly observe and anticipate future implications (Ni), then apply objective reasoning to devise practical solutions or critiques (Te).
                  </p>
                  <p className="text-lg leading-relaxed">
                    Behaviorally, ILIs often come across as thoughtful, skeptical strategists. They may be the person in the room who points out, "If we proceed down this path, in a year we might face X consequence," backing it up with data or historical analogies. They excel at identifying underlying causes and predicting problems long before others see them.
                  </p>
                </div>
              </section>

              {/* Dimensionality & Strengths */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Dimensionality & Strengths</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    With Ni as a Base, ILIs process information through the time dimension fluently – they can take into account past, present, and possible future "frames" of a situation with ease. This 4D strength allows them to be remarkably prescient and comfortable with uncertainty (they mentally simulate many what-ifs). Te as a Creative is 3D, which means ILIs adeptly adjust their logical approach to fit circumstances.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Their weaker dimensions show up in more human and immediate domains. The ILI's Vulnerable function is Extraverted Ethics (Fe), typically 1-dimensional. This means ILIs have minimal intuitive grasp of managing shared emotional atmospheres or performing enthusiastic social expressions. They often feel drained or awkward in high-energy social environments; processing emotional signals in real-time is difficult.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Similarly, Extraverted Sensing (Se) is typically a weak area for ILIs. They generally have only 1D or 2D competence with Se, indicating hesitancy with immediate action, physical engagement, or forceful influence. They are not naturally swift at seizing the moment or asserting themselves in a visceral way. Many ILIs struggle with the demands of day-to-day hustle or pushing others – they prefer to wait, watch, and act at the right time rather than constantly enforce their will.
                  </p>
                </div>
              </section>

              {/* Flow State & Regulation */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Flow State & Regulation</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    ILIs find their flow in stable, intellectually rich environments where they have the space and time to reflect. A classic ILI flow state might be when they are deep in research, analysis, or strategic planning – essentially whenever their Ni is fully engaged in understanding something over time, and their Te is sorting and structuring the information into useful knowledge.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    The cognitive-emotional environment that optimizes their regulation is one with low sensory overstimulation and minimal emotional drama. ILIs regulate best when their surroundings are calm and predictable – sudden surprises or chaotic multitasking disrupt their Ni focus and can make them withdraw. They appreciate having clear factual parameters and being able to concentrate on one topic deeply rather than juggling many superficial tasks.
                  </p>
                  <p className="text-lg leading-relaxed">
                    An ILI with N+ (high neuroticism) typically experiences more frequent anxiety about the future – given their Ni focus on what could happen, a highly neurotic ILI might fall into chronic worry or pessimism. An ILI with N– (low neuroticism), by contrast, tends to be cool-headed and unflappable. This ILI will come across as the wise sage: unperturbed by potential problems, calmly considering every angle without panic.
                  </p>
                </div>
              </section>

              {/* Block Dynamics */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Block Dynamics</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Core Block (Ni–Te)</h3>
                    <p className="text-lg leading-relaxed">
                      For ILIs, the Core block of Ni–Te is where they feel most competent and in control mentally. They often identify strongly with being knowledgeable, insightful, and logical. This core gives them confidence in offering counsel: many ILIs gravitate towards roles like advisors, strategists, researchers, or critics. They take pride in seeing what others miss and providing a sobering perspective that can save a project or effort from disaster.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Critic Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      ILIs often have Si and Fe in their Superego. Extraverted Ethics (Fe) is the Vulnerable function. This aligns with the common observation that ILIs are highly uncomfortable expressing emotions publicly or dealing with group sentiments. Fe vulnerable means they do not actively cultivate an enthusiastic or emotionally engaging persona – in fact, they may disparage environments that expect them to be "cheery" or socially available all the time.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Introverted Sensing (Si) likely sits as the Role function – ILIs know on some level that taking care of health, comfort, and routine is important (especially because their Te minds see the logic in it), so they make sporadic efforts. For example, an ILI might conscientiously try a structured daily schedule, exercise regimen, or tidy workspace, but these efforts are often half-hearted or inconsistent.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Hidden Block (Id)</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      ILIs have Ignoring Introverted Logic (Ti) – meaning while they can be highly analytical and methodical (indeed many ILIs are quite systematic in thought), they often choose not to emphasize pure theory or strict rule systems when those conflict with their Ni agenda or Te evidence. They dislike feeling constrained by dogma. This is why ILIs often position themselves as critics of overly rigid thinking.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Their Demonstrative Extraverted Intuition (Ne) shows up in a subtle but profound way: ILIs are often endlessly curious and somewhat inventive internally. They may not show it overtly (because Ne is not valued – they won't scatter their energy chasing every idea), but they generate scenarios and alternatives constantly in their mind.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block (Super-Id)</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      ILIs have Suggestive Se: they deeply appreciate and need someone or something to nudge them into action. Because they are so often lost in thought, they benefit immensely from external stimuli that force decisive engagement with reality. An ILI might gravitate towards friends who drag them to events, or a work partner who says "Alright, let's stop analyzing and DO this."
                    </p>
                    <p className="text-lg leading-relaxed">
                      The Mobilizing function for ILI would then be Introverted Ethics (Fi). ILIs actually hold personal relationships and loyalty in high regard – it's an area of aspiration and gradual development. Early in life, an ILI may be somewhat indifferent or awkward about making close connections, but as they mature, they often work on being a better friend or partner, cultivating empathy and moral consistency.
                    </p>
                  </div>
                </div>
              </section>

              {/* Personal Development, Collaboration & Leadership */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Personal Development, Collaboration & Leadership</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Development</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      ILIs grow by bridging the gap between insight and action. One key development task is to practice acting a bit sooner and more often, even if conditions aren't 100% ideal. This doesn't mean abandoning their careful approach, but rather recognizing when further deliberation has diminishing returns.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Another vital area is developing interpersonal warmth (their Fi) and expression (low Fe). ILIs could challenge themselves to communicate their feelings or appreciation explicitly to close ones – perhaps in writing if not in person at first. They might also work on listening and showing empathy: consciously stepping out of analysis mode to simply be present with someone's emotions without trying to "fix" them.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Collaboration</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      In a team, ILIs are the visionary realists. They contribute best by offering well-thought-out analyses, spotting risks and inefficiencies, and crafting long-term strategies. Colleagues will come to appreciate that an ILI on the team means fewer nasty surprises, because ILIs will often warn everyone about issues before they happen.
                    </p>
                    <p className="text-lg leading-relaxed">
                      However, teams might initially find ILIs standoffish or overly critical. It's important for ILIs to consciously temper how they deliver criticisms – using more "we" language and acknowledging others' efforts before pointing out flaws can help. Co-workers should also know that ILIs often prefer written communication (emails, reports) over spontaneous meetings.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Leadership</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Many ILIs do not seek traditional leadership positions, especially those requiring extensive public engagement or quick on-the-spot decisions. They tend to be deliberative, behind-the-scenes leaders if they step up. It's not uncommon to find ILIs in roles like department heads in R&D, editors, strategists, or think-tank directors – positions where thought leadership is key but day-to-day people management is secondary.
                    </p>
                    <p className="text-lg leading-relaxed">
                      As leaders, ILIs bring clarity of vision and risk mitigation. They plan thoroughly, ensuring their organization or team is prepared for various scenarios. They tend to set realistic goals and will rarely over-promise just to sound good – in fact, they may under-promise and then over-deliver, which builds credibility.
                    </p>
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