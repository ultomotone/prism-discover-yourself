import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { fetchLiveAssessments, type LiveAssessment } from '@/lib/api/admin'

export default function LiveAssessmentsPage() {
  const [rows, setRows] = useState<LiveAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await fetchLiveAssessments(supabase)
        setRows(data)
      } catch (e: any) {
        setErr(e.message ?? 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="p-6">Loading…</div>
  if (err) return <div className="p-6 text-red-600">{err}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Live Assessments (Last 50)</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Overlay</th>
              <th className="py-2 pr-4">Fit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.session_id} className="border-b">
                <td className="py-2 pr-4">{new Date(r.created_at).toLocaleString()}</td>
                <td className="py-2 pr-4">{r.primary_type}</td>
                <td className="py-2 pr-4">{r.overlay_label}</td>
                <td className="py-2 pr-4">{typeof r.fit_score === 'number' ? `${r.fit_score.toFixed(1)}%` : r.fit_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
