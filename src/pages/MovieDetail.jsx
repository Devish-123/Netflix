import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import LoginModal from '../components/LoginModal'
import { getMovieById } from '../services/omdbApi'
import { getMovieStoryline, getMovieAgeRestriction } from '../services/geminiApi'

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [storyline, setStoryline] = useState(null)
  const [ageRestriction, setAgeRestriction] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    
    const fetchMovieData = async () => {
      setLoading(true)
      const data = await getMovieById(id)
      if (!cancelled && data) {
        setMovie(data)
        setLoading(false)
        
        // Fetch AI-generated storyline and age restriction
        if (data.Title) {
          setLoadingAI(true)
          const [aiStoryline, aiAgeRestriction] = await Promise.all([
            getMovieStoryline(data.Title),
            getMovieAgeRestriction(data.Title),
          ])
          if (!cancelled) {
            setStoryline(aiStoryline)
            setAgeRestriction(aiAgeRestriction)
            setLoadingAI(false)
          }
        }
      } else if (!cancelled) {
        setLoading(false)
      }
    }
    
    fetchMovieData()
    return () => { cancelled = true }
  }, [id])

  const openTrailer = () => {
    const query = encodeURIComponent(`${movie?.Title || ''} official trailer`)
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      <Navbar 
        onSearchSelect={(m) => navigate(`/movie/${m.imdbID}`)} 
        onOpenLogin={() => setLoginModalOpen(true)}
        onAISuggestClick={() => navigate('/')}
      />
      {loading ? (
        <div className="pt-24 px-4 sm:px-6 lg:px-12">
          <div className="h-96 rounded-xl bg-neutral-800/50 animate-pulse" />
          <div className="mt-6 h-10 w-2/3 rounded bg-neutral-800 animate-pulse" />
          <div className="mt-4 h-4 w-full rounded bg-neutral-800 animate-pulse" />
        </div>
      ) : !movie ? (
        <div className="pt-24 px-4 text-center">
          <p className="text-gray-400">Movie not found.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 text-[#e50914] hover:underline"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 pt-16"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => navigate('/')}
          />
          
          {/* Modal Container */}
          <div className="relative h-full w-full max-w-7xl mx-auto flex">
            {/* Left Content Panel (1/3) */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="relative w-full md:w-2/5 lg:w-1/3 bg-gradient-to-r from-black/95 via-black/90 to-transparent p-6 md:p-8 lg:p-12 flex flex-col justify-between z-10 overflow-y-auto max-h-screen"
            >
              {/* Close Button */}
              <button
                onClick={() => navigate('/')}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Content */}
              <div className="flex-1">
                {/* Movie Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
                >
                  {movie.Title}
                </motion.h1>
                
                {/* Basic Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center gap-3 text-white text-sm mb-6"
                >
                  {movie.Year && <span>{movie.Year}</span>}
                  {ageRestriction && (
                    <span className="px-2 py-0.5 rounded bg-white/20 border border-white/30">
                      {ageRestriction}
                    </span>
                  )}
                  {movie.Runtime && <span>{movie.Runtime}</span>}
                  {movie.Language && movie.Language !== 'N/A' ? (
                    <span>{movie.Language.split(',')[0]}</span>
                  ) : (
                    <span>English</span>
                  )}
                </motion.div>
                
                {/* Storyline/Synopsis */}
                {loadingAI ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-400 text-sm">Loading storyline...</p>
                    </div>
                  </motion.div>
                ) : storyline ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white text-sm md:text-base leading-relaxed mb-6"
                  >
                    {storyline}
                  </motion.p>
                ) : movie.Plot && movie.Plot !== 'N/A' ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white text-sm md:text-base leading-relaxed mb-6"
                  >
                    {movie.Plot}
                  </motion.p>
                ) : null}
                
                {/* Genres */}
                {movie.Genre && movie.Genre !== 'N/A' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white text-sm mb-6"
                  >
                    {movie.Genre.split(',').map((genre, idx) => (
                      <span key={idx}>
                        {genre.trim()}
                        {idx < movie.Genre.split(',').length - 1 && ' | '}
                      </span>
                    ))}
                  </motion.div>
                )}
                
                {/* Cast & Crew - Compact */}
                {(movie.Director || movie.Actors) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="space-y-2 text-white text-sm mb-6"
                  >
                    {movie.Director && movie.Director !== 'N/A' && (
                      <div>
                        <span className="text-gray-400">Director: </span>
                        <span>{movie.Director}</span>
                      </div>
                    )}
                    {movie.Actors && movie.Actors !== 'N/A' && (
                      <>
                        {movie.Actors.split(',').slice(0, 1).length > 0 && (
                          <div>
                            <span className="text-gray-400">Hero: </span>
                            <span className="font-semibold">{movie.Actors.split(',')[0].trim()}</span>
                          </div>
                        )}
                        {movie.Actors.split(',').length > 1 && (
                          <div>
                            <span className="text-gray-400">Heroine: </span>
                            <span className="font-semibold">{movie.Actors.split(',')[1].trim()}</span>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3 mt-auto"
              >
                <button
                  type="button"
                  onClick={openTrailer}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)',
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-12 h-12 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                  aria-label="Add to List"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
            
            {/* Right Image Panel (2/3) */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="hidden md:block relative w-3/5 lg:w-2/3 h-full overflow-hidden"
            >
              {movie.Poster && movie.Poster !== 'N/A' ? (
                <>
                  {/* Main image - zoomed out and clearer */}
                  <img
                    src={movie.Poster}
                    alt={movie.Title}
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ 
                      objectPosition: 'center center',
                      filter: 'brightness(0.7) saturate(1)',
                      transform: 'scale(0.9)',
                    }}
                  />
                  {/* Subtle blurred background for depth */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{
                      backgroundImage: `url(${movie.Poster})`,
                      filter: 'blur(30px) brightness(0.4)',
                      transform: 'scale(1.2)',
                    }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
              )}
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent" />
            </motion.div>
          </div>
        </motion.div>
      )}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
