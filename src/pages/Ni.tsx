import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Eye } from "lucide-react";

const Ni = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/fe">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Fe
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/ne">
              Next: Ne
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Eye className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Ni – Introverted Intuition</h1>
              <p className="text-xl text-muted-foreground">"The Pattern Forecaster"</p>
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
              <p className="text-lg">Ni tracks unseen patterns, connecting past, present, and potential futures into one clear narrative.</p>
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
              <p>Ni-strong people think in big pictures and future implications, often trusting "gut" insights.</p>
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
              <p>Ni shifts clarity with context — in flow, it sees a single probable path; in stress, it can spiral into over-analysis or fatalism.</p>
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
              <p>Spots trends early, uses metaphors, and tends to "just know" how things will turn out.</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/fe">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Fe
            </a>
          </Button>
          <Button asChild>
            <a href="/ne">
              Next: Ne
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Ni;