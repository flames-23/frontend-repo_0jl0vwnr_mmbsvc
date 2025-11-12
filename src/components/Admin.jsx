import { useEffect, useMemo, useState } from 'react'

function StatPill({ label, value, color }) {
  return (
    <div className={`flex-1 rounded-xl px-4 py-3 text-center shadow-sm ${color}`}>
      <div className="text-xs uppercase tracking-wide text-white/80">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

export default function Admin() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(`${baseUrl}/api/stats`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load stats')
        const data = await r.json()
        if (mounted) {
          setStats(data)
          setError('')
        }
      })
      .catch((e) => mounted && setError(e.message))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [baseUrl, refreshKey])

  const totalVotes = stats?.total_votes || 0
  const totalScore = stats?.total_score || 0
  const average = useMemo(() => (totalVotes ? (totalScore / totalVotes).toFixed(2) : '0.00'), [totalVotes, totalScore])

  const counts = stats?.counts || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }

  const resetVotes = async () => {
    if (!confirm('Reset all votes? This cannot be undone.')) return
    try {
      const r = await fetch(`${baseUrl}/api/reset`, { method: 'DELETE' })
      if (!r.ok) throw new Error('Reset failed')
      setRefreshKey((k) => k + 1)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm aspect-[9/16] bg-white/80 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-white/50">
        <div className="p-5 border-b border-white/40 bg-white/60">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800">Admin Dashboard</h1>
            <a href="/" className="text-xs font-medium text-indigo-700 hover:text-indigo-900">Home</a>
          </div>
          <p className="text-xs text-gray-600 mt-1">Live feedback stats</p>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto h-full">
          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <>
              <div className="flex gap-2">
                <StatPill label="Total Votes" value={totalVotes} color="bg-indigo-500" />
                <StatPill label="Total Score" value={totalScore} color="bg-fuchsia-500" />
              </div>
              <div className="flex gap-2">
                <StatPill label="Average" value={average} color="bg-violet-500" />
                <button onClick={resetVotes} className="flex-1 rounded-xl px-4 py-3 text-center shadow-sm bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors">Reset</button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {Object.entries(counts).map(([k, v]) => (
                  <div key={k} className="bg-gray-100 rounded-lg p-2 text-center shadow-inner">
                    <div className="text-xs font-semibold">{k}★</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent votes</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(stats?.timeline || []).slice().reverse().map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-100 shadow-sm">
                      <span className="text-sm font-medium">{t.score}★</span>
                      <span className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                  {(!stats?.timeline || stats.timeline.length === 0) && (
                    <div className="text-xs text-gray-500">No votes yet.</div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setRefreshKey((k) => k + 1)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 font-semibold shadow">Refresh</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
