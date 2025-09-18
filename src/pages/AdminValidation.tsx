import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoringValidator } from '@/components/scoring/ScoringValidator';

export default function AdminValidation() {
  // Example session IDs for testing - replace with actual ones
  const testSessions = [
    'test-session-1',
    'test-session-2', 
    'test-session-3'
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 PRISM Scoring Validation Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm mb-6">
            <p>
              This tool validates the scoring engine fixes for the issues identified in the results page:
            </p>
            <ul>
              <li><strong>Uniform Shares (6.3%)</strong> - All types getting identical probabilities</li>
              <li><strong>Flat Fits (85)</strong> - All candidates getting the same fit score</li>
              <li><strong>Missing Strengths</strong> - Functions all showing "Typical 3.0"</li>
              <li><strong>Missing Dimensionality</strong> - All dimensions showing as "0" or "not available"</li>
              <li><strong>Missing Blocks</strong> - Block compositions not computed</li>
              <li><strong>Inactive Overlays</strong> - State overlays not affecting scoring</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Test Sessions</h2>
        <div className="space-y-4">
          {testSessions.map((sessionId) => (
            <ScoringValidator 
              key={sessionId}
              sessionId={sessionId}
              onValidated={(result) => {
                console.log(`Validation result for ${sessionId}:`, result);
              }}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>💡 Expected Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✅ Current Engine Should Show:</h4>
              <ul className="text-green-600 space-y-1">
                <li>• Issues detected (uniform shares, flat fits, etc.)</li>
                <li>• NEEDS_WORK or GOOD score</li>
                <li>• Placeholder values in strengths/dimensions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">🚀 Enhanced Engine Should Show:</h4>
              <ul className="text-blue-600 space-y-1">
                <li>• Varied shares with meaningful gaps</li>
                <li>• Different fit scores across types</li>
                <li>• Computed strengths with variance</li>
                <li>• Dimensionality distribution (1D-4D)</li>
                <li>• Block compositions and overlays</li>
                <li>• PERFECT or GOOD score</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}