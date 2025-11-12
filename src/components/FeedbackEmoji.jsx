import { motion } from 'framer-motion'

export default function FeedbackEmoji({ label, emoji, selected, disabled, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative group rounded-2xl p-3 bg-white shadow-lg border border-white/60 transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl'}`}
    >
      <motion.div
        animate={{ scale: selected ? 1.2 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="text-3xl select-none"
      >
        {emoji}
      </motion.div>
      <div className="text-[10px] mt-1 font-medium text-gray-700">{label}</div>
      <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity`} />
    </motion.button>
  )
}
