import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";

const Fi = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/te">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Te
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/fe">
              Next: Fe
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Fi – Relational Ethics</h1>
              <p className="text-xl text-muted-foreground">Introverted Feeling</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Narrative Definition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-3"></span>
                Narrative Definition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Introverted Feeling (Fi) is the evaluative function focused on personal values, inner emotional integrity, and one-on-one relationships. Often referred to as "relational ethics," Fi governs how we judge the human world in terms of authenticity, morals, and heartfelt connections. Where Ti seeks logical consistency, Fi seeks emotional consistency with one's true self and loved ones.
              </p>
              <p>
                It involves a rich inner compass of feeling: likes and dislikes, moral convictions, deep empathy for certain others, and an acute awareness of the quality of relationships. A person strong in Fi is guided by a sense of what feels right or wrong on a personal level. They strive to align their actions with their inner values and to understand the emotional significance of events.
              </p>
              <p>
                Fi doesn't broadcast emotions loudly (that's more Fe's realm); instead, it processes feelings inwardly, resulting in a nuanced, steady sense of care or distaste that may not be immediately visible to others. Key themes of Fi include loyalty, authenticity, empathy for individuals (rather than groups), and principled decision-making based on personal ethics.
              </p>
              <p>
                Those who favor Fi often come across as private or selective with their feelings: they may not outwardly express much, but they feel deeply. They take time to truly know people, forming close bonds with a chosen few. Their judgments about people or situations are influenced by this inner metric of values – they might say, "This just isn't me," or "I couldn't live with myself if I did that."
              </p>
              <p>
                Fi is also associated with empathy in a focused sense: Fi users can often put themselves in another specific person's shoes, especially someone they care about, and feel keenly what that person must be feeling. However, unlike Fe which radiates outward, Fi's empathy might manifest as quiet concern or private actions taken to support someone, rather than overt demonstrations of emotion.
              </p>
              <p>
                In summary, Fi represents the quiet flame of personal conscience and caring. It's the part of the psyche that asks, "Is this true to who I am and those I love? Do I feel good in my heart about this?" – and will gently, but firmly, guide the person toward choices that resonate with that inner truth.
              </p>
            </CardContent>
          </Card>

          {/* Dimensionality Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-secondary rounded-full mr-3"></span>
                Dimensionality Mapping (1D–4D)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The depth of Fi – how nuanced and effective it is – depends on its dimensional development:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">1D Fi (Experience Only)</h4>
                  <p>
                    The person's understanding of feelings and values is limited to their own firsthand emotional experiences. They can empathize or judge only to the extent that they themselves have felt something similar. Their moral sense is quite concrete and possibly black-and-white, based heavily on what they were taught early on or felt in specific instances.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">2D Fi (Experience + Norms)</h4>
                  <p>
                    Incorporates learned social or cultural values on top of personal feeling. The person starts to understand broader notions of right and wrong as defined by family, religion, or community. They may adopt moral rules and emotional etiquette because that's what they've learned is correct, though their personal emotional insight can be somewhat formulaic.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">3D Fi (Experience + Norms + Situation)</h4>
                  <p>
                    Brings much richer contextual awareness to feelings. The individual becomes adept at reading subtle emotional atmosphere and understanding variations in personal values across different situations. Their empathy becomes more flexible, and they develop a more refined personal code shaped by reflecting on various life experiences.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">4D Fi (All Dimensions + Time)</h4>
                  <p>
                    Represents profound emotional wisdom. The person has extensive personal emotional experiences, knowledge of cultural values, situational empathy, and foresight about emotional dynamics over time. They can predict how decisions will impact relationships long-term and strive to make choices they can live with years down the line.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block Manifestation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-accent rounded-full mr-3"></span>
                Block Manifestation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                Now let's examine Fi in each of the four PRISM positions and how its character changes:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary">Core (Core Drive Position)</h4>
                  <p>
                    Fi in the Core position means the person's identity and strengths are deeply tied to their values and personal relationships. Fi-Core individuals live by an internal moral compass and have great confidence in their heart's guidance. Because Fi is strong and valued here, they wield it with ease and pride.
                  </p>
                  <p>
                    These are people who often come across as deeply sincere, caring, and principled. In daily life, Fi-Core manifests as consistent attention to the human element: they remember little details about what matters to loved ones, make decisions based on gut feelings of right/wrong, and might quietly ensure everyone in a group feels personally acknowledged.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary">Critic (Internal Critic Position)</h4>
                  <p>
                    Fi in the Critic position indicates a person for whom personal feelings and ethical nuances are weak areas that often cause discomfort or insecurity. Such individuals typically do not trust their own emotions or values much, and they may even disparage "soft" feelings in themselves.
                  </p>
                  <p>
                    Because Fi here is conscious enough to nag them but not skilled, they are aware that they ought to relate to people's feelings or have firm personal principles, but they feel relatively clueless or inept about it. They often have a sense of being obliged to show appropriate care, but it comes from the head, not the heart.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-accent">Hidden (Hidden Potential Position)</h4>
                  <p>
                    When Fi sits in the Hidden Potential block, the individual earnestly cares about matters of the heart and ethics, but finds themselves weak in navigating them independently. Think of someone who deeply yearns for close connection and moral clarity, yet often feels lost or shy in the emotional realm.
                  </p>
                  <p>
                    Fi-Hidden individuals typically adore experiencing genuine affection and understanding from others – it's like a warmth they can't easily generate on their own, so they bask in it when offered. They tend to idolize certain values or people, and with support, their latent empathy and integrity can blossom significantly.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-muted-foreground">Instinct (Instinctive Self Position)</h4>
                  <p>
                    Fi in the Instinctive Self block produces an individual who is naturally good at empathy and maintaining personal principles, yet underplays these strengths as trivial or purely private. These people often demonstrate considerable emotional intelligence or loyalty in practice, but they don't trumpet it or even necessarily notice it in themselves.
                  </p>
                  <p>
                    They might quietly remember everyone's birthdays and preferences, or be the one coworkers confide in when upset, because they give off a vibe of trustworthiness and non-judgmental listening. However, they typically don't center their identity on being "the empath" or "the moral compass."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strength Expression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-3"></span>
                Strength Expression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Strong Fi prowess can be recognized through a constellation of subtle but profound behaviors:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Empathic attunement to individuals – they seem to just understand what close friends or partners are going through</li>
                <li>Consistency between their beliefs and actions – they live in line with their values as much as possible</li>
                <li>Rich inner life evident through creative or personal outlets that reflect who they are</li>
                <li>Loyalty and depth in relationships – they form lasting bonds and remember important personal details</li>
                <li>Quiet championing of their loved ones' well-being, often behind the scenes</li>
                <li>Non-judgmental listening that makes them approachable confidants</li>
                <li>Moral or emotional authority that others recognize – they're described as having a "big heart"</li>
                <li>Resistance to peer pressure when it conflicts with what they feel is right</li>
                <li>Ability to articulate their feelings and values with clarity once trust is established</li>
                <li>Extension of empathy to animals, nature, and causes – standing up for the voiceless</li>
              </ul>
              <p>
                All these behaviors indicate that Fi is operating at a high level of proficiency, guiding the person's life with a sure yet gentle hand. They embody empathy and ethics, using those as a powerful, positive force in their life and others' lives.
              </p>
            </CardContent>
          </Card>

          {/* State & Overlay Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-secondary rounded-full mr-3"></span>
                State & Overlay Shifts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Fi, being internally oriented, can be profoundly affected by the person's emotional state and external stressors:
              </p>
              
              <div>
                <h4 className="font-semibold">Positive Flow State</h4>
                <p>
                  In a positive, flow state, Fi users exhibit the best of their empathy and principled behavior. When they feel safe, appreciated, and calm, their emotional radar and capacity for compassion expand. They experience what might be called empathic flow, where responding to others feels almost effortless and rewarding.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Under Stress</h4>
                <p>
                  Under stress, Fi can contract and skew in several ways. One common effect is that a stressed Fi user becomes emotionally reclusive or guarded, withdrawing from others to sort out tumultuous feelings alone. Another effect is values-confusion or guilt spirals, where they start doubting themselves and questioning their own feelings and ethics.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Shadow Flips</h4>
                <p>
                  In high stress, some Fi users experience unexpected emotional outbursts – behavior that's out of line with their core self and later deeply upsets them. This might manifest as harsh words or uncharacteristic displays, followed by intense remorse and self-analysis.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Emotional Overlays</h4>
                <p>
                  High neuroticism (Fi⁺) can lead to negative feeling loops, catastrophizing relationship issues, or excessive self-blame. Under depression or anxiety, Fi can become numb or disoriented. Low neuroticism (Fi⁻) tends to weather emotional storms with more equilibrium, contextualizing negative experiences without unraveling their whole value system.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Developmental Arc */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-accent rounded-full mr-3"></span>
                Developmental Arc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The maturation of Fi is often a journey of broadening empathy and refining one's ethical compass:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Early Life</h4>
                  <p>
                    A child with strong Fi might display intense emotions and attachments early on, reacting strongly to perceived injustices and having surprisingly firm ideas of "good and bad." Yet at this stage, Fi is typically 1D or 2D – sincere but limited, often absorbing moral teachings as absolute rules.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Teenage Years</h4>
                  <p>
                    Many adolescents go through a passionate Fi phase, developing strong personal convictions and feeling deeply about friendships and romances. This is when Fi dimensionality can start expanding to 3D through exposure to different perspectives and the crucial process of individuation – deciding "These are my values, separate from what others say."
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Young Adulthood</h4>
                  <p>
                    Fi users often refine their boundaries and scope of care, gaining clearer sense of their closest people and guiding principles. Early career or education challenges them to apply values practically while maintaining integrity. This period can move Fi into solid 4D territory for those actively engaging in self-development.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Midlife</h4>
                  <p>
                    Often brings interesting evolution – Fi users frequently gain wisdom and calm about emotional matters. Having seen many emotional cycles, they might become sage counselors. Some may experience midlife reclamation of Fi if they previously focused on outward achievement, while others learn stronger boundaries to avoid emotional burnout.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Senior Years</h4>
                  <p>
                    Fi often blossoms into deep, steady compassion and clarity of conscience. Elder Fi users with full 4D development often serve as moral and emotional bedrock of their communities, with a lifetime of stories informing their empathy and a strong sense of identity and legacy.
                  </p>
                </div>
              </div>
              <p>
                Ideally, the arc of Fi leads to a state where one's inner values are in harmonious dialogue with the outer world: the individual has learned how to express their care effectively, maintain personal integrity without unnecessary rigidity, and extend empathy without losing themselves.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/te">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Te
            </a>
          </Button>
          <Button asChild>
            <a href="/fe">
              Next: Fe
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Fi;