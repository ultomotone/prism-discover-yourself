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
              <p className="text-lg text-foreground">Take-charge, results-oriented person who believes in duty, reliability, and getting things done right.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Core */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Core</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    LSEs are productive organizers, anchored by extroverted logic (Te) base and introverted sensing (Si) creative. Their Te base is 4-dimensional, endowing them with a robust ability to manage tasks, resources, and information efficiently. As a "plus" logic, LSE's Te emphasizes acceleration and results – they believe in working swiftly, pragmatically, and getting tangible outcomes.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    This makes them natural administrators: they excel at coordinating projects, enforcing procedures, and making sure everyone stays on schedule. Their Si creative, meanwhile, focuses on maintaining stability and refining processes. An LSE's Si is about consistency and reducing chaos; they pay attention to practical details like health, comfort, and tradition, ensuring that the environment and routines support productivity.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In an LSE's ideal world, "everything works like a well-oiled machine" – a phrase that encapsulates how their Si (attention to the physical state of things) complements their Te (drive for effectiveness). In flow, LSEs are the dependable workhorses and pillars of their communities. Picture someone happily organizing a complex event – making checklists, delegating tasks, double-checking facilities – all the while greeting people with cordial stability. They take pride in being competent and useful. Their high-dimensional Te Si pair means they leverage both personal experience and learned best practices to solve problems, making them appear seasoned and prepared even in novel situations.
                  </p>
                </div>
              </section>

              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    In the Critic block, LSEs face their blind spots: introverted intuition (Ni) as vulnerable and introverted feeling (Fi) as role. Ni (1D) is extremely challenging for them – LSEs live in the "now" and the concrete; asking them to speculate on far-future possibilities or read between the lines for hidden meanings can yield blank stares or stubborn denial. They often have a bias for action and may neglect long-term vision, focusing instead on immediate needs.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    When Ni issues demand attention (say, an unpredictable industry shift or an existential question of purpose), an LSE can enter a crisis of uncertainty. In such a collapse, they might react by doubling their routine efforts (trying to brute-force the problem with Te) or conversely, feeling uncharacteristically lost and immobilized because their usual methods don't apply.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Fi as a role means LSEs are aware of social courtesies and moral expectations; they want to be seen as decent, friendly people and often follow societal norms for behavior. They can display genuine kindness, but it's typically in practical acts of service rather than emotional effusiveness. Deeply introspecting on feelings or values is less comfortable. Under stress, an LSE might oscillate between overwork (ignoring feelings entirely) and prickly outbursts if they feel underappreciated or if their integrity is questioned. They regulate emotion by doing – burying themselves in tasks or problem-solving to avoid stewing on feelings.
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
                      Lurking in the Hidden block of LSE is a desire for inspiration and meaning (Ni suggestive). They secretly respect visionaries who can guide them on what's coming next or why they're doing all this work. A wise strategic partner or an occasional philosophical talk can ignite their own latent sense of purpose, aligning their hard work with a bigger picture.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Their mobilizing Fi indicates that as LSEs mature, they invest more in understanding people and values: many LSEs eventually develop a strong ethical code or commitment to community, beyond just getting things done. They might become pillars of moral authority in organizations (combining efficiency with fairness).
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      In the Instinct block, LSEs have strengths they seldom advertise. They possess a comprehensive, if background, grasp of theory (Ti demonstrative) and an ability to brainstorm creatively (Ne ignoring) when needed. For instance, an LSE manager might typically enforce standard procedures (Te Si), but when faced with an unprecedented challenge, they can surprisingly devise a clever workaround (drawing on ignored Ne) or analyze the underlying mechanics of a system (Ti) to fix it.
                    </p>
                    <p className="text-lg leading-relaxed">
                      They usually prefer proven methods, but this hidden adaptability means they're not as rigid as they seem – they just save out-of-the-box thinking as a last resort. Developmentally, LSEs flourish by easing up on control and embracing a bit of downtime and reflection. As they expand, learning to trust their team or loved ones (instead of micromanaging) and allowing themselves moments of idle dreaming (honing Ni) can greatly improve their leadership. Likewise, openly acknowledging their feelings (even if awkwardly at first) helps prevent resentment from building. A seasoned LSE stands out as a balanced leader: one who still exemplifies reliability and productivity, but also mentors others with wisdom about life's larger purpose and treats people as more than just roles in a plan.
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

export default OperationsSteward;