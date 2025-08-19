import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Target, Briefcase } from "lucide-react";

const Consultants = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-24 prism-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-primary mb-6">
              PRISM for Consultants
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Enhance your consulting practice with PRISM's advanced typology framework. 
              Deliver deeper insights and more effective solutions to your clients.
            </p>
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => window.location.href = 'mailto:daniel.joseph.speiss@gmail.com?subject=PRISM Consultant Interest'}
            >
              Get Started with PRISM
            </Button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="prism-container">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Consultants Choose PRISM
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="prism-card">
                  <CardHeader>
                    <Target className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>Precise Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      PRISM's multidimensional approach provides more accurate and nuanced insights than traditional typology systems.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="prism-card">
                  <CardHeader>
                    <Users className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>Client-Focused</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Deliver actionable insights that help clients understand their strengths and optimize their performance.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="prism-card">
                  <CardHeader>
                    <Briefcase className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>Professional Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Access comprehensive resources, training materials, and certification programs to enhance your practice.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="prism-container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                What You Get with PRISM
              </h2>
              <div className="space-y-6">
                {[
                  "Advanced typology assessment tools",
                  "Detailed client reports and insights",
                  "Training and certification programs",
                  "Marketing and practice support materials",
                  "Access to PRISM consultant community",
                  "Ongoing research and framework updates"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="prism-container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Enhance Your Consulting Practice?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join the growing community of consultants using PRISM to deliver exceptional results.
              </p>
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => window.location.href = 'mailto:daniel.joseph.speiss@gmail.com?subject=PRISM Consultant Interest'}
              >
                Start Your Journey
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Consultants;