import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

function AdminControls() {
  const { toast } = useToast();
  const [busy, setBusy] = useState<null | "refresh" | "backfill" | "recompute" | "session" | "bulk248" | "profileBackfill">(null);
  const [sessionId, setSessionId] = useState("");

  async function invokeEdge<T = any>(name: string, body: Record<string, any> = {}) {
    const { data, error } = await supabase.functions.invoke<T>(name, { body });
    if (error) {
      const msg =
        (error as any)?.context?.body?.error ||
        (error as any)?.context?.body ||
        error.message ||
        `Edge ${name} failed`;
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    return data as T;
  }

  const onRefresh = async () => {
    setBusy("refresh");
    try {
      await supabase.rpc("update_dashboard_statistics");
      toast({ title: "Dashboard updated", description: "Statistics recalculated for today." });
    } catch (e: any) {
      toast({ title: "Refresh failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const onBackfill = async () => {
    setBusy("backfill");
    try {
      const res = await invokeEdge("recompute-profiles", { days_back: 30, limit: 500 });
      toast({
        title: "Backfill complete",
        description: `Updated ${res?.updated ?? 0} / ${res?.processed ?? 0} sessions`,
      });
    } catch (e: any) {
      toast({ title: "Backfill failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const onRecompute = async () => {
    setBusy("recompute");
    try {
      const res = await invokeEdge("recompute-profiles", {
        days_back: 90,
        limit: 2000,
      });
      toast({
        title: "Recompute complete",
        description: `Updated ${res?.updated ?? 0} / ${res?.processed ?? 0} sessions`,
      });
    } catch (e: any) {
      toast({ title: "Recompute failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const onRecomputeSession = async () => {
    if (!sessionId) return;
    setBusy("session");
    try {
      const res = await invokeEdge("recompute-profiles", { session_id: sessionId.trim() });
      toast({
        title: "Session recomputed",
        description: `Updated ${res?.updated ?? 0} / ${res?.processed ?? 0} sessions`,
      });
    } catch (e: any) {
      toast({ title: "Recompute failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const onBulkRecompute248 = async () => {
    setBusy("bulk248");
    try {
      const res = await invokeEdge("cron-force-finalize-248");
      toast({
        title: "Bulk recompute complete",
        description: `Processed ${res?.count ?? 0} sessions with 248+ questions`,
      });
    } catch (e: any) {
      toast({ title: "Bulk recompute failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const onProfileBackfill = async () => {
    setBusy("profileBackfill");
    try {
      // First do a dry run
      const dryRun = await invokeEdge("backfill-profiles", { dryRun: true, sinceDays: 30 });
      
      if (dryRun.count > 0) {
        const confirmed = window.confirm(
          `Found ${dryRun.count} sessions needing profile backfill. Proceed with actual backfill?`
        );
        
        if (confirmed) {
          const res = await invokeEdge("backfill-profiles", { dryRun: false, sinceDays: 30 });
          toast({
            title: "Profile backfill complete",
            description: `Processed ${res?.processed ?? 0} of ${res?.count ?? 0} sessions`,
          });
        } else {
          toast({
            title: "Backfill cancelled",
            description: `Would have processed ${dryRun.count} sessions`,
          });
        }
      } else {
        toast({
          title: "No backfill needed",
          description: "All completed sessions already have profiles",
        });
      }
    } catch (e: any) {
      toast({ title: "Profile backfill failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button onClick={onRefresh} disabled={!!busy}>
        {busy === "refresh" ? "Refreshing…" : "Refresh"}
      </Button>
      <Button variant="destructive" onClick={onBackfill} disabled={!!busy}>
        {busy === "backfill" ? "Backfilling…" : "Run v1.1 Backfill"}
      </Button>
      <Button variant="secondary" onClick={onRecompute} disabled={!!busy}>
        {busy === "recompute" ? "Recomputing…" : "Recompute v1.1"}
      </Button>
      <Input
        placeholder="Session ID"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        className="w-52"
      />
      <Button variant="secondary" onClick={onRecomputeSession} disabled={!!busy || !sessionId}>
        {busy === "session" ? "Recomputing…" : "Recompute Session"}
      </Button>
      <Button variant="outline" onClick={onBulkRecompute248} disabled={!!busy}>
        {busy === "bulk248" ? "Processing…" : "Recompute All 248+ Sessions"}
      </Button>
      <Button variant="secondary" onClick={onProfileBackfill} disabled={!!busy}>
        {busy === "profileBackfill" ? "Backfilling…" : "Backfill Missing Profiles"}
      </Button>
    </div>
  );
}

export default AdminControls;

