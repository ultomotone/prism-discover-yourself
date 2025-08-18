import TypeLayout from "@/components/TypeLayout";

const TacticalCommander = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">SLE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Tactical Commander</h1>
                  <p className="text-xl text-muted-foreground">Se–Ti • Field Strategist</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Bold tacticians who read the field, enforce clear logic, and act decisively when the moment demands action.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Core */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Core</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    SLEs are bold tacticians, driven by extroverted sensing (Se<sup>–</sup>) base and introverted logic (Ti<sup>+</sup>) creative. Their Se base is 4-dimensional, giving them an immediate, hands-on grasp of the physical environment and social dominance dynamics. As a "minus" Se type, they project a controlled form of power: rather than blind aggression, SLEs are often calculating and precise in how they exert force or influence. They identify the most effective pressure points in a situation – whether that's negotiating a deal, competing in sports, or leading a team – and apply just enough push to get results. They enjoy challenges and are often the first to step into a conflict or take initiative when others hesitate.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Supporting this is Ti<sup>+</sup> creative, which means SLEs use logical structuring to strategize and maintain order in their pursuits. Their Ti is oriented toward expanding frameworks, so SLEs often establish clear rules of engagement or hierarchies ("who's in charge of what") to coordinate group efforts. They can be surprisingly principled about fairness and competence; for instance, even a brash SLE might insist on merit-based decision-making and despise corruption that violates their internal code of honor.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In flow, an SLE is akin to a savvy field commander or a competitive entrepreneur "in the zone." They relish direct engagement with life's obstacles – solving problems in real time, whether through physical action or sharp decision-making. Many SLEs have a kinetic energy; they think best when moving or actively manipulating their environment. They also have a natural air of authority that others tend to acknowledge, even if begrudgingly, which helps them rally people or resources toward a goal.
                  </p>
                </div>
              </section>

              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    The Critic block for SLE holds their weaker intuitive and emotional functions: extroverted intuition (Ne) as vulnerable and extroverted feeling (Fe) as role. Ne (1D) is a nuisance for SLEs – they favor clear, actionable information and find "what-ifs" or theoretical musings either boring or paralyzing. SLEs prefer to react to concrete reality; having to anticipate too many unknown possibilities at once can irritate them. If plans A through Z aren't straightforward, they might ignore B through Y and jump straight to action, trusting they can muscle through surprises as they come. This approach works until it doesn't. In a collapse scenario, like when an SLE faces a situation they can't directly control or force (e.g., an abstract academic conundrum or a slow-burning problem with no immediate fix), they can feel restless and impotent. They may respond by either bulldozing ahead recklessly (sometimes worsening things) or feeling a rare self-doubt that they mask with bravado.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    Fe as a role means SLEs know, at least intellectually, that charisma and charm matter. Many develop a sort of persona to deal with people – they can turn on the swagger, crack jokes, even give impassioned speeches when needed. But unlike natural Fe types, SLEs often feel detached from the emotions they project. It's a tool or a performance, not an integrated state of being.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Under serious stress, the disconnect can show: an SLE might become harshly critical, insensitive, or explosively angry (dropping the polite performance entirely) if they think sentiment is getting in the way of reason or survival. Their emotional regulation tends to involve external outlets: physical exercise, engaging in a fight (literal or competitive), or diving into work. Feelings of vulnerability or sadness are difficult for them to sit with, so they transform those into anger or action, or hide them behind a confident veneer.
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
                      In the Hidden block, SLEs have a soft spot for the gentleness and foresight they often eschew. Ni suggestive means they greatly benefit from having a long-range planner or a philosophical companion by their side – someone who can warn them, "If you rush into this battle, here's what might happen down the line." While they might grumble at such caution initially, SLEs often acknowledge (sometimes only internally) the value of those who can predict outcomes and temper their impulsiveness. Likewise, their mobilizing Fe suggests that as they mature, SLEs put more effort into understanding people's feelings and motivating through inspiration rather than intimidation. A seasoned SLE leader, for example, might learn how to genuinely encourage and reward their team, not just command them. This development of authentic charisma can turn an effective boss into a truly respected one.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Looking at the Instinct block, SLEs possess strong hidden qualities: they have deep personal loyalties (Fi demonstrative) and a well of inventive thinking (Ne ignoring) when straightforward methods fail. An SLE may not talk about morals often, but typically there's a clear "us vs. them" ethic underlying their actions – they protect their own and uphold their version of justice steadfastly. It might not be universalist ethics, but it's a code they stick to (e.g., "never betray a friend," "might makes right as long as you're honorable with your allies," etc.). And while they dislike overthinking, SLEs in a pinch can display surprising creativity – coming up with unorthodox tactics on the fly (their ignored Ne stepping in once brute force and standard logic have been tried).
                    </p>
                    <p className="text-lg leading-relaxed">
                      Growth for SLEs often involves patience and empathy. As they expand, successful SLEs learn that not every problem can be punched through; some require waiting, understanding, or finesse. By learning to read the room emotionally (developing their Fe) and considering outcomes a few moves ahead (listening to Ni), they become far more formidable and less likely to be blindsided. They often transform from lone mavericks or drill sergeants into true champions for their community – still bold and unyielding in crisis, but also wise, and surprisingly considerate of the people they fight for.
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

export default TacticalCommander;