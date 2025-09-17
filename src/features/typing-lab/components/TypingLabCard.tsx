import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, ExternalLink, MessageCircle } from "lucide-react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { FunctionMatrixIcon } from "./FunctionMatrixIcon";
import { TopTwoGapBar } from "./TopTwoGapBar";
import { LikeButton } from "./LikeButton";
import type { TypingLabEntry } from "../types";

interface TypingLabCardProps {
  entry: TypingLabEntry;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getSourceCount = (entry: TypingLabEntry) => entry.evidence.length;

export const TypingLabCard = ({ entry }: TypingLabCardProps) => {
  const sourceCount = getSourceCount(entry);
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/60 bg-background/80 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        {entry.image ? (
          <img
            src={entry.image}
            alt={entry.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-primary">
            {entry.name.charAt(0)}
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-background/80 text-xs font-medium">
            {entry.domain}
          </Badge>
          <Badge variant="outline" className="bg-background/80 text-xs font-medium">
            {entry.era}
          </Badge>
        </div>
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              {entry.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {entry.role} • {entry.nationality}
            </CardDescription>
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
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <TopTwoGapBar gap={entry.top2Gap} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Top alternatives
              </p>
              <ul className="mt-1 space-y-1 text-sm text-foreground">
                {entry.altTypes.map((alt) => (
                  <li key={`${entry.slug}-${alt.type}`} className="flex items-center justify-between">
                    <span>{alt.type}</span>
                    <span className="text-muted-foreground">{Math.round(alt.weight * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3">
            <FunctionMatrixIcon entry={entry} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{sourceCount} sourced claims</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Updated {formatDate(entry.lastUpdated)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Data coverage {entry.dataCoverage}/5</span>
            </div>
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-3">
          <LikeButton
            targetKey={`typing-lab:${entry.slug}`}
            label={`Give a thumbs up to the ${entry.name} typing dossier`}
          />
          <Button asChild variant="secondary">
            <Link to={`/typing-lab/${entry.slug}`} className="flex items-center gap-2">
              Open dossier
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
