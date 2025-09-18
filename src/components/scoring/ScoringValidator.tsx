import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  ok: boolean;
  session_id: string;
  function_used: string;
  before: any;
  after: any;
  analysis: {
    score: string;
    issues: string[];
    successes: string[];
    summary: string;
  };
}

interface ScoringValidatorProps {
  sessionId: string;
  onValidated?: (result: ValidationResult) => void;
}

export function ScoringValidator({ sessionId, onValidated }: ScoringValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateScoring = async (useEnhanced = false) => {
    setIsValidating(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-scoring-fix', {
        body: { session_id: sessionId, use_enhanced: useEnhanced }
      });
      
      if (error) throw error;
      
      setResult(data);
      onValidated?.(data);
    } catch (err: any) {
      console.error('Validation failed:', err);
      setError(err.message || 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'PERFECT': return 'text-green-600 bg-green-50 border-green-200';
      case 'GOOD': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'NEEDS_WORK': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case 'PERFECT': return <CheckCircle className="h-4 w-4" />;
      case 'GOOD': return <AlertTriangle className="h-4 w-4" />;
      case 'NEEDS_WORK': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Scoring Validation
          <Badge variant="outline">{sessionId.substring(0, 8)}...</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={() => validateScoring(false)} 
            disabled={isValidating}
            variant="outline"
          >
            {isValidating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Current Engine
          </Button>
          <Button 
            onClick={() => validateScoring(true)} 
            disabled={isValidating}
          >
            {isValidating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Enhanced Engine
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className={`p-3 border rounded-lg ${getScoreColor(result.analysis.score)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getScoreIcon(result.analysis.score)}
                <span className="font-medium">
                  Score: {result.analysis.score}
                </span>
                <span className="text-sm opacity-75">
                  ({result.function_used})
                </span>
              </div>
              <div className="text-sm">{result.analysis.summary}</div>
            </div>

            {result.analysis.successes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">✅ Successes:</h4>
                <ul className="text-sm space-y-1">
                  {result.analysis.successes.map((success, idx) => (
                    <li key={idx} className="text-green-600">{success}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.analysis.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700">🚨 Issues Found:</h4>
                <ul className="text-sm space-y-1">
                  {result.analysis.issues.map((issue, idx) => (
                    <li key={idx} className="text-red-600">{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium mb-2">Before Scoring:</h4>
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(result.before, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">After Scoring:</h4>
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(result.after, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ScoringValidator;