import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

function AdminControls() {
  const { toast } = useToast();
  const [busy, setBusy] = useState<null | "refresh" | "session" | "profileBackfill">(null);
  const [sessionId, setSessionId] = useState("");

  async function invokeEdge(name: string, body: Record<string, any> = {}) {
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (error) {
      const msg =
        (error as any)?.context?.body?.error ||
        (error as any)?.context?.body ||
        error.message ||
        `Edge ${name} failed`;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    return data;
  }

  const onRefresh = async () => {
    setBusy("refresh");
    try {
      await supabase.rpc("update_dashboard_statistics");
      toast({ title: "Dashboard updated", description: "Statistics recalculated for today." });
      // Trigger a page reload to refresh all analytics
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      toast({ title: "Refresh failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };


  const onRecomputeSession = async () => {
    if (!sessionId) return;
    setBusy("session");
    try {
      const { ok, results_url: resultsUrl } = await invokeEdge("finalizeAssessment", {
        session_id: sessionId.trim(),
      });

      if (!ok) {
        throw new Error("Finalize did not complete successfully");
      }

      toast({
        title: "Session finalized",
        description: resultsUrl ? `Results ready: ${resultsUrl}` : `Session ${sessionId.trim()} finalized`,
      });
    } catch (e: any) {
      toast({ title: "Finalization failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };


  const onProfileBackfill = async () => {
    setBusy("profileBackfill");
    try {
      const res = await invokeEdge("admin-backfill-profiles", { lookbackDays: 30, limit: 200 });
      toast({
        title: "Profile backfill complete",
        description: `${res?.succeeded ?? 0} succeeded, ${res?.failed ?? 0} failed of ${res?.attempted ?? 0} sessions`,
      });
    } catch (e: any) {
      toast({ title: "Profile backfill failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center max-w-full">
      <Button onClick={onRefresh} disabled={!!busy}>
        {busy === "refresh" ? "Refreshing…" : "Refresh Metrics"}
      </Button>
      
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="w-40"
        />
        <Button variant="secondary" onClick={onRecomputeSession} disabled={!!busy || !sessionId}>
          {busy === "session" ? "Recomputing…" : "Recompute Session"}
        </Button>
      </div>

      <Button variant="secondary" onClick={onProfileBackfill} disabled={!!busy}>
        {busy === "profileBackfill" ? "Processing…" : "Backfill Missing Profiles"}
      </Button>
    </div>
  );
}

export default AdminControls;

