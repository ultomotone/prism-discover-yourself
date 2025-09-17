import { Badge } from "@/components/ui/badge";
import type { TypingLabEntry } from "../types";

interface DifferentialDiagnosisProps {
  entry: TypingLabEntry;
}

export const DifferentialDiagnosis = ({ entry }: DifferentialDiagnosisProps) => {
  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Differential diagnosis</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We pressure-test the call against the nearest look-alikes and record what would flip the typing.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {entry.differentials.map((item) => (
          <div key={item.type} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <Badge variant="outline" className="mb-2 bg-background/60">
              {item.type}
            </Badge>
            <p className="text-sm text-muted-foreground">{item.whyNot}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Falsification cues</h3>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {entry.falsification.map((item, index) => (
            <li key={`${entry.slug}-falsification-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};
