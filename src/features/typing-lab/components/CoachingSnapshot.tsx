import type { TypingLabEntry } from "../types";

interface CoachingSnapshotProps {
  entry: TypingLabEntry;
}

export const CoachingSnapshot = ({ entry }: CoachingSnapshotProps) => {
  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">If we’re right…</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Practical hypotheses drawn from the dimensional bands. Use them as prompts—not prescriptions.
      </p>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
        {entry.coachingSnapshot.map((item, index) => (
          <li key={`${entry.slug}-coaching-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
};
