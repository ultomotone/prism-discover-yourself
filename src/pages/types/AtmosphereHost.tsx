import TypeLayout from "@/components/TypeLayout";

const AtmosphereHost = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">ESE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Atmosphere Host</h1>
                  <p className="text-xl text-muted-foreground">Fe–Si • Social Facilitator</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Tone-first coordinator who reads the room, lifts energy, and keeps experiences pleasant and on-pace.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Core */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Core</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    ESEs have a vibrant Core block defined by extroverted feeling (Fe⁻) base and introverted sensing (Si⁺) creative. Their 4D Fe base is tuned to the emotional atmosphere around them – they instinctively read and influence people's moods, often acting as the cheerleader or host in social settings. Because their Fe carries a "minus" overlay, ESEs emphasize harmonizing and smoothing over negative emotions.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    They excel at fostering comfort and enthusiasm in others, but do so in a practical, steady way rather than overwhelming drama. This pairs perfectly with their Si⁺ creative function, which is all about sensory well-being, familiarity, and positive experiences in the moment. Si⁺ as an expanding irrational element means ESEs joyfully create cozy, aesthetically pleasing environments and traditions – think of someone who remembers your favorite meal or organizes festive gatherings to make everyone feel at home.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In their flow state, ESEs are like warm suns radiating encouragement: they deftly manage the social "climate" (Fe) while attending to tangible details that keep people comfortable and engaged (Si). Their high-dimensional Fe and Si give them a rich store of personal experience and cultural norms to draw upon, making them confident event organizers, counselors, or community builders who intuitively know just what gesture will brighten someone's day.
                  </p>
                </div>
              </section>

              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    The Critic block of an ESE contains their more analytical, impersonal sides – introverted logic (Ti) as the vulnerable function and introverted intuition (Ni) as the role. Ti being 1-dimensional means ESEs struggle with cold logic, complex systems, or abstract frameworks that lack a human element. They can feel anxiety when pressed to analyze things purely logically or when dealing with rigid rules; it threatens their natural interpersonal focus.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    During collapses (e.g. when swamped by data or bureaucratic tasks), an ESE may become unusually disorganized or defensive, as if their mental framework "short-circuits." They may also take critique of their methods very personally due to this weak Ti. Their Ni role (2D) allows ESEs to occasionally think ahead or consider long-term implications – for instance, they can plan for future events or sense when current harmony might not last – but this foresight is not a comfortable strength.
                  </p>
                  <p className="text-lg leading-relaxed">
                    They prefer the immediacy of the present (Si) and the visible mood of the group (Fe) over distant planning. In emotionally trying times, ESEs can swing between bursts of worry about the future (Ni role kicking in pessimistically) and an urge to simply do something positive right now to fix the mood. Their emotional regulation strategy is largely externalized: they talk out their feelings, seek support, and try to actively change negative atmospheres, which generally helps them bounce back. However, if isolated or forced to dwell on impersonal problems, they may feel helpless or drained.
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
                      In the Hidden realm, ESEs have an unspoken aspiration for intellectual structure and independence (Ti suggestive) – they actually admire those who are logical and principled, and they benefit from partners or colleagues who can supply clear reasoning or technical know-how. Likewise, their mobilizing Ni gives them a budding interest in deeper meanings and future vision; as they grow, many ESEs develop an appreciation for philosophy, spirituality, or strategic thinking to complement their natural pragmatism.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      The Instinct block of the ESE holds robust yet background capabilities. They have strong unconscious intuition of possibilities (Ne demonstrative) and an ability to assert or enforce boundaries when needed (Se ignoring, which at 3D strength can surface if someone they care about is threatened). Typically jovial and accommodating, an ESE might surprise others by taking charge decisively in a crisis (tapping into unused Se) or generating a flurry of creative ideas in a brainstorming session (latent Ne).
                    </p>
                    <p className="text-lg leading-relaxed">
                      Over time, ESEs expand by tempering their eagerness to please with a bit of objective Ti clarity – learning that sometimes saying "no" or stepping back to analyze won't alienate others. They also become more comfortable with quiet and solitude (developing Ni's patience) so they aren't always "on." Ultimately, a mature ESE retains their infectious optimism and kindness while gaining more analytical savvy and foresight, resulting in a well-rounded facilitator who can guide communities with both heart and mind.
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

export default AtmosphereHost;