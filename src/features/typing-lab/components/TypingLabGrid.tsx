import { TypingLabCard } from "./TypingLabCard";
import type { TypingLabEntry } from "../types";

interface TypingLabGridProps {
  entries: TypingLabEntry[];
}

export const TypingLabGrid = ({ entries }: TypingLabGridProps) => {
  if (entries.length === 0) {
    return (
      <section className="prism-container py-16" id="all-typings">
        <div className="rounded-3xl border border-dashed border-border/60 bg-muted/10 p-12 text-center text-muted-foreground">
          No typings match your filters yet. Try broadening the criteria or clearing filters.
        </div>
      </section>
    );
  }

  return (
    <section className="prism-container py-16" id="all-typings">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <TypingLabCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </section>
  );
};
