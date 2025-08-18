import TypeLayout from "@/components/TypeLayout";

const IdeaCatalyst = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">ILE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Idea Catalyst</h1>
                  <p className="text-xl text-muted-foreground">Ne–Ti • Exploratory Analyst</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Energetic innovator and natural questioner of the status quo, known for your quick wit and love of debate.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Core */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Core</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    ILEs are energetic innovators driven by extroverted intuition (Ne) base and introverted logic (Ti) creative. With Ne as a 4D base, the ILE's mind brims with expanding possibilities and ingenious connections. They constantly scan for the "new" – new theories, experiences, technologies, or angles – and delight in brainstorming and experimentation.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    This plus-oriented Ne produces incorrigible dreamers: ILEs often look beyond the horizon and propose ideas that others find bold or even far-fetched, yet they have an uncanny ability to envision which of these ideas carry positive potential at their core. Balancing this imaginative breadth is their Ti creative function, lending structure and logical coherence to their explorations. ILEs use Ti to categorize and systematize their myriad ideas, at least enough to explain or implement them.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In a flow state, an ILE can be pictured as an inventive scientist or a hacker in the zone: intensely absorbed in chasing a concept, making rapid-fire associations, and solving theoretical puzzles, often losing track of time in the process. They thrive when their environment offers mental stimulation and when they have the freedom to jump between projects or lines of inquiry. Thanks to their strong functional dimensionality, ILEs are confident in both improvising on the fly and reasoning from first principles, which makes them remarkably adaptable thinkers.
                  </p>
                </div>
              </section>

              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    The Critic block of ILE contains introverted sensing (Si) as vulnerable and introverted feeling (Fi) as role. Si (1D) is the ILE's sore spot: they often forget about mundane needs – regular meals, rest, physical comfort – when engrossed in mentally stimulating activities. They can be notoriously neglectful of their health or surroundings (think of the "absent-minded professor" who hasn't slept or eaten properly because they're chasing an idea).
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    When Si demands catch up (like exhaustion or illness), ILEs experience a collapse that forces them to stop and recover, which they find frustrating. Likewise, they may inadvertently offend others by overlooking social niceties related to comfort ("Oops, I didn't realize you were cold/hungry!"). Their Fi role (2D) means ILEs are somewhat aware of interpersonal dynamics and will attempt to manage them – often by using humor, charm or a bit of chameleon-like behavior to get along.
                  </p>
                  <p className="text-lg leading-relaxed">
                    However, deep emotional bonding or attending to people's unspoken feelings is not their forte. They keep relationships light and intellectual, which can come off as aloof or inconsistent in commitment. Under stress, an ILE might display snappish logical critiques (via Ti) one moment, then try to appease with a joke the next (an awkward Fi role effort), revealing an inner confusion about how to handle conflict. Emotional self-regulation is a challenge: ILEs intellectualize feelings and may vent by talking excessively about their problems or escaping into yet another project rather than sitting with the emotion.
                  </p>
                </div>
              </section>

              {/* Hidden & Instinct */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Hidden & Instinct</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Hidden Desires</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Hidden within the ILE is a strong desire for stability and care (Si suggestive) – they truly appreciate friends or partners who help anchor them in the physical world, whether that's reminding them to eat or creating a comfy home ambiance. This kind of support soothes the frenetic Ne so the ILE can shine even brighter intellectually.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Additionally, their mobilizing Fi hints that, with maturity, ILEs develop a more earnest ethical core: they learn to value certain ideals or people deeply and to act with more personal sincerity instead of constant jokester mode.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      In the Instinct block, ILEs possess serious yet background capabilities: they have potent willpower and tactical sense (Se demonstrative) and a breadth of emotional expression (Fe ignoring) that they typically underuse. An ILE might not seek leadership, but when a situation calls for it, they can surprisingly take command, using their Se to push an agenda or defend an idea vigorously.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Similarly, they often appear nonchalant emotionally, but they're fully capable of theatrical humor or rallying a group with enthusiasm (Fe) if logical persuasion alone isn't working. Over time, ILEs expand by incorporating more balance between novelty and stability. They learn that not every idea must be pursued at once – some follow-through and routine (developing a bit of Si) actually enables greater innovation by preventing burnout. A well-rounded ILE remains brilliantly imaginative and analytically sharp, but also knows when to slow down, care for themselves and others, and see a venture through to completion – effectively turning flashes of genius into real-world impact.
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

export default IdeaCatalyst;