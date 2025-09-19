import React from "react";
import { IS_PREVIEW } from "@/lib/env";

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">PRISM Admin</h1>

      {IS_PREVIEW ? (
        <div className="rounded-lg border p-4 bg-muted/40">
          <p className="text-sm">
            Preview mode detected. Heavy admin tools, analytics, and realtime are disabled.
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            <li>No auto-linking of sessions</li>
            <li>No realtime subscriptions</li>
            <li>Edge calls guarded; results fallback to v1 when JWT missing</li>
          </ul>
        </div>
      ) : null}

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-2">Utilities</h2>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>Recompute a session (score_prism)</li>
          <li>Inspect recent scoring logs</li>
          <li>Backfill v2 rows (types/functions/state)</li>
        </ol>
      </section>
    </div>
  );
}
