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
              <p className="text-lg text-foreground">Far-sighted strategist who maps complex scenarios and refines concepts to withstand real-world conditions.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Core */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Core</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    ILIs have a Core defined by introverted intuition (Ni⁺) as a 4-dimensional base and extroverted logic (Te⁻) as a 3-dimensional creative function. Their Ni⁺ base gives them penetrating insight into the flow of time, patterns, and probabilities; they naturally envision how situations will unfold and spot potential outcomes long before others do.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Because this Ni is a "plus" overlay, ILIs are expanding intuitives – they aren't afraid of chaos and change, seeing disruptive shifts as opportunities for evolution and improvement. Their Te⁻ creative function complements this with an analytical drive to test ideas in reality and strip away impractical fluff.
                  </p>
                  <p className="text-lg leading-relaxed">
                    An ILI in flow resembles a far-sighted strategist or sage: quietly absorbing information, mapping out complex scenarios in their mind, and deftly refining concepts to withstand real-world conditions. They excel at cognitive economizing – doing the most with the least effort – by foreseeing which avenues will pay off and focusing their energy there. ILIs often work in bursts of inspired concentration, preferring to perfect a plan internally before acting.
                  </p>
                </div>
              </section>

              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <p className="text-lg leading-relaxed mb-4">
                      The Critic (Super-ego) block for ILI contains extroverted feeling (Fe) as a painful vulnerable spot and extroverted sensing (Se) as a role function. Fe (1D) is an area of genuine discomfort: ILIs struggle with overt emotional expression and may feel embarrassed or drained by high-emotion environments. They often maintain a composed, even detached exterior to avoid chaotic feelings.
                    </p>
                    <p className="text-lg leading-relaxed mb-4">
                      Under stress, they can seem pessimistic or dismissive – a defensive stance when they cannot parse the emotional climate. Their Se role (2D) means they can step up with practical action or decisiveness when absolutely required (for instance, handling a sudden crisis), but it doesn't come naturally and is not sustained. They're inherently not aggressive; they apply just enough Se to assert boundaries or meet external expectations, then retreat back into observation.
                    </p>
                    <p className="text-lg leading-relaxed">
                      In collapse, an ILI may become excessively withdrawn and critical – seeing only looming threats or errors (Ni in a negative loop) and ignoring opportunities. They might fixate on worst-case scenarios while neglecting immediate action, leading to stagnation or missed chances. Emotionally, their regulation style is often intellectualized – they prefer calm, reasoned discussions and may privately funnel feelings into solitary hobbies (like writing or gaming) rather than outward displays.
                    </p>
                  </div>
                </div>
              </section>

              {/* Hidden & Instinct */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Hidden & Instinct</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Hidden Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      The Hidden block holds the ILI's unspoken desires: they deeply yearn for positive emotional environments and enthusiasm from others (Fe suggestive) to draw them out of their shell, and they have a latent potential for personal passion and adventure via Se mobilizing. When supported by close allies or a pleasant atmosphere, ILIs can surprise people by showing dry wit, gentle humor, or sudden bursts of willpower to champion a cause they care about.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Over time, many ILIs expand by nurturing these latent parts – seeking out warm relationships or creative outlets that allow them to express feelings safely, and gradually building confidence in acting on their insights.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      In the Instinct block, ILIs have significant untapped strengths: introverted feeling (Fi ignoring) and extroverted intuition (Ne demonstrative) are high-dimensional for them. This means an ILI often has a quiet moral compass and empathy that they don't flaunt, as well as a rich imagination for alternative possibilities (Ne) that they use in playful or hypothetical contexts.
                    </p>
                    <p className="text-lg leading-relaxed">
                      They might craft complex fictional worlds in their mind or understand people's motivations more than they let on, using these skills as a behind-the-scenes guide. The developmental tone for ILIs involves moving from a cautious observer into a more engaged visionary: as they learn to trust others and themselves, their insights gain practical impact and their reserved demeanor softens into something akin to wisdom balanced with modest kindness.
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