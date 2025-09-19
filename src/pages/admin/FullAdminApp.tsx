import React, { useState } from "react";
import {
  recomputeSession,
  backfillBrokenSessions,
  sampleBroken,
  qaSession,
} from "@/services/adminTools";

export default function FullAdminApp(): React.ReactElement {
  const [sessionId, setSessionId] = useState("");
  const [log, setLog] = useState<string>("Ready");

  async function run(fn: () => Promise<unknown>) {
    setLog("Running…");
    try {
      const out = await fn();
      setLog(JSON.stringify(out, null, 2));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setLog(`ERROR: ${error.message}`);
        return;
      }
      setLog(`ERROR: ${String(error)}`);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">PRISM Admin (Full)</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3 rounded-lg border p-4">
          <h2 className="font-medium">Recompute a single session</h2>
          <input
            className="w-full rounded border px-2 py-1 text-sm"
            placeholder="session UUID"
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => run(() => recomputeSession(sessionId))}
            >
              Recompute
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-3 py-1 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-muted-foreground/60"
              onClick={() => run(() => qaSession(sessionId))}
            >
              QA check
            </button>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border p-4">
          <h2 className="font-medium">Backfill broken sessions</h2>
          <p className="text-sm text-muted-foreground">
            Find sessions with placeholder v2 rows and recompute in batches.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground shadow-sm transition hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary"
              onClick={() => run(() => sampleBroken(10))}
            >
              Sample 10
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() =>
                run(() => backfillBrokenSessions({ days: 90, batchSize: 50 }))
              }
            >
              Backfill 90d
            </button>
          </div>
        </section>
      </div>

      <pre className="min-h-[200px] overflow-auto rounded-lg border bg-muted/40 p-4 text-xs">
        {log}
      </pre>
    </div>
  );
}
