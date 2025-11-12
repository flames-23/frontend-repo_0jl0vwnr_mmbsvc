import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Spline from '@splinetool/react-spline'

const EMOJIS = [
  { score: 1, label: 'Terrible', emoji: '😖', color: 'from-rose-500 to-rose-700' },
  { score: 2, label: 'Bad', emoji: '☹️', color: 'from-orange-400 to-orange-600' },
  { score: 3, label: 'Okay', emoji: '😐', color: 'from-amber-400 to-amber-600' },
  { score: 4, label: 'Good', emoji: '😊', color: 'from-emerald-400 to-emerald-600' },
  { score: 5, label: 'Great', emoji: '🤩', color: 'from-indigo-500 to-purple-600' },
]

export default function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [cooldown, setCooldown] = useState(false)
  const [thanks, setThanks] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let timer
    if (cooldown) {
      timer = setTimeout(() => setCooldown(false), 2000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  const vote = async (score) => {
    if (cooldown) return
    setCooldown(true)
    setSelected(score)
    try {
      const r = await fetch(`${baseUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      })
      const data = await r.json().catch(() => ({}))
      setThanks(data.message || 'Thanks for your feedback!')
    } catch (e) {
      setThanks('Thanks! (offline)')
    } finally {
      setTimeout(() => setSelected(null), 300)
      setTimeout(() => setThanks(''), 1800)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm aspect-[9/16] bg-white/80 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative">
        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <Spline scene="https://prod.spline.design/ezRAY9QD27kiJcur/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <header className="p-5 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900 drop-shadow">How was your experience?</h1>
            <p className="text-sm text-gray-700 mt-1">Tap an emoji to send feedback</p>
          </header>

          <main className="flex-1 px-5">
            <div className="grid grid-cols-5 gap-3">
              {EMOJIS.map((e) => (
                <motion.button
                  key={e.score}
                  whileHover={{ scale: cooldown ? 1 : 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => vote(e.score)}
                  disabled={cooldown}
                  className={`relative group rounded-2xl p-3 bg-white shadow-lg border border-white/60 transition-all ${cooldown ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl'} `}
                >
                  <motion.div
                    animate={{ scale: selected === e.score ? 1.2 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="text-3xl select-none"
                  >
                    {e.emoji}
                  </motion.div>
                  <div className="text-[10px] mt-1 font-medium text-gray-700">{e.label}</div>
                  <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-br ${e.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {thanks && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 text-center text-sm font-semibold text-gray-800"
                >
                  {thanks}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <a href="/admin" className="text-xs text-indigo-700 hover:underline font-medium">Admin dashboard</a>
            </div>
          </main>

          <footer className="p-5">
            <div className="bg-white/70 rounded-2xl p-3 shadow-inner border border-white/60">
              <p className="text-xs text-gray-700 text-center">Your vote is anonymous and helps us improve.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
