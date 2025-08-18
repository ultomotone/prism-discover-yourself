import TypeLayout from "@/components/TypeLayout";

const BoundaryGuardian = () => {
  return (
    <TypeLayout>
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
              {/* Core */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Core</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    ESIs are steadfast guardians of values, defined by introverted feeling (Fi⁻) base and extroverted sensing (Se⁺) creative. Their Fi⁻ base is deeply evaluative and selective: as a 4D function, it processes a lifetime of personal experiences and moral impressions to draw clear lines about who and what is important.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Because it's a "minus" ethics, ESI's Fi is focused on refining relationships – distinguishing genuine bonds from superficial ones, holding themselves and others to high standards of loyalty, and, if necessary, cutting ties when their inner compass says something is off. This gives ESIs a reputation for being principled, private, and sometimes stern, but also incredibly trustworthy to those in their inner circle.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Paired with this is Se⁺ creative, a 3D function that they use to actively defend and implement their values in the real world. Their Se is expansive and forceful when needed: ESIs can take charge of situations, assert boundaries, and ensure that practical matters align with their sense of right and wrong. In a flow state, an ESI might not appear "flowy" in the relaxed sense, but they exhibit a confident solidity – like a vigilant sentinel or a conscientious manager, smoothly handling responsibilities and protecting loved ones' welfare. They find satisfaction in knowing things are under control and aligned with what they care about.
                  </p>
                </div>
              </section>

              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    The Critic block for ESI contains their more imaginative but weaker side: extroverted intuition (Ne) as vulnerable and extroverted logic (Te) as role. Ne (1D) is where ESIs struggle; they have difficulty with open-ended what-ifs, uncertain plans, or highly abstract brainstorms. They prefer known quantities and concrete truths – the endless "maybe this, maybe that" of Ne can make them anxious or impatient.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    When forced into scenarios of high ambiguity or when plans fall apart, an ESI may experience collapse in the form of pessimism and rigidity: they double down on what they know and may reject any novel alternatives outright, even ones that could help, because they feel so uncomfortable in uncharted waters. Te as a role (2D) means ESIs try to be logical and efficient when the situation calls for it – and indeed, they are often quite competent in practical life management.
                  </p>
                  <p className="text-lg leading-relaxed">
                    But their logic is in service of Fi/Se goals (e.g. they'll budget money to ensure family security or research a problem to safeguard someone's health). They don't analyze for analysis' sake. In emotionally charged moments, their role Te can manifest as blunt, matter-of-fact statements or advice-giving, which might seem unsympathetic even though their intent is to help. If overstressed, an ESI can become overly controlling and critical: their Fi can turn into harsh judgment of others, and their Se might become domineering, especially if they feel someone's irresponsibility (Ne chaos) is endangering what they value.
                  </p>
                </div>
              </section>

              {/* Hidden & Instinct */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Hidden & Instinct</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Hidden Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      In the Hidden block, ESIs hold a quiet admiration for visionary creativity (Ne suggestive) – they often enjoy having an imaginative friend or partner who can introduce new ideas in a non-threatening way. Such influences can gently broaden the ESI's horizons and show them that exploring possibilities won't betray their principles.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Likewise, their mobilizing Te indicates a genuine willingness to learn and improve their competencies; many ESIs, as they grow, take pride in mastering factual knowledge and might even become subject-matter experts, so long as the knowledge serves their ethical framework (for example, an ESI might become a nutrition expert to better care for their family's health).
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Regarding the Instinct block, ESIs have strong latent abilities in areas they don't flaunt. They possess steadfast internal logic (Ti demonstrative) – they actually can parse complexity and understand systems, but they use it mostly to reinforce their Fi convictions rather than for abstract debate. They also have an untapped capacity for social charm and levity (Fe ignoring), which occasionally surfaces in relaxed settings: an ESI who feels safe might show a surprisingly warm sense of humor or heartfelt expressiveness that contradicts their usual stoic image.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Over time, ESIs expand by learning to let a bit more chaos in – realizing that not all change is bad and that forgiveness and flexibility have a place alongside duty. When they temper their protective seriousness with openness (maybe embracing a hobby that's "just for fun" or allowing a loved one to take a risk and supporting them regardless of outcome), they actually strengthen their bonds and inner peace. A mature ESI remains a rock of dependability and integrity, but also knows how to adapt and enjoy life without feeling that everything is a moral test. This balance makes them powerful advocates for good – firm yet kind, cautious yet hopeful.
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

export default BoundaryGuardian;