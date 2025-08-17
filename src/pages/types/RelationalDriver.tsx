import Header from "@/components/Header";

const RelationalDriver = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
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
              <p className="text-lg text-foreground">Pushes for outcomes while protecting personal bonds.</p>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <div className="prose prose-lg max-w-none">
                  <p>The Relational Driver (SEE) combines Extraverted Sensing's direct action and influence with Introverted Feeling's deep care for personal relationships. This type excels at achieving results while maintaining and protecting important personal bonds.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Core Functions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Dominant: Se (Extraverted Sensing)</h3>
                    <p>Takes direct action and influences situations in real-time, adapting quickly to achieve desired outcomes.</p>
                  </div>
                  <div className="prism-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Auxiliary: Fi (Introverted Feeling)</h3>
                    <p>Maintains strong personal values and deep care for relationships, ensuring actions align with what matters most.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Strengths</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Excellent at influencing and persuasion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Balances results with relationship care</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Strong leadership in people-focused contexts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Natural charisma and personal magnetism</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Development Areas</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May be inconsistent with broader groups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Can struggle with long-term planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>May favor personal connections over fairness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>Sometimes appears unpredictable or moody</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Professional Applications</h2>
                <p className="mb-4">As a Persuasive Operator, the Relational Driver excels in roles that require:</p>
                <ul className="space-y-2">
                  <li>• Sales and relationship management</li>
                  <li>• Entertainment and performance</li>
                  <li>• Coaching and personal development</li>
                  <li>• Marketing and brand advocacy</li>
                  <li>• Leadership in creative industries</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RelationalDriver;