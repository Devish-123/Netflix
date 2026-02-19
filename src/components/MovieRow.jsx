import { useRef } from 'react'
import { motion } from 'framer-motion'
import MovieCard from './MovieCard'
import MovieCardSkeleton from './MovieCardSkeleton'

export default function MovieRow({ title, movies = [], loading, onMovieClick }) {
  const rowRef = useRef(null)

  const scroll = (dir) => {
    if (!rowRef.current) return
    const step = rowRef.current.clientWidth * 0.6
    rowRef.current.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' })
  }

  return (
    <section className="mb-10">
      {title ? (
        <div className="flex items-center justify-between mb-3 px-4 sm:px-6 lg:px-12">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-2 rounded-full glass border border-white/10 hover:bg-white/10 transition-colors"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-2 rounded-full glass border border-white/10 hover:bg-white/10 transition-colors"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      ) : (
        <div className="mb-3 px-4 sm:px-6 lg:px-12 flex justify-end">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-2 rounded-full glass border border-white/10 hover:bg-white/10 transition-colors"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-2 rounded-full glass border border-white/10 hover:bg-white/10 transition-colors"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div
        ref={rowRef}
        className="movie-row flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide px-4 sm:px-6 lg:px-12 pb-2 snap-x snap-mandatory"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : movies.map((movie, i) => (
              <div key={movie.imdbID || i} className="snap-start flex-shrink-0">
                <MovieCard
                  movie={movie}
                  index={i}
                  onClick={() => onMovieClick(movie)}
                />
              </div>
            ))}
      </div>
    </section>
  )
}
