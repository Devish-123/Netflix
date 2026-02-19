import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchMovies } from '../services/omdbApi'

const DEBOUNCE_MS = 400

export default function SearchBar({ onSelectMovie }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      const results = await searchMovies(query.trim(), 1)
      setSuggestions(results)
      setLoading(false)
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleSelect = (movie) => {
    onSelectMovie(movie)
    setQuery('')
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => query && setOpen(true)}
          placeholder="Search movies..."
          className="w-full py-2.5 pl-12 pr-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:border-transparent text-sm"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <AnimatePresence>
        {open && (suggestions.length > 0 || loading) && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 mt-1 py-2 rounded-lg glass border border-white/10 shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            {loading ? (
              <li className="px-4 py-3 text-gray-400">Searching...</li>
            ) : (
              suggestions.map((movie) => (
                <li key={movie.imdbID}>
                  <button
                    type="button"
                    onClick={() => handleSelect(movie)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-left"
                  >
                    {movie.Poster && movie.Poster !== 'N/A' ? (
                      <img
                        src={movie.Poster}
                        alt=""
                        className="w-10 h-14 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded bg-neutral-700 flex-shrink-0" />
                    )}
                    <span className="text-white truncate">{movie.Title}</span>
                    {movie.Year && (
                      <span className="text-gray-500 text-sm ml-auto">{movie.Year}</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
