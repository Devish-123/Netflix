import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import MovieRow from '../components/MovieRow'
import LoginModal from '../components/LoginModal'
import { useAuthStore } from '../store/authStore'
import { fetchMoviesByKeyword, getMovieById, getMovieByTitle } from '../services/omdbApi'
import { getAIMovieSuggestions } from '../services/geminiApi'

const ROW_KEYWORDS = [
  { title: 'Trending Movies', keyword: 'batman' },
  { title: 'Popular Movies', keyword: 'avengers' },
  { title: 'Latest Movies', keyword: '2024' },
  { title: 'Action Movies', keyword: 'mission' },
]

export default function Home() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const [rows, setRows] = useState(
    ROW_KEYWORDS.map((r) => ({ ...r, movies: [], loading: true }))
  )
  const [aiRow, setAiRow] = useState({ title: 'AI Recommended For You', movies: [], loading: false, error: null })
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [pendingMovie, setPendingMovie] = useState(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiInput, setAiInput] = useState('')
  const [heroDetail, setHeroDetail] = useState(null)
  const aiSectionRef = useRef(null)

  const fetchRow = useCallback(async (keyword) => {
    const list = await fetchMoviesByKeyword(keyword)
    return list
  }, [])

  useEffect(() => {
    const run = async () => {
      const next = await Promise.all(
        ROW_KEYWORDS.map(async (r) => {
          const movies = await fetchRow(r.keyword)
          return { ...r, movies, loading: false }
        })
      )
      setRows(next)
      if (next[0]?.movies?.[0]?.imdbID) {
        getMovieById(next[0].movies[0].imdbID).then(setHeroDetail)
      }
    }
    run()
  }, [fetchRow])

  const handleMovieClick = useCallback(
    (movie) => {
      if (!isLoggedIn) {
        setPendingMovie(movie)
        setLoginModalOpen(true)
        return
      }
      navigate(`/movie/${movie.imdbID}`)
    },
    [isLoggedIn, navigate]
  )

  const handleLoginSuccess = useCallback(() => {
    if (pendingMovie) {
      navigate(`/movie/${pendingMovie.imdbID}`)
      setPendingMovie(null)
    }
    setLoginModalOpen(false)
  }, [navigate, pendingMovie])

  const handleSearchSelect = useCallback(
    (movie) => {
      if (!isLoggedIn) {
        setPendingMovie(movie)
        setLoginModalOpen(true)
        return
      }
      navigate(`/movie/${movie.imdbID}`)
    },
    [isLoggedIn, navigate]
  )

  const fetchAiRecommendations = useCallback(async () => {
    if (!aiInput.trim()) return
    
    const prompt = aiInput.trim()
    setAiRow((prev) => ({ ...prev, loading: true, error: null, movies: [] }))
    setAiPrompt(prompt)
    
    try {
      let movieTitles = await getAIMovieSuggestions(prompt)
      
      // Fallback: if AI returns nothing, use the user's prompt as OMDb search
      if (!movieTitles || movieTitles.length === 0) {
        // Try searching OMDb directly with the prompt
        const fallbackResults = await fetchMoviesByKeyword(prompt)
        if (fallbackResults && fallbackResults.length > 0) {
          // Get full details for first few results
          const detailedResults = []
          for (const movie of fallbackResults.slice(0, 6)) {
            if (movie.imdbID) {
              const details = await getMovieById(movie.imdbID)
              if (details) detailedResults.push(details)
            }
          }
          setAiRow((prev) => ({
            ...prev,
            movies: detailedResults,
            loading: false,
            error: detailedResults.length === 0 ? 'No movies found for this query. Try different words.' : null,
          }))
          setAiInput('')
          return
        }
        setAiRow((prev) => ({
          ...prev,
          loading: false,
          error: 'No movies found for this query. Try different words.',
        }))
        setAiInput('')
        return
      }
      
      // For each movie title from Gemini, fetch full details from OMDb
      const results = []
      const failedTitles = []
      
      for (const title of movieTitles.slice(0, 10)) {
        try {
          const movieDetails = await getMovieByTitle(title.trim())
          if (movieDetails && movieDetails.Response !== 'False') {
            // Avoid duplicates
            const existing = results.find(m => m.imdbID === movieDetails.imdbID)
            if (!existing) {
              results.push(movieDetails)
            }
          } else {
            failedTitles.push(title)
            // Try alternative search - maybe the title needs adjustment
            const altResults = await fetchMoviesByKeyword(title.trim())
            if (altResults && altResults.length > 0) {
              const altDetails = await getMovieById(altResults[0].imdbID)
              if (altDetails && altDetails.Response !== 'False') {
                const existing = results.find(m => m.imdbID === altDetails.imdbID)
                if (!existing) {
                  results.push(altDetails)
                }
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch movie "${title}":`, err)
          failedTitles.push(title)
        }
      }
      
      // If we got some results but not all, that's okay
      if (results.length > 0) {
        setAiRow((prev) => ({
          ...prev,
          movies: results,
          loading: false,
          error: failedTitles.length > 0 && results.length < 3 
            ? `Found ${results.length} movie(s). Some titles may not be in the database.` 
            : null,
        }))
      } else {
        // If nothing found, try direct OMDb search as fallback
        const fallbackResults = await fetchMoviesByKeyword(prompt)
        if (fallbackResults && fallbackResults.length > 0) {
          const detailedResults = []
          for (const movie of fallbackResults.slice(0, 6)) {
            if (movie.imdbID) {
              const details = await getMovieById(movie.imdbID)
              if (details && details.Response !== 'False') {
                detailedResults.push(details)
              }
            }
          }
          setAiRow((prev) => ({
            ...prev,
            movies: detailedResults,
            loading: false,
            error: detailedResults.length === 0 
              ? 'No movies found in database. Try searching for specific movie titles or popular films.' 
              : null,
          }))
        } else {
          setAiRow((prev) => ({
            ...prev,
            movies: [],
            loading: false,
            error: 'No movies found. Please try specific movie titles or popular films that are in the IMDb database.',
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error)
      setAiRow((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to get recommendations. Please check your Gemini API key.',
      }))
    }
    
    setAiInput('')
  }, [aiInput])

  const scrollToAISection = useCallback(() => {
    if (aiSectionRef.current) {
      aiSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Focus the input after scrolling
      setTimeout(() => {
        const input = aiSectionRef.current?.querySelector('input')
        input?.focus()
      }, 500)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      <Navbar 
        onSearchSelect={handleSearchSelect} 
        onOpenLogin={() => setLoginModalOpen(true)}
        onAISuggestClick={scrollToAISection}
      />
      <main>
        <HeroBanner movies={rows[0]?.movies || []} detail={heroDetail} />
        <div className="relative -mt-20 z-10 pt-8">
          <MovieRow
            title={rows[0]?.title || 'Trending Movies'}
            movies={rows[0]?.movies || []}
            loading={rows[0]?.loading}
            onMovieClick={handleMovieClick}
          />
          {rows.slice(1).map((row) => (
            <MovieRow
              key={row.title}
              title={row.title}
              movies={row.movies}
              loading={row.loading}
              onMovieClick={handleMovieClick}
            />
          ))}
          <section ref={aiSectionRef} className="mb-10 px-4 sm:px-6 lg:px-12 scroll-mt-24">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Recommended For You
              </h2>
              <div className="flex gap-2 flex-1 min-w-0">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAiRecommendations()}
                  placeholder="e.g. dark thriller movies, emotional sci-fi"
                  className="flex-1 min-w-0 py-2 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e50914] text-sm"
                />
                <button
                  type="button"
                  onClick={fetchAiRecommendations}
                  className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-[#f40612] text-sm font-medium whitespace-nowrap"
                >
                  Get recommendations
                </button>
              </div>
            </div>
            {aiPrompt && (
              <p className="text-gray-400 text-sm mb-3">Based on: &quot;{aiPrompt}&quot;</p>
            )}
            {aiRow.error && (
              <div className="mb-3 px-4">
                <p className="text-red-400 text-sm">{aiRow.error}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Tip: Try searching for specific movie titles or popular films. The database contains movies from IMDb.
                </p>
              </div>
            )}
            {!aiRow.loading && aiRow.movies.length === 0 && !aiRow.error && (
              <p className="text-gray-500 text-sm mb-3 px-4">Enter a prompt above to get AI recommendations</p>
            )}
            <MovieRow
              title=""
              movies={aiRow.movies}
              loading={aiRow.loading}
              onMovieClick={handleMovieClick}
            />
          </section>
        </div>
      </main>
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false)
          setPendingMovie(null)
        }}
        onSuccess={handleLoginSuccess}
      />
    </div>
  )
}
