import type { TypingLabEntry } from "../types";

interface ResearchAgendaProps {
  entry: TypingLabEntry;
}

export const ResearchAgenda = ({ entry }: ResearchAgendaProps) => {
  const hasFutureResearch = Boolean(entry.futureResearch?.length);
  const hasCounterevidence = Boolean(entry.counterevidenceLog?.length);

  if (!hasFutureResearch && !hasCounterevidence) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Research agenda</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Open questions and the counterevidence log we’re tracking to keep the hypothesis honest.
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {hasFutureResearch && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Future research
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {entry.futureResearch!.map((item, index) => (
                <li key={`${entry.slug}-future-research-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {hasCounterevidence && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Counterevidence log
            </h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {entry.counterevidenceLog!.map((item, index) => (
                <li key={`${entry.slug}-counterevidence-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
