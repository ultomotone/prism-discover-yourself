import { Badge } from "@/components/ui/badge";
import type { TypingLabEntry } from "../types";

const weightStyles = {
  Strong: "bg-primary text-primary-foreground",
  Moderate: "bg-secondary text-secondary-foreground",
  Light: "bg-muted text-foreground",
} as const;

interface EvidenceLedgerProps {
  entry: TypingLabEntry;
}

export const EvidenceLedger = ({ entry }: EvidenceLedgerProps) => {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Evidence ledger</h2>
      <p className="text-sm text-muted-foreground">
        Every claim references a public source. Weight reflects the clarity of the signal and the quality of the documentation.
      </p>
      <div className="space-y-4">
        {entry.evidence.map((item, index) => (
          <div
            key={`${entry.slug}-evidence-${index}`}
            className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-foreground">{item.claim}</div>
              <Badge className={weightStyles[item.weight]}>{item.weight}</Badge>
            </div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Source:</span>{" "}
                <a
                  href={item.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  {item.source.label ?? item.source.url}
                  {item.source.timestamp ? ` (${item.source.timestamp})` : ""}
                </a>
                <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground/80">
                  {item.source.kind}
                </span>
              </div>
              <div>
                <span className="font-medium text-foreground">Interpretation:</span>{" "}
                {item.interpretation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
