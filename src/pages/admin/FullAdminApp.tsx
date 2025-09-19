import React, { useEffect, useState } from "react";
import {
  recomputeSession,
  backfillBrokenSessions,
  sampleBroken,
  qaSession,
  configureAdminServiceRoleKey,
  clearAdminServiceRoleKey,
  isAdminServiceRoleKeyConfigured,
} from "@/services/adminTools";

export default function FullAdminApp(): React.ReactElement {
  const [sessionId, setSessionId] = useState("");
  const [log, setLog] = useState<string>("Ready");
  const [serviceKeyInput, setServiceKeyInput] = useState("");
  const [serviceKeyConfigured, setServiceKeyConfigured] = useState<boolean>(() =>
    isAdminServiceRoleKeyConfigured(),
  );

  useEffect(() => {
    setServiceKeyConfigured(isAdminServiceRoleKeyConfigured());
  }, []);

  function refreshServiceKeyStatus(): void {
    setServiceKeyConfigured(isAdminServiceRoleKeyConfigured());
  }

  function configureServiceKey(): void {
    try {
      configureAdminServiceRoleKey(serviceKeyInput);
      setServiceKeyInput("");
      refreshServiceKeyStatus();
      setLog("Service role key configured for this session.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setLog(`ERROR: ${error.message}`);
        return;
      }
      setLog(`ERROR: ${String(error)}`);
    }
  }

  function clearServiceKey(): void {
    try {
      clearAdminServiceRoleKey();
      refreshServiceKeyStatus();
      setLog("Cleared session service role key.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setLog(`ERROR: ${error.message}`);
        return;
      }
      setLog(`ERROR: ${String(error)}`);
    }
  }

  async function run(fn: () => Promise<unknown>) {
    if (!isAdminServiceRoleKeyConfigured()) {
      refreshServiceKeyStatus();
      setLog("ERROR: Configure the Supabase service role key before running admin actions.");
      return;
    }
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

      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="font-medium">Supabase service role key</h2>
        <p className="text-sm text-muted-foreground">
          Paste a Supabase service role key to enable admin utilities. The key is stored in session storage
          and cleared when the browser session ends.
        </p>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="password"
            className="w-full rounded border px-2 py-1 text-sm"
            placeholder="service role key"
            value={serviceKeyInput}
            onChange={(event) => setServiceKeyInput(event.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={configureServiceKey}
              disabled={serviceKeyInput.trim().length === 0}
            >
              Set key
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-3 py-1 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-muted-foreground/60"
              onClick={clearServiceKey}
              disabled={!serviceKeyConfigured}
            >
              Clear key
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Status: {serviceKeyConfigured ? "configured" : "not configured"}
        </p>
      </section>

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
              disabled={!serviceKeyConfigured}
            >
              Recompute
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-3 py-1 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-muted-foreground/60"
              onClick={() => run(() => qaSession(sessionId))}
              disabled={!serviceKeyConfigured}
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
              disabled={!serviceKeyConfigured}
            >
              Sample 10
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() =>
                run(() => backfillBrokenSessions({ days: 90, batchSize: 50 }))
              }
              disabled={!serviceKeyConfigured}
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
