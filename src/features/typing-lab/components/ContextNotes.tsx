import type { TypingLabEntry } from "../types";

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

interface ContextNotesProps {
  entry: TypingLabEntry;
}

export const ContextNotes = ({ entry }: ContextNotesProps) => {
  const balance = [
    { label: "Flow", value: entry.contextBalance.flow, copy: entry.contexts.flow },
    { label: "Performative", value: entry.contextBalance.performative, copy: entry.contexts.performative },
    { label: "Stress", value: entry.contextBalance.stress, copy: entry.contexts.stress },
  ];

  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Context & drift notes</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Expression shifts with context. These notes show how the signal mix changes across Flow, Performative, and Stress states.
      </p>
      <div className="mt-6 space-y-6">
        {balance.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span>{item.label}</span>
              <span className="text-muted-foreground">{formatPercent(item.value)}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-secondary"
                style={{ width: `${Math.min(100, Math.max(0, item.value * 100))}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
