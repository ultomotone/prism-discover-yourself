import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";

const Ne = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/ni">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Ni
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/si">
              Next: Si
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Lightbulb className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Ne – Extraverted Intuition</h1>
              <p className="text-xl text-muted-foreground">"The Possibility Explorer"</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Core Idea */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-primary rounded-full mr-3"></span>
                Core Idea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">Ne thrives on options, ideas, and unexpected connections.</p>
            </CardContent>
          </Card>

          {/* How it shows up */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-secondary rounded-full mr-3"></span>
                How it shows up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ne-strong people brainstorm easily, see multiple angles, and link unrelated concepts into something new.</p>
            </CardContent>
          </Card>

          {/* In PRISM */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-accent rounded-full mr-3"></span>
                In PRISM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>In flow, Ne sparks innovation; in stress, it may scatter attention or chase novelty without follow-through.</p>
            </CardContent>
          </Card>

          {/* Everyday signs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-3 h-3 bg-muted-foreground rounded-full mr-3"></span>
                Everyday signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Starts sentences with "What if…?", enjoys improvising, and notices hidden opportunities.</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/ni">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Ni
            </a>
          </Button>
          <Button asChild>
            <a href="/si">
              Next: Si
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Ne;