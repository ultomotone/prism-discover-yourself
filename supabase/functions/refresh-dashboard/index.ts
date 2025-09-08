import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const URL = Deno.env.get("SUPABASE_URL")!;
const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function ymd(d: Date = new Date()): string {
  // UTC yyyy-mm-dd
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
}

interface RefreshResult {
  date: string;
  ok: boolean;
  error?: string;
}

Deno.serve(async () => {
  const admin = createClient(URL, SRK);

  const today = ymd();
  const yesterday = ymd(new Date(Date.now() - 86_400_000));

  const results: RefreshResult[] = [];

  // recalc today
  {
    const { error } = await admin.rpc("update_dashboard_statistics", {
      p_date: today,
    });
    results.push({ date: today, ok: !error, error: error?.message });
  }

  // recalc yesterday once per run (cheap safety)
  {
    const { error } = await admin.rpc("update_dashboard_statistics", {
      p_date: yesterday,
    });
    results.push({ date: yesterday, ok: !error, error: error?.message });
  }

  return new Response(
    JSON.stringify({ ok: results.every((r) => r.ok), results }),
    {
      headers: { "content-type": "application/json" },
    },
  );
});

