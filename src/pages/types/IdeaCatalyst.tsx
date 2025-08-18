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
              {/* Profile */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Profile</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    You are an energetic innovator and natural questioner of the status quo, known for your quick wit and love of debate. As an ENTP, your dominant Extraverted Intuition (Ne) makes you a fountain of ideas – you're constantly exploring possibilities, spotting hidden connections, and challenging assumptions to see things in a new light. You thrive in environments where you can brainstorm and bounce off different concepts; in fact, playing with ideas is your idea of fun.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    You tend to approach life with a sense of intellectual playfulness – rules are flexible, and almost anything can be reimagined or improved. Auxiliary Introverted Thinking (Ti) gives you a solid logical core to evaluate and refine all those ideas. You enjoy dissecting arguments and theories to ensure they make sense, and you can be quite analytical, even if you present it in a light, humorous way.
                  </p>
                  <p className="text-lg leading-relaxed">
                    ENTPs are often called the "Debater" or "Visionary" type: you're the person in a meeting who says, "Devil's advocate: what if we tried this approach...," or the friend who sparks a lively discussion on some offbeat topic that others never considered. You're typically outgoing, enthusiastic, and not afraid to question authority or tradition. This can make you a leader in innovation – you're willing to take risks and experiment.
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
                      Socially, people are drawn to your charismatic energy; you likely have a knack for storytelling and making others laugh with clever observations. However, you also don't shy away from argumentative banter – in fact, you find a good debate intellectually stimulating, not personal. You bring a unique mix of inventiveness and reason that often leads to breakthroughs (or at least very entertaining conversations).
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">In Flow</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      You feel at your best when you're solving a complex problem in a novel way or engaged in spirited idea exchange. You might hit a flow state designing a new invention or startup concept, improvising in a hackathon, or engrossed in philosophical debate at 2 AM. Time flies as you generate possibilities and logically riff on them; it's like your mind is "on fire" in the best way.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Another flow trigger for ENTP can be competition – not so much physical, but mental competitions (chess, strategic games, pitching ideas) where you get to outsmart opponents. You love the challenge and unpredictability, and even if others find it intense, you experience it as exhilarating.
                    </p>
                  </div>
                </div>
              </section>

              {/* Internal Critic & Growth */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Internal Critic & Growth</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Focus & Follow-Through</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      The flip side of your strengths involves focus and follow-through. Your Internal Critic block (tertiary Fe, inferior Si) can lead to difficulties in routine maintenance and occasionally in understanding emotional nuances. Details, repetition, and patience for step-by-step execution can bore you to tears. You prefer the rush of a new idea's inception to the grind of implementation.
                    </p>
                    <p className="text-lg leading-relaxed">
                      As a result, you might internally kick yourself for not finishing projects or for neglecting practical logistics until they become urgent. "Ugh, I could have done even better if I'd studied rather than cramming last minute" or "Why do I keep misplacing these files?" – those self-admonishments might sound familiar.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Under Stress</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Under stress, this can worsen; you may become overly rigid suddenly (a panicked attempt to use Si – e.g., obsessively organizing your bookshelf instead of tackling a looming deadline) or you might retreat to nostalgia, reminiscing about past successes rather than dealing with the chaotic present.
                    </p>
                    <p className="text-lg leading-relaxed">
                      In moments of personal stress (say, a major failure or conflict), ENTPs might also swing into an Fe grip response: suddenly feeling very emotional, insecure about how others perceive them, or even lonely. This is often fleeting, but it can be perplexing for someone who usually prides themselves on rational detachment.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Emotional Considerations</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      On the Fe (Extraverted Feeling) side, while you're generally sociable, reading or catering to others' deeper emotions doesn't come naturally. You might prefer to keep things light and intellectual, sometimes avoiding or inadvertently bulldozing over feelings. When your Fe is underdeveloped, you might get feedback that you come off as argumentative or insensitive, especially if you treat debates as a sport while others take the content to heart.
                    </p>
                    <p className="text-lg leading-relaxed">
                      You usually mean no harm – in fact, you often enjoy playing with opposing viewpoints, not necessarily because you believe them, but to stimulate discussion. However, not everyone gets that, so part of growth is learning when to apply tact or just listen without jumping in to debate every point.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Development Path</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      First, try to practice finishing some of what you start. You certainly don't need to curb your idea generation – that's your superpower – but pick a few high-impact ideas and see them through. Using external aids (reminders, delegating detail-work to others if possible, or setting structure by breaking tasks into mini-challenges for yourself) can trick your brain into handling the boring parts.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Second, refine your people skills: you already have charm; adding empathy and active listening will make you truly influential. Your Hidden Potential block (Fe/Si) indicates that you can indeed learn to attend to people's emotional needs and to established conventions when it serves you. Drawing on Si can give you depth; connecting new ideas with historical knowledge or personal past experiences can ground your innovations and make them more viable.
                    </p>
                  </div>
                </div>
              </section>

              {/* Guiding Light */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Guiding Light</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    Never lose your spark of innovation and cleverness – it's what makes you uniquely you. You excel at seeing what others overlook and injecting fresh perspectives that propel progress. Your talent for arguing both sides and thinking outside the box is a gift. Just be mindful to sometimes slow down and consider the human element and practical steps, because those are what turn a clever idea into a world-changing reality.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In essence, keep being the daring thinker and interlocutor, but remember: the goal isn't just to win debates, it's to advance understanding (and have fun doing it). When you align your debate skills and creativity towards constructive ends, you'll find yourself in a state of flow that not only exhilarates you, but earns you respect and genuine admiration from others.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default IdeaCatalyst;