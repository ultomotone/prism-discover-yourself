import TypeLayout from "@/components/TypeLayout";

const InspirationOrchestrator = () => {
  return (
    <TypeLayout>
      <div className="prism-container py-12">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-16 h-16 prism-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">EIE</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-primary mb-2">Inspiration Orchestrator</h1>
                  <p className="text-xl text-muted-foreground">Fe–Ni • Change Mobilizer</p>
                </div>
              </div>
              <p className="text-lg text-foreground">Charismatic, empathetic leader who inspires and connects with people.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {/* Profile */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Profile</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    You are a charismatic, empathetic leader who thrives on inspiring and connecting with people. Your dominant Extraverted Feeling (Fe) means you naturally tune into others' emotions and needs, and you take great joy in fostering harmony and development in those around you. Warm and socially adept, you often find yourself in the role of organizer, mentor, or coach among your peers – the one who brings people together and motivates them toward a common good.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    You have a strong sense of ethics and interpersonal responsibility; it genuinely matters to you that everyone is heard, supported, and working cooperatively. Supporting this is auxiliary Introverted Intuition (Ni), which grants you a visionary outlook. You don't just empathize with individuals in the moment, you also see their potential and the larger dynamics at play.
                  </p>
                  <p className="text-lg leading-relaxed">
                    ENFJs often have almost prophetic insight into others' talents or future possibilities, which is why you excel at guiding teams or communities toward improvement. You might, for example, spearhead a new initiative at work because you intuitively sense what strategy will inspire colleagues and you know how to communicate it compellingly.
                  </p>
                </div>
              </section>

              {/* Flow State */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">In Flow</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    You are at your best when leading or facilitating in a value-driven project – perhaps running a workshop to help people grow, organizing a charity event, or even creatively directing a team toward a shared vision. You feel energized and "in the zone" when your empathetic engagement and foresight combine; you're making a positive impact and you can practically see the future flourishing you're enabling.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Your enthusiasm becomes contagious, and others are drawn in by your genuine passion and confidence in the mission. This is that sweet spot where empathy and vision meet action.
                  </p>
                </div>
              </section>

              {/* Internal Critic & Growth */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Internal Critic & Growth</h2>
                <div className="space-y-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Common Challenges</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Your challenges often center on balancing your intense focus on others with your own needs. Your Internal Critic (tertiary Se, inferior Ti) might nag you privately in ways others wouldn't guess, since outwardly you appear so put-together. For instance, you may secretly worry, "Am I being too impractical or emotional?" (that's inferior Ti questioning your decisions with cold logic) or "Am I missing something real and now while dreaming of the future?" (Se doubt when you're very Ni-focused).
                    </p>
                    <p className="text-lg leading-relaxed">
                      Under stress, ENFJs can flip into a more critical, withdrawn mode – you might become uncharacteristically impersonal and blunt as Ti takes over, suddenly pointing out logical flaws or isolating yourself to analyze (which can confuse your loved ones). Or you might fall into indulgent behaviors, like impulsive spending or over-partying, as a way to blow off steam (a sign of Se grip).
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Watch Out For</h3>
                    <p className="text-lg leading-relaxed mb-4">
                      Another common struggle is people-pleasing: because you're so oriented to others, you may stretch yourself too thin saying "yes" to everyone, or you may have a hard time showing anger and thus bottling it up. This can lead to burnout or passive-aggressive moments.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Additionally, your strong convictions about what's best for people might edge into over-protectiveness or bossiness – watch out for being so sure of your vision that you override others' autonomy. However, those are usually the exceptions; most experience you as compassionate and inspiring.
                    </p>
                  </div>

                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-3">Growth Path</h3>
                    <p className="text-lg leading-relaxed">
                      To grow, it's healthy for ENFJs to practice stepping back for self-care and letting others carry their own weight at times. Tapping into your Hidden Potential (Ti/Se) constructively can mean learning some analytical problem-solving techniques or engaging in a grounding physical hobby – things that center you without reference to anyone else's needs.
                    </p>
                  </div>
                </div>
              </section>

              {/* Guiding Light */}
              <section>
                <h2 className="text-2xl font-semibold mb-4">Guiding Light</h2>
                <div className="prism-card p-6">
                  <p className="text-lg leading-relaxed mb-4">
                    Remember that your gift is lighting the spark of growth in others while keeping an eye on the greater good. When you lead with both heart and insight, you truly live up to the nickname "Protagonist" – driving positive change in any group or community you're part of.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Your flow state is that sweet spot where empathy and vision meet action, so strive to spend your time in roles that allow you to do just that.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
    </TypeLayout>
  );
};

export default InspirationOrchestrator;