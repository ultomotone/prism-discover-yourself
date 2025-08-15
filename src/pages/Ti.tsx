import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Cog } from "lucide-react";

const Ti = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/signals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Signals
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/te">
              Next: Te
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Cog className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Ti – Introverted Logic</h1>
              <p className="text-xl text-muted-foreground">"The Framework Builder"</p>
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
              <p className="text-lg">Ti is the drive to understand how things fit together in a logical, internally consistent way.</p>
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
              <p>People strong in Ti enjoy organizing systems, spotting inconsistencies, and refining rules so they "just make sense." They work from the inside out, starting with principles before details.</p>
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
              <p>Ti adjusts dynamically — in a flow state, it builds elegant mental blueprints; under stress, it can become nit-picky or overly rigid.</p>
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
              <p>Loves troubleshooting why something isn't working, rearranging information until it clicks, and explaining "the logic" behind a decision.</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/signals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Signals
            </a>
          </Button>
          <Button asChild>
            <a href="/te">
              Next: Te
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Ti;