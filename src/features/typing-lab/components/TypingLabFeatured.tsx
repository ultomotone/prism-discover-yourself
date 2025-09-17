import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { TypingLabEntry } from "../types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { TopTwoGapBar } from "./TopTwoGapBar";

interface TypingLabFeaturedProps {
  entries: TypingLabEntry[];
}

export const TypingLabFeatured = ({ entries }: TypingLabFeaturedProps) => {
  if (entries.length === 0) {
    return null;
  }
  return (
    <section className="prism-container py-16" id="browse">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Featured typologies</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Editor picks with rich evidence stacks. Hover to preview the rationale before opening the dossier.
          </p>
        </div>
        <a
          href="#all-typings"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
        >
          Jump to all typings
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
      <div className="mt-8 overflow-x-auto">
        <div className="flex min-w-full gap-6">
          {entries.map((entry) => (
            <Card
              key={entry.slug}
              className="relative min-w-[280px] flex-1 overflow-hidden border-border/60 bg-background/90 backdrop-blur"
            >
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt={entry.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-primary">
                        {entry.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{entry.domain}</p>
                    <h3 className="text-lg font-semibold text-foreground">{entry.name}</h3>
                    <p className="text-sm text-muted-foreground">{entry.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">
                    {entry.proposedType}
                    {entry.overlay ? ` ${entry.overlay}` : ""}
                  </Badge>
                  <ConfidenceBadge band={entry.confidenceBand} />
                </div>
                <p className="text-sm text-muted-foreground">{entry.summary}</p>
                <TopTwoGapBar gap={entry.top2Gap} />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Why this call:</span> {entry.rationale}
                </div>
                <Link
                  to={`/typing-lab/${entry.slug}`}
                  className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Open dossier
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
