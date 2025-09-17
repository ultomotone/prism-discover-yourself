import type { TypingLabEntry } from "../types";

interface AssessmentMapProps {
  entry: TypingLabEntry;
}

export const AssessmentMap = ({ entry }: AssessmentMapProps) => {
  const assessment = entry.assessmentMap;

  if (!assessment) {
    return null;
  }

  const items = [
    { label: "Strength items", copy: assessment.strengthItems },
    { label: "Dimensional items", copy: assessment.dimensionalItems },
    { label: "Ipsatives", copy: assessment.ipsatives },
  ];

  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Assessment map</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        How the scored items stacked up and which ipsative pulls we logged while making the call.
      </p>
      <dl className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.copy}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
