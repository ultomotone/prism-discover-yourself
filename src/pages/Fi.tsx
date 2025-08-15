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
              <h1 className="text-4xl font-bold mb-2">Fi – Introverted Ethics</h1>
              <p className="text-xl text-muted-foreground">"The Inner Compass"</p>
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
              <p className="text-lg">Fi weighs decisions by personal values and the quality of individual relationships.</p>
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
              <p>Strong Fi users sense the emotional temperature of one-on-one interactions and aim to act in harmony with their inner beliefs.</p>
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
              <p>In flow, Fi fosters deep trust and alignment; under pressure, it can become withdrawn or judgmental.</p>
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
              <p>Remembers personal details, keeps confidences, and often asks, "Does this feel right to me?"</p>
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