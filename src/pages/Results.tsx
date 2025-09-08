import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import type { Profile, ResultsSession } from "@/features/results/types";

interface ResultsPayload {
  profile: Profile;
  session: ResultsSession;
}

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [search] = useSearchParams();
  const shareToken = search.get("t") || null;
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const { data, error } = await supabase.functions.invoke<ResultsPayload>(
        "get-results-by-session",
        { body: { sessionId, shareToken } }
      );
      if (error) {
        setErr(error.message);
        return;
      }
      if (!data?.profile) {
        setErr("Results not found");
        return;
      }
      setData(data);
    })();
  }, [sessionId, shareToken]);

  if (err) return <div className="p-8">Error: {err}</div>;
  if (!data) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Your PRISM Results</h1>
      {/* use data.profile / data.session */}
    </div>
  );
}
