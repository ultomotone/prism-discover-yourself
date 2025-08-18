import TypeLayout from "@/components/TypeLayout";

const ComfortHarmonizer = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">SEI</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Comfort Harmonizer</h1>
                  <p className="text-xl text-muted-foreground">Si–Fe • Experiential Caregiver</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Atmosphere tuner who notices bodily cues, smooths the room, and makes experiences feel right.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Core */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Core</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    SEIs are gentle enthusiasts at heart, defined by introverted sensing (Si⁺) base and extroverted feeling (Fe⁻) creative. Their 4D Si gives them a profound connection to the here and now of comfort, aesthetics, and bodily/emotional well-being. SEIs notice subtle details in their environment – the coziness of a room, the taste of a meal, the vibe among people – and seek to make those experiences pleasant and harmonious.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    With Si⁺ being an expanding function, they love introducing small joys and creative refinements into everyday life (like adding a personal touch to their home or perfecting a favorite recipe) in order to increase overall happiness. Their Fe⁻ creative function means they use a soft touch with emotions: they might cheer up a friend with a quiet gesture or smooth over tensions with a light joke, rather than grand emotional displays.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In flow, an SEI is like a nurturing artisan or a calm caretaker – fully absorbed in savoring life's simple pleasures and helping others relax. They excel at flowing with the moment, adapting their behavior to maintain a peaceful, positive atmosphere. This type often has a playful, sometimes whimsical humor and a knack for making others feel accepted as they are. They draw on rich personal experience and social intuition to know what will comfort or amuse people, making them excellent mediators, hosts, or supportive friends.
                  </p>
                </div>
              </section>

              {/* Critic */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Critic</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    The SEI's Critic block contains more hard-edged functions: extroverted logic (Te) as vulnerable and extroverted intuition (Ne) as role. Te (1D) is the Achilles heel – SEIs find dealing with strict efficiency, data analysis, or impersonal taskmastering to be highly stressful. If pressured to hurry up, meet tight deadlines, or quantify everything logically, they can become anxious or disengaged.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    During collapse mode (like in a high-pressure work environment with no personal element), an SEI may procrastinate, become scatterbrained, or even emotionally shut down, as they lack confidence in purely logical problem-solving. Their Ne role (2D) means they can entertain new ideas or possibilities to a degree – SEIs might enjoy daydreaming, trying new hobbies, or considering "what ifs" when it's fun. But if they must constantly brainstorm or face unpredictable change, it wears on them.
                  </p>
                  <p className="text-lg leading-relaxed">
                    They prefer the familiar and the concrete (Si) over being thrown into wholly novel situations. Under stress, an SEI's usually easygoing demeanor can turn into stubbornness or passive-aggressive resistance, a reaction from feeling overwhelmed by demands outside their comfort zone. In terms of emotional regulation, SEIs cope by retreating to safe, soothing activities (a favorite book, nature walk, comfort food) and seeking out empathetic company. They may downplay conflict or negativity (sometimes to their detriment) just to keep inner peace.
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
                      Hidden within the SEI is a genuine respect for those who are highly competent and organized (Te suggestive) – they often appreciate having someone else handle the nitty-gritty logistics or big decisions, while they contribute in subtler ways. They also possess a quiet curiosity (Ne mobilizing) about the broader world; in a supportive setting, SEIs gradually venture out of their routine to explore new experiences or creative pursuits, surprising others with their latent ingenuity.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Instinct Block</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      The Instinct block provides SEIs with dormant strengths: they have strong, if unacknowledged, analytical reasoning (Ti demonstrative) and a capacity for firm willpower (Se ignoring) when truly necessary. For example, an SEI might normally avoid confrontation, but if a loved one is threatened, they can assert themselves quite effectively (Se that normally stays "invisible" comes forth). Or, while they dislike formal logic games, they may still solve everyday problems with quiet cleverness (using Ti in the background).
                    </p>
                    <p className="text-lg leading-relaxed">
                      Over the long term, SEIs expand by building confidence in their abilities and tolerating a bit more structure. Learning some Te skills – like basic planning or time management – can greatly empower them without eroding their easygoing nature. Likewise, indulging their Ne by meeting new people or engaging in creative arts can enrich their life and resilience. The maturing SEI remains a source of solace and lighthearted fun but gains more assertiveness and self-reliance, enabling them to handle life's bumps without losing their inner calm.
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

export default ComfortHarmonizer;