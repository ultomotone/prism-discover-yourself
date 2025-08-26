import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Target, Heart, Brain } from "lucide-react";
import Header from "@/components/Header";

const RelationalFitHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-rf-navy via-rf-teal to-rf-gold opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-rf-gold/20 text-rf-gold-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-rf-gold rounded-full" />
            PRISM Relational Fit (beta)
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            A practical, multi-layer model to predict how two people connect
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We score relationships across four layers and roll them into a clear Supportive / Stretch / Friction band with specific habits to try this week.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-rf-teal hover:bg-rf-teal/90 text-rf-teal-foreground">
              <Link to="/relational-fit/heatmap">
                View Heatmap <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/relational-fit/types">
                Browse Types
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Four Layers Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your 4 layers (0–100 total)</h2>
            <p className="text-muted-foreground">Each layer contributes to your overall relationship compatibility score</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-rf-navy/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-rf-navy/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-rf-navy" />
                </div>
                <CardTitle className="text-lg">Core Alignment</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">×50</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Baseline complement between core types (e.g., Builder-Strategist × Guardian-Values).
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-rf-teal/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-rf-teal/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-6 h-6 text-rf-teal" />
                </div>
                <CardTitle className="text-lg">State Overlay</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">×20</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  How current regulation (N+/N0/N–) lifts or lowers fit.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-rf-gold/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-rf-gold/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-rf-gold-foreground" />
                </div>
                <CardTitle className="text-lg">Trait Modifiers</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">×15</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Big Five tweaks that smooth or strain communication.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Supply–Demand</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">×15</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Do your strengths meet their needs across 5 lanes?
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bands Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Relationship Bands</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-rf-supportive/30 bg-rf-supportive/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-rf-supportive rounded-full" />
                  <CardTitle className="text-rf-supportive">Supportive</CardTitle>
                </div>
                <CardDescription>70–100 points</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">High synergy; double down on strengths.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-rf-stretch/30 bg-rf-stretch/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-rf-stretch rounded-full" />
                  <CardTitle className="text-rf-stretch">Stretch</CardTitle>
                </div>
                <CardDescription>45–69 points</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Workable differences; use the habits below.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-rf-friction/30 bg-rf-friction/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-rf-friction rounded-full" />
                  <CardTitle className="text-rf-friction">Friction</CardTitle>
                </div>
                <CardDescription>0–44 points</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Chronic tension; address weak lanes first.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Guidance Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Guidance you get</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">What you do best together</h3>
              <p className="text-muted-foreground">1–2 lines highlighting your key synergies</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Watch-outs</h3>
              <p className="text-muted-foreground">1 line per weak lane to be mindful of</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">2–3 tiny habits</h3>
              <p className="text-muted-foreground">7-day experiments to strengthen your connection</p>
            </div>
          </div>

          <div className="mt-12">
            <Button asChild size="lg" className="bg-rf-navy hover:bg-rf-navy/90 text-rf-navy-foreground">
              <Link to="/relational-fit/heatmap">
                Explore the Heatmap <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Consent Footer */}
      <section className="py-8 px-4 bg-muted/50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            This is educational, not clinical advice. Share data only if you choose.
          </p>
        </div>
      </section>
    </div>
  );
};

export default RelationalFitHome;