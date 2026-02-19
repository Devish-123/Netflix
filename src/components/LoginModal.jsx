import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}
const modal = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore((s) => s.login)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!phone.trim() || !password) return
    login(phone.trim(), password)
    setPhone('')
    setPassword('')
    onSuccess?.()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="glass rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#e50914] hover:bg-[#f40612] text-white font-semibold transition-colors duration-200"
                >
                  Login
                </button>
              </form>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full py-2 text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
