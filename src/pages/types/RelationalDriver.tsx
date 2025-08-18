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
              {/* Core */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Core</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    SEEs are dynamic go-getters with a Core of extroverted sensing (Se) base and introverted feeling (Fi) creative. As a 4D base, Se gives SEEs a keen awareness of the present reality – they notice opportunities, resources, and power dynamics in their environment and are quick to act on them. Their Se comes with a "plus" charge, meaning it's an expanding, enterprising force.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    SEEs push boundaries and generate momentum: they'll initiate projects, galvanize people into action, and often take the lead in a very hands-on fashion. They thrive on excitement and visible progress – one can picture an SEE as the director who orchestrates events or the entrepreneur making bold moves in a market. Supporting this is Fi creative, which in their case provides a personal touch and moral compass to their use of power.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Unlike a purely aggressive type, SEEs actually care about individual relationships and loyalties; their Fi allows them to charm others, build alliances, and align actions with heartfelt values (albeit selectively). As a "minus" Fi, they tend to have a discerning approach to friendship – they'll fiercely protect their inner circle and may show open skepticism or coldness to outsiders until trust is earned. In flow, an SEE is like a charismatic field commander or social influencer: confidently handling immediate challenges, negotiating on the fly, and infusing their interactions with personal warmth or flair.
                  </p>
                </div>
              </section>

              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    The Critic block of SEE features their less natural abstract side – extroverted intuition (Ne) as role and extroverted logic (Te) as vulnerable. Ne (2D) is something SEEs use occasionally: they can brainstorm or engage with imaginative ideas, especially if it helps them further a concrete goal ("Sure, let's consider some out-of-the-box tactics to win this client"). However, endless theorizing or indecision by exploring too many options frustrates them. They prefer to pick a promising idea and run with it rather than overanalyze.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Te (1D) is the weak spot: SEEs are not naturally systematic or detail-oriented with facts and data. Dealing with tedious logistics, complex technical details, or impersonal criteria can bog them down. In collapses – say, when an SEE is forced into paperwork or must follow strict procedures – they can become irritable, cut corners, or delegate the task entirely.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Likewise, if their impulsive decisions backfire, they might lack the Te calm to methodically troubleshoot, and instead react with impatience or by doubling down with more force (Se) which isn't always the right solution. They also might struggle to objectively measure outcomes; an SEE could get so caught up in winning people over (Fi) or making a splash (Se) that they neglect accounting or long-term planning, leading to sudden crises (like financial issues). Emotionally, SEEs are passionate and can have a short fuse (a product of strong Se under stress).
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
                      In their Hidden block, SEEs quietly appreciate wisdom and foresight (Ne suggestive). They actually enjoy when someone can show them a bigger picture or a future implication they hadn't considered – as long as it's presented supportively, not as criticism. A partner who occasionally says, "Have you thought about where this leads in a year?" can help the SEE temper their impulsivity without dampening their drive.
                    </p>
                    <p className="text-lg leading-relaxed">
                      They also have a mobilizing Te, meaning over time they recognize the value of a bit of organization and expertise. Many SEEs, especially later in life, take pride in learning some hard skills or business savvy to complement their people skills; for example, an SEE entrepreneur might force themselves to learn accounting basics or an SEE community leader might study project management – not because they love it, but because they see it's necessary to protect their interests.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Meanwhile, the Instinct block grants SEEs some formidable quiet powers. They have strong holistic logic (Ti demonstrative) – often a knack for understanding underlying structures or rules of a game, even if they claim to dislike theory. This can emerge when strategizing (an SEE might not articulate a formal plan, but they intuitively "get" the framework and how to exploit it). They also possess deep wells of imaginative thought (Ni ignoring) that they don't often show; in private moments, SEEs can be surprisingly reflective, occasionally sensing when their current path might lead to burnout or envisioning a long-term legacy they want.
                    </p>
                    <p className="text-lg leading-relaxed">
                      However, they tend to push those Ni whispers aside in favor of immediate pursuits, unless circumstances force reflection. The developmental journey of an SEE involves learning to moderate their high-impact style with patience and foresight. As they expand, they often become more considerate leaders who can balance action with strategy. They remain bold and engaging – the sparkplug of their communities – but grow better at picking their battles and planning for the future, which in turn secures the lasting loyalty and success they naturally seek.
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

export default RelationalDriver;