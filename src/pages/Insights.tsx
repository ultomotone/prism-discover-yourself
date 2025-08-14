import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Users } from "lucide-react";

const Insights = () => {
  const posts = [
    {
      title: "Dimensionality vs. Strength: Why Both Matter",
      excerpt: "Strength says how often; dimensionality says how well. Here's how to read the two together.",
      author: "PRISM Research Team",
      date: "Dec 15, 2024",
      category: "Understanding PRISM"
    },
    {
      title: "Stress vs. Flow: Your Toggle Map", 
      excerpt: "Recognize the moment you shift—and how to get back to Core quickly.",
      author: "Dr. Sarah Chen",
      date: "Dec 10, 2024",
      category: "Personal Development"
    },
    {
      title: "Using PRISM in 1:1s",
      excerpt: "Five prompts managers can use with each profile to improve clarity and trust.",
      author: "Marcus Rodriguez",
      date: "Dec 5, 2024",
      category: "Team Leadership"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Understanding PRISM":
        return "bg-secondary/10 text-secondary";
      case "Personal Development":
        return "bg-accent/10 text-accent";
      case "Team Leadership":
        return "bg-warm/10 text-warm";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="prism-container pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="prism-heading-lg text-primary mb-6">
              Insights & Guides
            </h1>
            <p className="prism-body-lg text-muted-foreground max-w-2xl mx-auto">
              Practical articles and research insights to help you apply PRISM effectively in work and life.
            </p>
          </div>

          {/* Featured Posts */}
          <div className="space-y-8">
            {posts.map((post, index) => (
              <Card key={index} className="prism-hover-lift prism-shadow-card">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {post.date}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-3">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    {post.author}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon */}
          <Card className="mt-12 prism-shadow-card">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-3">
                More insights coming soon
              </h3>
              <p className="text-muted-foreground">
                We're working on expanding our library of practical guides, case studies, and research findings. 
                Check back regularly for new content.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Insights;