import TypeLayout from "@/components/TypeLayout";
import { TypeCoreSection } from "@/components/TypeCoreSection";

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
              <p className="text-lg text-foreground">Empathetic idealists who orient by values, explore humane options, and guide others toward authentic living.</p>
            </div>

            {/* Core Description from Results */}
            <TypeCoreSection typeCode="EII" className="mb-8" />

            {/* Content sections */}
            <div className="space-y-8">
              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    The Critic block for EII contains their weaker pragmatic functions: extroverted sensing (Se) as vulnerable and extroverted logic (Te) as role. Se (1D) is extremely difficult for EIIs – they typically avoid confrontation, heavy competition, or assertive dominance. Aggressive environments can feel toxic to them. When forced to "be tough" or make quick, forceful moves, an EII may either freeze or act uncharacteristically harsh and then regret it. They might have a hard time standing their ground, sometimes being too yielding and later feeling resentful if their boundaries were crossed. Under collapse conditions (e.g., being bullied at work or dealing with a chaotic crisis), an EII can become unusually withdrawn, disheartened, or even physically unwell, as if their psyche is protesting the demand to use Se.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Te as a role means EIIs are aware they should be logical and efficient in certain matters – and they do try. Many EIIs, for instance, are responsible with personal finances or will do research to ensure their decisions (like buying a product or choosing a school) are well-informed. However, they approach Te somewhat mechanically, not joyfully. Prolonged or intense Te work (like managing a large technical project or dealing with a flurry of raw data) drains them. They may become nitpicky or anxious, fearing they'll overlook some crucial detail.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In emotional regulation, EIIs often internalize stress. They might put on a composed exterior (using role-Te to keep functioning at work perhaps) but inside they are churning with unresolved feelings which they don't readily unload. Without a healthy outlet (like talking to a trusted friend or expressing themselves creatively), they can spiral into melancholy or anxiety. At times, a normally gentle EII might snap under pressure with an out-of-character logical criticism ("That's not following protocol!") or a sharp tone, as their patience frays – often surprising those around them.
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
                      Within the Hidden block, EIIs yearn for strength and impact (Se suggestive). They are often quietly drawn to people who are decisive, protective, and can help them take action when they hesitate. A supportive, honorable SLE or LSE type, for instance, can make the EII feel safe to assert themselves, knowing someone "has their back." They also have mobilizing Te, which indicates that in favorable conditions, EIIs do grow more confident in organizing and doing. Many EIIs blossom in adulthood by turning their ideals into practical initiatives – for example, they might head a charity, start a small business aligned with their values, or simply learn to fix household issues independently, proving to themselves they're not as helpless as they once felt.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      The Instinct block houses their dormant powerhouse functions. EIIs have an underrated capacity for analytical rigor (Ti demonstrative) – they often do understand complex systems or theories quite well, but they don't base their identity on being "the logical one." Still, if needed, an EII can dissect an argument or create a structured plan; they just prefer to keep such analysis in service of people rather than as an end in itself. They also possess more will and independence (Si ignoring) than appears at first glance. While they enjoy harmony, many EIIs are perfectly content in solitude and can be surprisingly self-sufficient in managing daily life; they just might not flaunt it. They may maintain a stable routine, personal hobbies, or health practices quietly and diligently, without needing external enforcement – a hint of the strong Si backbone that operates in the background.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Developmentally, EIIs flourish by embracing assertiveness and selective selfishness. As they expand, they learn that saying "no" or standing up firmly for their values in the moment (Se) is not violent or wrong – it can prevent worse conflicts later. They also learn to channel their empathy into tangible results (strengthening Te): instead of merely feeling someone's pain, they organize help for them; instead of dreaming of a better world, they draft a concrete proposal to bring to the town hall. A mature EII retains their heartfelt idealism and deep compassion, but fortifies it with the courage to act and the logic to make those actions count. This balance turns them into quiet but powerful catalysts for positive change.
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

export default IntegrityGuide;