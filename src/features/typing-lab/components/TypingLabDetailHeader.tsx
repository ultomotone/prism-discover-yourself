import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopTwoGapBar } from "./TopTwoGapBar";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { FunctionMatrixIcon } from "./FunctionMatrixIcon";
import { TypingLabShareButtons } from "./TypingLabShareButtons";
import type { TypingLabEntry } from "../types";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface TypingLabDetailHeaderProps {
  entry: TypingLabEntry;
}

export const TypingLabDetailHeader = ({ entry }: TypingLabDetailHeaderProps) => {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 shadow-lg">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_60%)]" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="bg-background/80">
              <Link to="/typing-lab" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Typing Lab
              </Link>
            </Button>
            <Badge className="bg-primary text-primary-foreground">
              {entry.proposedType}
              {entry.overlay ? ` ${entry.overlay}` : ""}
            </Badge>
            <ConfidenceBadge band={entry.confidenceBand} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">{entry.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {entry.role} • {entry.domain} • {entry.era} • {entry.nationality}
            </p>
          </div>
          <p className="text-base text-foreground">{entry.summary}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
              <TopTwoGapBar gap={entry.top2Gap} />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">One-sentence rationale</p>
                <p className="text-sm text-foreground">{entry.rationale}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Why not the nearest look-alike</p>
                <p className="text-sm text-foreground">{entry.differentiator}</p>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Top alternatives</p>
              <ul className="space-y-2 text-sm text-foreground">
                {entry.altTypes.map((alt) => (
                  <li key={`${entry.slug}-alt-${alt.type}`} className="flex items-center justify-between">
                    <span>{alt.type}</span>
                    <span className="text-muted-foreground">{Math.round(alt.weight * 100)}%</span>
                  </li>
                ))}
              </ul>
              <FunctionMatrixIcon entry={entry} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">Educational; non-clinical</span>
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">Updated {entry.lastUpdated}</span>
            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
              {entry.evidence.length} sources logged
            </span>
          </div>
        </div>
        {entry.image && (
          <div className="mx-auto h-64 w-full max-w-sm overflow-hidden rounded-3xl border border-border/60">
            <img src={entry.image} alt={entry.name} className="h-full w-full object-cover" loading="lazy" />
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-primary">
        <a
          href="mailto:team@prismpersonality.com"
          className="inline-flex items-center gap-2 hover:text-primary/80"
        >
          Submit a source or correction
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href="/typing-lab#method"
          className="inline-flex items-center gap-2 hover:text-primary/80"
        >
          How scoring works
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <TypingLabShareButtons
        className="mt-6"
        path={`/typing-lab/${entry.slug}`}
        title={`Typing Lab profile: ${entry.name}`}
        message={entry.summary}
      />
    </header>
  );
};
