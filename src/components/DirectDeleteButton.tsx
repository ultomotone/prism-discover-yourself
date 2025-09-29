import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const DirectDeleteButton = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Only show for daniel.joseph.speiss@gmail.com  
  if (user?.email !== "daniel.joseph.speiss@gmail.com") {
    return null;
  }

  const deleteInProgressSession = async () => {
    setIsDeleting(true);
    
    try {
      // Delete the specific in-progress session
      const { data, error } = await supabase.functions.invoke('delete-session', {
        body: { session_id: 'ddd83163-2a23-4267-8145-7427ee6119de' }
      });
      
      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "In-progress session deleted!",
          description: "The session has been removed from your dashboard",
        });
        console.log('🗑️ Session deleted:', data);
        // Refresh the page to update the dashboard
        window.location.reload();
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
      onClick={deleteInProgressSession}
      disabled={isDeleting}
      variant="outline"
      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 gap-2"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {isDeleting ? 'Deleting...' : 'Delete In-Progress Session'}
    </Button>
  );
};