import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface DeleteSessionButtonProps {
  sessionId: string;
  onDeleted?: () => void;
}

export const DeleteSessionButton = ({ sessionId, onDeleted }: DeleteSessionButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Only show for daniel.joseph.speiss@gmail.com  
  if (user?.email !== "daniel.joseph.speiss@gmail.com") {
    return null;
  }

  const deleteSession = async () => {
    setIsDeleting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('delete-session', {
        body: { session_id: sessionId }
      });
      
      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Session deleted!",
          description: `Session ${sessionId.slice(0, 8)}... has been removed`,
        });
        console.log('🗑️ Session deleted:', data);
        onDeleted?.();
      } else {
        toast({
          title: "Delete failed",
          description: data.message || 'Unknown error occurred',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast({
        title: "Failed to delete session",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={deleteSession}
      disabled={isDeleting}
      variant="outline"
      size="sm"
      className="gap-2 text-destructive hover:bg-destructive/10"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
};