import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SearchBar from './SearchBar'
import { useAuthStore } from '../store/authStore'

export default function Navbar({ onSearchSelect, onOpenLogin, onAISuggestClick }) {
  const [scrolled, setScrolled] = useState(false)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <nav className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-12 h-16">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 z-10">
          <span className="text-2xl font-bold text-[#e50914]">NETFLIX</span>
        </Link>
        <div className="flex-1 flex justify-center max-w-xl hidden sm:block mx-4">
          <SearchBar onSelectMovie={onSearchSelect} />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 z-10">
          <button
            type="button"
            onClick={() => onAISuggestClick?.()}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/10 hover:bg-white/10 text-sm font-medium transition-all duration-200 group"
            title="AI Movie Suggestions"
          >
            <svg 
              className="w-4 h-4 text-[#e50914] group-hover:scale-110 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
            <span className="text-white">AI Suggestions</span>
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenLogin?.()}
              className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#f40612] text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
