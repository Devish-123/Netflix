import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function HeroBanner({ movies = [], detail = null }) {
  const [hero, setHero] = useState(null)
  const display = detail || hero

  useEffect(() => {
    if (movies.length) {
      const first = movies[0]
      setHero(first)
    }
  }, [movies])

  if (!hero) return null

  const poster = (display?.Poster || hero.Poster) && (display?.Poster || hero.Poster) !== 'N/A'
    ? (display.Poster || hero.Poster)
    : null

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-[70vh] min-h-[400px] flex items-end overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: poster
            ? `url(${poster})`
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
        animate={{ scale: [1, 1.08] }}
        transition={{ duration: 8, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/90 to-transparent" />
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 pb-20 pt-24">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white max-w-2xl drop-shadow-lg"
        >
          {display?.Title || hero.Title}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex flex-wrap items-center gap-3 mt-2 text-lg text-gray-300"
        >
          {(display?.Year || hero.Year) && <span>{display?.Year || hero.Year}</span>}
          {display?.imdbRating && (
            <span className="text-[#e50914] font-semibold">★ {display.imdbRating} IMDb</span>
          )}
          {display?.Runtime && <span>{display.Runtime}</span>}
        </motion.div>
        {display?.Plot && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-4 text-gray-400 max-w-xl line-clamp-2 text-sm sm:text-base"
          >
            {display.Plot}
          </motion.p>
        )}
      </div>
    </motion.section>
  )
}
