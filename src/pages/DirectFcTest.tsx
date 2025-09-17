import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function DirectFcTest() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResults([]);
    
    const sessionId = '618c5ea6-aeda-4084-9156-0aac9643afd3';
    
    console.log('🎯 Testing score_fc_session function...');
    
    try {
      // Pre-test check
      const { data: preScores, error: preError } = await supabase
        .from('fc_scores')
        .select('*')
        .eq('session_id', sessionId)
        .eq('version', 'v1.2');
        
      if (preError) {
        console.error('Pre-test error:', preError);
        setResults(prev => [...prev, { type: 'error', msg: `Pre-test error: ${preError.message}` }]);
        return;
      }
      
      setResults(prev => [...prev, { type: 'info', msg: `Pre-test fc_scores: ${preScores?.length || 0} rows` }]);
      
      // Call function
      setResults(prev => [...prev, { type: 'info', msg: 'Invoking score_fc_session...' }]);
      
      const { data: fnResult, error: fnError } = await supabase.functions.invoke('score_fc_session', {
        body: {
          session_id: sessionId,
          basis: 'functions',
          version: 'v1.2'
        }
      });
      
      if (fnError) {
        console.error('Function error:', fnError);
        setResults(prev => [...prev, { type: 'error', msg: `Function error: ${JSON.stringify(fnError)}` }]);
        return;
      }
      
      setResults(prev => [...prev, { type: 'success', msg: `Function result: ${JSON.stringify(fnResult)}` }]);
      
      // Post-test check
      const { data: postScores, error: postError } = await supabase
        .from('fc_scores')
        .select('*')
        .eq('session_id', sessionId)
        .eq('version', 'v1.2');
        
      if (postError) {
        setResults(prev => [...prev, { type: 'error', msg: `Post-test error: ${postError.message}` }]);
        return;
      }
      
      setResults(prev => [...prev, { 
        type: 'info', 
        msg: `Post-test fc_scores: ${postScores?.length || 0} rows` 
      }]);
      
      if (postScores && postScores.length > 0) {
        const score = postScores[0];
        setResults(prev => [...prev, {
          type: 'success',
          msg: `FC Score created: version=${score.version}, blocks=${score.blocks_answered}, functions=${Object.keys(score.scores_json || {}).join(', ')}`
        }]);
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setResults(prev => [...prev, { type: 'error', msg: `Exception: ${error instanceof Error ? error.message : String(error)}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold mb-4">FC Smoke Test Execution</h3>
      
      <button 
        onClick={runTest}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run FC Smoke Test'}
      </button>
      
      <div className="space-y-2">
        {results.map((result, i) => (
          <div key={i} className={`p-2 rounded text-sm ${
            result.type === 'error' ? 'bg-red-100 text-red-700' :
            result.type === 'success' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {result.msg}
          </div>
        ))}
      </div>
    </div>
  );
}