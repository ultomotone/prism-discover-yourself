import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const CleanupSessionsButton = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Only show for daniel.joseph.speiss@gmail.com
  if (user?.email !== "daniel.joseph.speiss@gmail.com") {
    return null;
  }

  const runCleanup = async () => {
    setIsRunning(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-sessions');
      
      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Cleanup completed!",
          description: `Deleted ${data.deleted_count} old sessions`,
        });
        console.log('🧹 Sessions cleaned up:', data);
      } else {
        toast({
          title: "Cleanup failed",
          description: data.message || 'Unknown error occurred',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error);
      toast({
        title: "Failed to run cleanup",
        description: "Please try again later",
        variant: "destructive",
      });
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