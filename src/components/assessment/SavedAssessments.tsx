
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Play, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { TOTAL_PRISM_QUESTIONS } from "@/services/prismConfig";

interface SavedSession {
  id: string;
  created_at: string;
  updated_at: string;
  completed_questions: number;
  total_questions: number;
}

interface SavedAssessmentsProps {
  onStartNew: () => void;
}

export function SavedAssessments({ onStartNew }: SavedAssessmentsProps) {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedSessions();
  }, []);

  const loadSavedSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: sessions, error } = await supabase
        .from('assessment_sessions')
        .select('id, created_at, updated_at, completed_questions, total_questions')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading saved sessions:', error);
        return;
      }

      setSavedSessions(sessions || []);
    } catch (error) {
      console.error('Error loading saved sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedSession = async (sessionId: string) => {
    try {
      setDeletingSessionId(sessionId);
      const { error } = await supabase.from('assessment_sessions').delete().eq('id', sessionId);

      if (error) {
        toast({
          title: "Delete Failed",
          description: "Could not delete saved assessment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({ title: "Assessment Deleted", description: "Saved assessment has been removed." });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleContinue = async (sessionId: string) => {
    const total = TOTAL_PRISM_QUESTIONS;
    const { count, error: countErr } = await supabase
      .from('assessment_responses')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (countErr) {
      console.warn('Count responses error, continuing anyway:', countErr);
    }

    const answered = count ?? 0;
    if (answered >= total) {
      navigate(`/results/${sessionId}`, { replace: true });
      return;
    }

    navigate(`/assessment?resume=${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">Loading saved assessments...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">Continue Your Assessment</h1>
        <p className="text-lg text-muted-foreground">
          You have saved assessments that you can continue, or start a new one.
        </p>
      </div>

      {savedSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Saved Assessments</h2>
          
          {savedSessions.map((session) => {
            const total = session.total_questions || TOTAL_PRISM_QUESTIONS;
            const answered = session.completed_questions || 0;
            const progress = Math.round((answered / total) * 100);
            const isDeleting = deletingSessionId === session.id;
            
            return (
              <Card key={session.id} className="prism-shadow-card">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        PRISM Assessment
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(session.updated_at || session.created_at), 'MMM d, yyyy')}
                        </div>
                        <Badge variant="secondary">
                          {progress}% Complete
                        </Badge>
                        <span>
                          {answered} of {total} questions
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSavedSession(session.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={() => handleContinue(session.id)}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-center pt-6">
        <Button 
          onClick={onStartNew}
          variant="outline"
          size="lg"
        >
          Start New Assessment
        </Button>
      </div>
    </div>
  );
}
