import { useState } from 'react'
import { motion } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  }),
}

export default function MovieCard({ movie, index = 0, onClick }) {
  const [loaded, setLoaded] = useState(false)
  const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null

  return (
    <motion.article
      className="card relative flex-shrink-0 w-[180px] sm:w-[200px] group cursor-pointer rounded-lg overflow-hidden"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        scale: 1.05,
        y: -8,
        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
      }}
      onClick={onClick}
    >
      <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-neutral-800 shadow-lg">
        {!loaded && (
          <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
        )}
        <img
          src={poster || 'https://placehold.co/200x300/1a1a1a/666?text=No+Poster'}
          alt={movie.Title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75"
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200 delay-100"
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          <h3 className="font-semibold text-white text-sm line-clamp-2">{movie.Title}</h3>
          {movie.imdbRating && (
            <p className="text-[#e50914] text-xs mt-1 font-medium">★ {movie.imdbRating} IMDb</p>
          )}
          {movie.Actors && (
            <p className="text-gray-300 text-xs mt-1 line-clamp-1">
              {movie.Actors.split(',').slice(0, 2).join(', ')}
              {movie.Actors.split(',').length > 2 && '...'}
            </p>
          )}
          {movie.Year && (
            <p className="text-gray-400 text-xs mt-0.5">{movie.Year}</p>
          )}
        </div>
      </div>
      <div
        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-250 -z-10"
        style={{
          boxShadow: '0 0 24px rgba(229, 9, 20, 0.35)',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </motion.article>
  )
}
