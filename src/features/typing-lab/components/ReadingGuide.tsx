import type { TypingLabEntry } from "../types";

interface ReadingGuideProps {
  entry: TypingLabEntry;
}

export const ReadingGuide = ({ entry }: ReadingGuideProps) => {
  const guide = entry.readingGuide;

  if (!guide) {
    return null;
  }

  const items = [
    { label: "Dimensionality", copy: guide.dimensionality },
    { label: "Strength", copy: guide.strength },
    { label: "Overlay", copy: guide.overlay },
  ];

  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Reading guide</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Quick glossary for new readers so the dimensional bands, strength labels, and overlay language stay grounded.
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
