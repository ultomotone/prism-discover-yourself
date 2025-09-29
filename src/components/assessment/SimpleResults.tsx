import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { TYPE_CORE_DESCRIPTIONS, TypeCoreDescription } from "@/data/typeCoreDescriptions";

interface SimpleResultsProps {
  sessionId: string;
}

interface BasicResult {
  type_code: string;
  confidence: number;
  scoring_version: string;
  computed_at: string;
}

export function SimpleResults({ sessionId }: SimpleResultsProps) {
  const [result, setResult] = useState<BasicResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBasicResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get basic scoring results directly from the scoring_results table
      const { data: scoringData, error: scoringError } = await supabase
        .from('scoring_results')
        .select('type_code, confidence, scoring_version, computed_at')
        .eq('session_id', sessionId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (scoringError) {
        console.error('Error fetching scoring results:', scoringError);
        setError(`Database error: ${scoringError.message}`);
        return;
      }

      if (!scoringData) {
        setError('No scoring results found for this session');
        return;
      }

      setResult(scoringData as BasicResult);
    } catch (err) {
      console.error('Error in fetchBasicResults:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchBasicResults();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Unable to Load Results</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchBasicResults} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">No Results Found</h2>
          <p className="text-muted-foreground">No scoring results available for this session.</p>
        </CardContent>
      </Card>
    );
  }

  // Get type description
  const typeInfo = TYPE_CORE_DESCRIPTIONS[result.type_code];
  const confidencePercentage = (result.confidence * 100).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Type Result */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Your PRISM Type</CardTitle>
            <Badge variant="outline">
              v{result.scoring_version}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">
              {result.type_code}
            </div>
            <div className="text-xl text-muted-foreground mb-4">
              {typeInfo?.title || 'Type Information'}
            </div>
            <Badge variant="secondary" className="text-sm">
              Confidence: {confidencePercentage}%
            </Badge>
          </div>

          {typeInfo && (
            <div className="space-y-4 mt-6">
              <div>
                <h3 className="font-semibold mb-2">Core Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {typeInfo.paragraphs?.[0] || 'Description not available'}
                </p>
              </div>

              {typeInfo.paragraphs?.[1] && (
                <div>
                  <h3 className="font-semibold mb-2">Key Insights</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {typeInfo.paragraphs[1]}
                  </p>
                </div>
              )}

              {typeInfo.paragraphs?.[2] && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Details</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {typeInfo.paragraphs[2]}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-6 pt-4 border-t">
            Results computed: {new Date(result.computed_at).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Note about basic results */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Basic Results View</p>
              <p>
                This is a simplified view showing your core type. 
                Additional details like function strengths, dimensionality, and comprehensive analysis 
                will be available once the full results system is operational.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}