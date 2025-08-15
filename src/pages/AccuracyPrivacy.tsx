import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft, CheckCircle, Lock, Eye, Database } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";

const AccuracyPrivacy = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const assessmentLink = "https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform";

  const accuracyFeatures = [
    {
      icon: CheckCircle,
      title: "Multi-Method Validation",
      description: "Four different measurement approaches cross-validate your results, reducing the impact of any single source of bias.",
      details: "Likert scales, forced-choice pairs, situational scenarios, and validity checks work together to create a robust assessment."
    },
    {
      icon: Shield,
      title: "Confidence-Based Reporting",
      description: "We tell you exactly how certain we are about your type assignment—no false confidence or forced categorization.",
      details: "High, Medium, or Low confidence ratings help you understand when results are solid versus when additional assessment might be helpful."
    },
    {
      icon: Database,
      title: "State-Aware Interpretation",
      description: "Your results account for temporary factors like stress, fatigue, or mood that could skew responses.",
      details: "We adjust interpretation when state factors are detected, ensuring your core personality pattern isn't confused with momentary conditions."
    }
  ];

  const privacyProtections = [
    {
      icon: Lock,
      title: "Data Security",
      description: "Your assessment responses and results are encrypted and stored securely with industry-standard protections.",
      details: "SSL encryption in transit, encrypted storage at rest, and secure access controls protect your personal information."
    },
    {
      icon: Eye,
      title: "Limited Access",
      description: "Only you and authorized researchers (with your explicit consent) can access your individual results.",
      details: "We never share individual profiles with employers, schools, or other third parties without your direct authorization."
    },
    {
      icon: Shield,
      title: "Anonymized Research",
      description: "Any research use of assessment data is completely anonymized and aggregated—no individual identification possible.",
      details: "Research helps improve the assessment for everyone while maintaining complete confidentiality of individual responses."
    }
  ];

  const faqItems = [
    {
      q: "How accurate is PRISM compared to other personality tests?",
      a: "PRISM's multi-method approach and confidence-based reporting make it more reliable than single-method tests. We're transparent about uncertainty rather than forcing false confidence. Our validity studies show strong test-retest reliability and convergent validity with established measures."
    },
    {
      q: "Will my mood or stress level affect my results?",
      a: "Your core personality pattern is stable, but expression can shift with stress, sleep, or mood. We measure these state factors and adjust interpretation accordingly. When state interference is high, we may recommend retesting when you're in a more typical condition."
    },
    {
      q: "Can I improve my 'scores' or change my type?",
      a: "PRISM isn't about 'good' or 'bad' scores—it's about understanding your natural patterns. Your core type is relatively stable, but dimensionality can grow with practice and experience. The goal is development within your natural strengths, not becoming a different type."
    },
    {
      q: "What if I disagree with my results?",
      a: "Type boundaries aren't always clear-cut, and you know yourself best. If confidence is low or you're between types, we'll recommend additional assessment or self-reflection. The assessment is a tool for insight, not a definitive judgment."
    },
    {
      q: "Who can see my assessment results?",
      a: "Only you have access to your individual results unless you explicitly share them. We never provide results to employers, schools, or other parties without your direct consent. Any research use is completely anonymized."
    },
    {
      q: "Is PRISM suitable for hiring or selection decisions?",
      a: "No. PRISM is designed for development and self-understanding, not gatekeeping talent. Personality-based hiring can perpetuate bias and exclude qualified individuals. Use PRISM for team communication and individual growth, not screening."
    },
    {
      q: "How do you handle data privacy and security?",
      a: "We use industry-standard encryption, secure storage, and strict access controls. Data is kept only as long as necessary for research and improvement purposes. You can request data deletion at any time, and we comply with GDPR and other privacy regulations."
    },
    {
      q: "What if I want to retake the assessment?",
      a: "You can retake the assessment, especially if initial confidence was low or if significant time has passed. We recommend waiting at least 3-6 months between assessments unless there's a specific reason for earlier retesting."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button variant="outline" asChild>
              <a href="/assessment-methods" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Assessment Methods
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/about" className="flex items-center gap-2">
                Back to Overview
                <ArrowLeft className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 prism-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="prism-heading-lg text-primary mb-6">
              Accuracy, Confidence & Privacy
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-4xl mx-auto mb-8">
              Transparency in methods, honesty about limitations, and unwavering commitment to your privacy and data security.
            </p>
          </div>

          {/* Accuracy & Reliability */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">Our Commitment to Accuracy</h2>
            <div className="grid lg:grid-cols-3 gap-8">
              {accuracyFeatures.map((feature, index) => (
                <Card key={index} className="prism-hover-lift prism-shadow-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 prism-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        {feature.details}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Privacy & Data Security */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">Privacy & Data Protection</h2>
            <div className="grid lg:grid-cols-3 gap-8">
              {privacyProtections.map((protection, index) => (
                <Card key={index} className="prism-hover-lift prism-shadow-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 prism-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                      <protection.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      {protection.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {protection.description}
                    </p>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        {protection.details}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Ethical Use Guidelines */}
          <Card className="mb-16 prism-shadow-card">
            <CardContent className="p-8">
              <h2 className="prism-heading-md text-primary mb-6 text-center">Ethical Use Guidelines</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">✅ Appropriate Uses</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Personal self-understanding and development</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Team communication and collaboration improvement</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Career coaching and development planning</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Educational and research purposes</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Relationship and communication counseling</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-4">❌ Inappropriate Uses</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-muted-foreground">Hiring or employment screening decisions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-muted-foreground">Excluding individuals from opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-muted-foreground">Academic admissions or placement</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-muted-foreground">Clinical diagnosis or medical decisions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-muted-foreground">Legal proceedings or forensic evaluation</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-warm/10 border border-warm/20 rounded-lg">
                <p className="text-warm font-medium text-center">
                  Remember: PRISM measures preferences and patterns, not abilities or worth. Every personality pattern has value and contributes uniquely to teams and organizations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive FAQ */}
          <section className="mb-16">
            <h2 className="prism-heading-md text-primary mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index} className="prism-shadow-card">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-6 text-left hover:bg-muted/30 prism-transition flex items-center justify-between"
                    >
                      <h3 className="font-semibold text-primary pr-4">{item.q}</h3>
                      <div className={`text-muted-foreground transition-transform ${
                        openFaq === index ? 'rotate-45' : ''
                      }`}>
                        +
                      </div>
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6">
                        <div className="pl-4 border-l-2 border-accent/20">
                          <p className="text-muted-foreground">{item.a}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <div className="text-center mb-16">
            <Card className="prism-gradient-hero text-white prism-shadow-card">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Ready to Discover Your PRISM?</h2>
                <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                  Experience a personality assessment built on transparency, accuracy, and respect for your privacy.
                </p>
                <Button 
                  variant="assessment" 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3"
                  onClick={() => window.open(assessmentLink, '_blank')}
                >
                  Take the PRISM Assessment
                </Button>
                <p className="text-white/70 mt-4 text-sm">Multi-method • Confidence-rated • Privacy-protected</p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <a href="/assessment-methods" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Assessment Methods
              </a>
            </Button>
            <Button variant="assessment" asChild>
              <a href="/about" className="flex items-center gap-2">
                Back to Overview
                <ArrowLeft className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccuracyPrivacy;