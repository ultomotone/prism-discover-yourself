import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookSection from "@/components/BookSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, Users, ExternalLink } from "lucide-react";

const Resources = () => {
  const resourceCategories = [
    {
      title: "Documentation",
      icon: <FileText className="h-6 w-6" />,
      items: [
        { name: "PRISM Framework Overview", href: "/about" },
        { name: "Information Elements Guide", href: "/signals" },
        { name: "Assessment Methods", href: "/assessment-methods" },
        { name: "Core Alignments", href: "/core-alignments" },
        { name: "Dimensionality Theory", href: "/dimensionality" }
      ]
    },
    {
      title: "Learning Materials",
      icon: <Video className="h-6 w-6" />,
      items: [
        { name: "FAQ", href: "/faq" },
        { name: "Research & Science", href: "/research" },
        { name: "How It Works", href: "/how-it-works" },
        { name: "State Overlay Guide", href: "/state-overlay" },
        { name: "Block Dynamics", href: "/blocks" }
      ]
    },
    {
      title: "Applications",
      icon: <Users className="h-6 w-6" />,
      items: [
        { name: "For Individuals", href: "/individuals" },
        { name: "For Teams", href: "/teams" },
        { name: "Profiles Overview", href: "/profiles" },
        { name: "Insights & Guides", href: "/insights" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-background">
          <div className="prism-container">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 prism-gradient-hero rounded-full mb-6">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
                Resources
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Everything you need to understand and apply the PRISM framework. 
                From foundational concepts to advanced applications.
              </p>
            </div>
          </div>
        </section>

        {/* Book Section */}
        <BookSection />

        {/* Resource Categories */}
        <section className="py-20 bg-muted/30">
          <div className="prism-container">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-primary text-center mb-12">
                Explore PRISM
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {resourceCategories.map((category) => (
                  <Card key={category.title} className="prism-card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-center text-primary">
                        <div className="mr-3 text-primary">
                          {category.icon}
                        </div>
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="flex items-center justify-between text-foreground hover:text-primary prism-transition group"
                          >
                            <span>{item.name}</span>
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 prism-transition" />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="prism-container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-primary mb-6">
                Ready to Discover Your PRISM Profile?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Take the assessment and begin your journey of self-discovery.
              </p>
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScVFSAWRNUZT10hEoziD1oMXeS_FyCVP9NFTWD61eR8xDQaDA/viewform', '_blank')}
              >
                Take Assessment
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;