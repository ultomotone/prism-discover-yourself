import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";

const Fe = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="prism-container py-16">
        {/* Navigation */}
        <div className="flex justify-between mb-8">
          <Button variant="outline" asChild>
            <a href="/fi">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Fi
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/ni">
              Next: Ni
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-primary mr-4" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Fe – Extraverted Ethics</h1>
              <p className="text-xl text-muted-foreground">"The Social Conductor"</p>
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
              <p className="text-lg">Fe tunes into group emotions and works to create a shared mood.</p>
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
              <p>People strong in Fe can "read the room" and shift their tone, expression, or energy to engage others.</p>
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
              <p>In a healthy state, Fe inspires and unites; in stress, it may overcompensate with forced cheer or dramatics.</p>
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
              <p>Brings people together, uses expressive language, and reacts quickly to changes in group atmosphere.</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-16">
          <Button variant="outline" asChild>
            <a href="/fi">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous: Fi
            </a>
          </Button>
          <Button asChild>
            <a href="/ni">
              Next: Ni
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Fe;