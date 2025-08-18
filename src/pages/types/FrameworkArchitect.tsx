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
              {/* Core */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Core</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    LIIs are characterized by a Core of introverted logic (Ti) base and extroverted intuition (Ne) creative. Their Ti base is a 4D engine of analysis that seeks conceptual clarity and structural accuracy in everything. As a "minus" logic, LII's Ti focuses on refining and reducing ideas to their essentials – categorizing, defining, and removing inconsistencies (imagine a diligent architect of theories or a sage librarian sorting knowledge).
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    They naturally form mental frameworks and principles to understand the world, relying on a vast store of learned information and internal rules. Supporting this is Ne creative, a 3D function that injects curiosity and breadth of imagination. LII's Ne is expansive and exploratory: they love contemplating theoretical possibilities, proposing alternate interpretations, and spotting latent potentials in a given system or person.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In flow, a LII often resembles a thoughtful analyst or philosopher. They become wholly absorbed in problem-solving or learning – fitting pieces into a logical whole, while simultaneously entertaining innovative angles. The synergy of strong Ti and Ne means LIIs can be remarkably innovative thinkers: the Ti gives them rigor and depth, and the Ne allows them to think outside conventional bounds. They tend to enjoy complex intellectual challenges (puzzles, strategy, academic research) and often have a quietly confident command of their areas of expertise, even if they're modest about it.
                  </p>
                </div>
              </section>

              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    The Critic block for LII houses extroverted sensing (Se) as vulnerable and extroverted feeling (Fe) as role. Se (1D) is the bane of the LII – direct confrontation, high-pressure action, and managing real-world physical urgencies can leave them stressed and ineffectual. LIIs are not naturally forceful or spontaneous; when pushed into highly competitive or rapidly changing environments, they might "freeze" or defer to others.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    In collapse moments (say, being in a chaotic workplace or facing aggressive personalities), the usually logical LII can become indecisive, passive, or retreat into overthinking as a defense. Fe as a role (2D) means LIIs are aware of social expectations to some extent and will attempt to be courteous or engaging, but it's more of an intellectual effort than an inherent talent. They might mimic social niceties or crack a rehearsed joke, yet still come off a bit stiff or detached.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Strong emotions in others confuse them; they prefer communication that is calm and rational. Under stress, an LII might oscillate between blunt criticism (if their patience frays, they can voice harsh Ti judgments) and people-pleasing (feigned smiles or agreeing just to avoid further conflict), indicating the strain between their logical core and feeble Fe. Emotional regulation for them is usually a solitary affair: they cool off by reading, analyzing the situation alone, or escaping into imaginative worlds, rather than actively seeking comfort from people (which might feel too messy or unpredictable).
                  </p>
                </div>
              </section>

              {/* Hidden & Instinct */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Hidden & Instinct</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Hidden Aspirations</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      In the Hidden block, LIIs secretly yearn for some of the vibrancy they lack: they deeply admire those who are bold and action-oriented (Se suggestive) and often wish they themselves could manifest their ideas in a tangible, influential way. A partner or friend who provides gentle pushes to act can help the LII's hidden confidence bloom.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Their mobilizing Fe indicates that, given a safe space, LIIs do develop warmer interpersonal skills and even a playful humor – many LIIs have a quirky, deadpan wit and a caring side that emerges with people they trust.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Meanwhile, the Instinct block contains their silent proficiencies. LIIs have robust internal ethical understanding (Fi demonstrative) and practical know-how (Si ignoring) beyond what they advertise. Though not outwardly emotive, a LII often has strong loyalty and integrity; they quietly hold personal values (Fi) that guide whom they befriend or what causes they support.
                    </p>
                    <p className="text-lg leading-relaxed">
                      And while they may neglect their physical needs at times (poor Si consciously), they usually have a baseline of routines or self-care habits they stick to almost reflexively. Over time, LIIs expand by incorporating a bit of "worldly" engagement – pushing themselves to test their theories in reality, taking on leadership roles in niche areas, or asserting their boundaries when needed. By embracing incrementally more Se (perhaps via hobbies like sports or DIY projects) and learning emotional expression in small steps, LIIs become more well-rounded. In maturity, an LII can transform into a formidable yet humble intellectual force – someone who not only devises elegant models of understanding but can also shepherd those ideas into practice with the help of a supportive network, all while staying true to their principled core.
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

export default FrameworkArchitect;