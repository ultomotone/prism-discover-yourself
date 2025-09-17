import type { TypingLabEntry } from "../types";

interface FaqListProps {
  entry: TypingLabEntry;
}

export const FaqList = ({ entry }: FaqListProps) => {
  if (!entry.faq?.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">FAQ</h2>
      <div className="mt-4 space-y-4">
        {entry.faq.map((item, index) => (
          <div key={`${entry.slug}-faq-${index}`} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{item.question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
