import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LikeButton } from "./LikeButton";
import { TypingLabShareBar } from "./TypingLabShareBar";

export const TypingLabHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pt-32 pb-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />
      <div className="prism-container">
        <div className="mx-auto max-w-4xl text-center text-foreground">
          <Badge className="mb-4 bg-primary text-primary-foreground">Typing Lab</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Typing Lab: Evidence-based hypotheses of famous figures
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Powered by the PRISM Scoring Engine—an AI analyst that maps public behavior and language to information-processing
            patterns.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" variant="hero" asChild>
              <a href="#browse">Browse typings</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#method">How scoring works</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
              Educational, non-clinical
            </span>
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
              Public sources only
            </span>
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
              Human-reviewed revisions
            </span>
          </div>
          <div className="mt-10 flex flex-col items-center gap-4">
            <LikeButton
              targetKey="typing-lab"
              label="Give a thumbs up to the Typing Lab"
              size="lg"
              variant="secondary"
              className="px-6"
            >
              Thumbs up the lab
            </LikeButton>
            <TypingLabShareBar
              title="Typing Lab: Evidence-based hypotheses of famous figures"
              alignment="center"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
