import type { TypingLabEntry } from "../types";

interface AppendixProps {
  entry: TypingLabEntry;
}

export const Appendix = ({ entry }: AppendixProps) => {
  const uniqueSources = Array.from(
    new Map(
      entry.evidence.map((item) => [item.source.url, item.source])
    ).values()
  );

  return (
    <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Appendix: sources & version log</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sources</h3>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            {uniqueSources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  {source.label ?? source.url}
                </a>
                {source.timestamp ? ` · ${source.timestamp}` : ""}
                <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground/70">{source.kind}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Version log</h3>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            {entry.versionLog.map((log, index) => (
              <li key={`${entry.slug}-version-${index}`}>
                <span className="font-medium text-foreground">{log.date}:</span> {log.change}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 text-xs uppercase tracking-wide text-muted-foreground">
        {entry.ethicsNote}
      </div>
    </section>
  );
};
