import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DebriefBanner() {
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="pt-6 text-center">
        <h4 className="text-lg font-semibold mb-2">Ready for Your Personal Map?</h4>
        <p className="text-sm text-muted-foreground mb-4 max-w-2xl mx-auto">
          Want to see your map, not a template? Book a <strong>Compatibility Debrief</strong>—a 1:1 walk-through 
          of your lanes, state mix, and two tiny habits.
        </p>
        <Button asChild size="lg">
          <a href="/book/compatibility-debrief" aria-label="Book Compatibility Debrief">
            Book a Compatibility Debrief
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}