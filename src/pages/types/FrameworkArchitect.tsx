import TypeLayout from "@/components/TypeLayout";

const FrameworkArchitect = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">LII</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Framework Architect</h1>
                  <p className="text-xl text-muted-foreground">Ti–Ne • Systems Theorist</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Thoughtful and inquisitive analyst, driven by an insatiable curiosity to understand how things work.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Profile */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Profile</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    You are a thoughtful and inquisitive analyst, driven by an insatiable curiosity to understand how things work. Dominant Introverted Thinking (Ti) makes you a natural theorist – you seek internal logical consistency and clarity in all that you encounter. INTPs often live in a world of concepts and abstractions; you love taking problems or ideas apart, examining them from every angle, and rebuilding them in your mind just to see what's possible.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    You approach life as a puzzle to be solved or a system to be understood. Auxiliary Extraverted Intuition (Ne) adds a creative, exploratory element to this. It means that even while your Ti is dissecting details, your Ne is scanning outwardly for new connections and possibilities. The result is a personality often described as inventive, intellectually playful, and highly independent.
                  </p>
                  <p className="text-lg leading-relaxed">
                    You aren't content with surface explanations; you dive deep into research or tinkering, often losing track of time in your intellectual adventures. You also have a strong imaginative streak – many INTPs are drawn to science fiction, complex strategy games, or creative problem-solving because it stimulates both logic and novelty.
                  </p>
                </div>
              </section>

              {/* Social & Flow */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Social & Flow</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Social Style</h3>
                    <p className="text-lg leading-relaxed">
                      Socially, you tend to be reserved, even shy, around new people, but with those you trust, you can be surprisingly witty or enthusiastic about your niche interests. You may delight in a good debate (as long as it stays rational and not emotionally charged) or collaborate with others on theoretical projects.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">In Flow</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      You find yourself in the zone when you're solving a complex problem or immersed in mastering a subject of interest. It could be debugging code, designing a concept model, writing a long analysis, or even composing music – whatever engages your mind's full analytical power and creative insight. In those moments, you can become oblivious to the outside world, living almost entirely in your head where the puzzle pieces are clicking into place.
                    </p>
                    <p className="text-lg leading-relaxed">
                      You might also enter flow in a stimulating conversation – for instance, brainstorming theoretical ideas with someone who shares your intellectual passion can be exhilarating, each idea sparking another in rapid fire. Your eyes light up when you talk about something complex you've figured out, and others see the brilliance of your unique perspective.
                    </p>
                  </div>
                </div>
              </section>

              {/* Internal Critic & Growth */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Internal Critic & Growth</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Common Challenges</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Your challenges often relate to the external world of "practical" matters and emotions, which can seem messy or trivial compared to your pristine mental world. Your Internal Critic block (tertiary Si, inferior Fe) means you might second-guess yourself about things like remembering details or social interactions. For example, you may fret internally that you're too forgetful or disorganized (tertiary Si concern), or replay a social encounter and berate yourself for any awkwardness or sign of emotional ineptitude (inferior Fe at work).
                    </p>
                    <p className="text-lg leading-relaxed">
                      Indeed, Extraverted Feeling (Fe) is your weakest point – expressing emotions or handling others' feelings can make you feel like a fish out of water. You generally prefer to keep feelings private or rationalize them away, which can lead to others perceiving you as detached or overly blunt.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Under Stress</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Under stress, Fe may surge up in not-so-helpful ways: some INTPs have moments of emotional outburst or excessive people-pleasing that surprise even themselves. You might, for instance, suddenly crave validation and worry what everyone thinks of you (a very un-INTP state of mind that indicates stress).
                    </p>
                    <p className="text-lg leading-relaxed">
                      Another reaction to stress is slipping into an Si "comfort bubble" – retreating from new stimuli and stubbornly sticking to known routines or nostalgic habits, which isn't your usual adaptive self. When extremely overwhelmed, you might become uncharacteristically nostalgic or conservative, resisting any new ideas (a short-term inversion of your Ne).
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Common Weaknesses</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Common weaknesses attributed to INTPs include procrastination (you're infamous for pondering instead of doing, sometimes), indecisiveness when data is insufficient, and a tendency to overlook practical details like deadlines or dress codes. Real-world tasks like managing finances or keeping a tidy living space can feel burdensome when your mind is on more captivating problems.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Moreover, your communication, being very concept-heavy, can confuse others – you might provide a lengthy, nuanced explanation when a simple answer was expected, or use terms that sail over people's heads.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Growth Path</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      To grow, two areas are key: execution and empathy. Try to practice taking your brilliant ideas across the finish line – even if that means setting timers to force a decision or collaborating with someone who has complementary skills. And while you don't need to become a social butterfly, recognizing the value of emotions and small social niceties will greatly smooth your path.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Your Hidden Potential (Fe/Si) actually means you have the capacity to connect with others more than you think, especially once you find communities of like-minded individuals; many INTPs cultivate a dry humor and loyal friendliness in comfortable groups, becoming cherished for their quiet wisdom.
                    </p>
                  </div>
                </div>
              </section>

              {/* Guiding Light */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Guiding Light</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    Embrace your role as the insightful explorer of ideas. Your combination of analytical rigor and open-minded curiosity is rare and valuable. The world needs your knack for seeing underlying principles and novel solutions. Just remember that a theory unrealized helps no one – so try to occasionally step out of the think-tank and put your ideas into action or share them in accessible ways.
                  </p>
                  <p className="text-lg leading-relaxed">
                    And remember to show you care (in your own low-key way) to the people important to you; a little warmth goes a long way given your natural cool demeanor. At your best, you illuminate problems with brilliance and advance human understanding, all while maintaining the humility and wonder of a lifelong learner.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default FrameworkArchitect;