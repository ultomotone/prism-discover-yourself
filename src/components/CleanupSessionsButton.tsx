import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const CleanupSessionsButton = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);

  // Only show for daniel.joseph.speiss@gmail.com
  if (user?.email !== 'daniel.joseph.speiss@gmail.com') {
    return null;
  }

  const runCleanup = async () => {
    setIsRunning(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-sessions');
      
      if (error) {
        console.error("❌ Cleanup error:", error);
        toast.error(`Cleanup failed: ${error.message}`);
        return;
      }

      if (data && data.success) {
        toast.success(`✅ Cleanup completed! Deleted ${data.deleted_count} old sessions`);
        console.log('🧹 Sessions cleaned up:', data);
      } else {
        toast.error(data?.message || 'Cleanup failed - no data returned');
      }
    } catch (error: any) {
      console.error('❌ Cleanup error:', error);
      toast.error(`Failed to run cleanup: ${error.message || 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button
      onClick={runCleanup}
      disabled={isRunning}
      variant="outline"
      className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
    >
      {isRunning ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {isRunning ? 'Cleaning...' : 'Cleanup'}
    </Button>
  );
};