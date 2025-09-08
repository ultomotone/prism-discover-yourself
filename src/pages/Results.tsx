import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

type ResultsPayload = {
  session: { id: string; status: string };
  profile: any;
};

export default function Results() {
  const { sessionId: paramId } = useParams<{ sessionId: string }>();
  const query = new URLSearchParams(useLocation().search);
  const sessionId = useMemo(
    () => paramId || query.get("sessionId") || "",
    [paramId, query],
  );
  const shareToken = useMemo(() => query.get("t"), [query]);

  const [data, setData] = useState<ResultsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let cancel = false;

    (async () => {
      const { data, error } = await supabase.functions.invoke<ResultsPayload>(
        "get-results-by-session",
        {
          body: { sessionId, shareToken },
        },
      );
      if (error) {
        // If Edge returns 409 while scoring, auto-retry briefly
        if ((error as any)?.status === 409 && tries < 12) {
          setTimeout(() => !cancel && setTries((t) => t + 1), 1000);
          return;
        }
        setErr(error.message || "Failed to load results");
        return;
      }
      if (!data?.profile) {
        setErr("Results not found");
        return;
      }
      setData(data);
    })();

    return () => {
      cancel = true;
    };
  }, [sessionId, shareToken, tries]);

  if (err) return <div className="p-8">Error: {err}</div>;
  if (!data) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Your PRISM Results</h1>
      <pre className="mt-4 text-sm bg-muted p-4 rounded">
        {JSON.stringify(data.profile, null, 2)}
      </pre>
    </div>
  );
}
