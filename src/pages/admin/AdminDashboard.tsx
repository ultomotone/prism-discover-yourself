import React, { lazy, Suspense, useEffect } from "react";
import { ADMIN_MODE } from "@/lib/env";
import { triggerRecompute } from "@/utils/triggerRecompute";

const LiteAdmin = () => {
  const handleRecompute = async () => {
    console.log('🚀 Manual recompute triggered...');
    try {
      const result = await triggerRecompute();
      console.log('✅ Manual recompute result:', result);
      alert(`Recompute ${result.success ? 'completed successfully!' : 'failed: ' + result.error}`);
    } catch (error) {
      console.error('❌ Manual recompute error:', error);
      alert('Recompute failed: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">PRISM Admin</h1>
      <section className="rounded-lg border p-4">
        <h2 className="mb-2 font-medium">Utilities</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Recompute a session (score_prism)</li>
          <li>Inspect recent scoring logs</li>
          <li>Backfill v2 rows (types/functions/state)</li>
        </ol>
        <div className="mt-4">
          <button 
            onClick={handleRecompute}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🚀 Trigger Recompute Now
          </button>
        </div>
      </section>
    </div>
  );
};

const FullAdmin = lazy(() => import("./FullAdminApp"));

export default function AdminDashboard(): React.ReactElement {
  const full = ADMIN_MODE === "full";
  
  // Auto-trigger recompute when dashboard loads
  useEffect(() => {
    console.log('🎯 Dashboard loaded - triggering recompute...');
    console.log('ADMIN_MODE:', ADMIN_MODE);
    
    // Add error handling
    try {
      triggerRecompute().then((result) => {
        console.log('✅ Recompute result:', result);
      }).catch((error) => {
        console.error('❌ Recompute failed:', error);
      });
    } catch (error) {
      console.error('❌ Recompute error:', error);
    }
  }, []);
  
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading admin…</div>}>
      {full ? <FullAdmin /> : <LiteAdmin />}
    </Suspense>
  );
}
