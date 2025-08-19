import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BookOpen, Users, GraduationCap } from "lucide-react";

const Education = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-24 prism-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-primary mb-6">
              PRISM for Education
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transform educational outcomes with PRISM's advanced typology framework. 
              Help students and educators understand learning styles and optimize academic performance.
            </p>
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
            >
              Explore PRISM for Education
            </Button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="prism-container">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Transform Learning with PRISM
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="prism-card">
                  <CardHeader>
                    <BookOpen className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>Personalized Learning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Understand how students process information and adapt teaching methods to match their cognitive preferences.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="prism-card">
                  <CardHeader>
                    <Users className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>Classroom Dynamics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Improve group work and collaboration by understanding the cognitive diversity in your classroom.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="prism-card">
                  <CardHeader>
                    <GraduationCap className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>Academic Success</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Help students identify their strengths and develop strategies that align with their natural cognitive patterns.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Applications Section */}
        <section className="py-20">
          <div className="prism-container">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Educational Applications
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-semibold mb-6">For Educators</h3>
                  <div className="space-y-4">
                    {[
                      "Adapt teaching methods to student learning styles",
                      "Improve classroom management and engagement",
                      "Design effective group projects and collaborations",
                      "Provide personalized feedback and support",
                      "Reduce stress and increase job satisfaction"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-6">For Students</h3>
                  <div className="space-y-4">
                    {[
                      "Understand their unique learning preferences",
                      "Develop effective study strategies",
                      "Improve communication and collaboration skills",
                      "Make informed career and academic choices",
                      "Build confidence and self-awareness"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Section */}
        <section className="py-20 bg-muted/30">
          <div className="prism-container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Implementation Options
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="prism-card">
                  <CardHeader>
                    <CardTitle>Individual Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Personal PRISM assessments for students to understand their cognitive profile and learning preferences.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="prism-card">
                  <CardHeader>
                    <CardTitle>Classroom Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Integrate PRISM insights into curriculum design and teaching methodologies for enhanced learning outcomes.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="prism-card">
                  <CardHeader>
                    <CardTitle>Professional Development</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Training programs for educators to understand and apply PRISM principles in their teaching practice.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="prism-container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Transform Education with PRISM?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join educational institutions worldwide that are using PRISM to enhance learning outcomes.
              </p>
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Education;