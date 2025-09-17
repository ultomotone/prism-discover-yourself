import type { TypingLabEntry } from "../types";

interface StateProfilesProps {
  entry: TypingLabEntry;
}

export const StateProfiles = ({ entry }: StateProfilesProps) => {
  if (!entry.states?.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">State profiles</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        How the public persona shifts when different triggers light up the Se→Ti machine. Each state notes the
        default behaviors, upside, risks, and the agreed reset protocol.
      </p>
      <div className="mt-4 space-y-4">
        {entry.states.map((state) => (
          <article
            key={`${entry.slug}-state-${state.name}`}
            className="rounded-2xl border border-border/60 bg-muted/20 p-4"
          >
            <h3 className="text-lg font-semibold text-foreground">{state.name}</h3>
            <dl className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div>
                <dt className="font-medium text-foreground">Triggers</dt>
                <dd className="mt-1 leading-relaxed">{state.triggers}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Behaviors</dt>
                <dd className="mt-1 leading-relaxed">{state.behaviors}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Strengths</dt>
                <dd className="mt-1 leading-relaxed">{state.strengths}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Risks</dt>
                <dd className="mt-1 leading-relaxed">{state.risks}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-foreground">Reset</dt>
                <dd className="mt-1 leading-relaxed">{state.reset}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
};
