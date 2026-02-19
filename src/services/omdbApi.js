import axios from 'axios'

const BASE = 'https://www.omdbapi.com'
const API_KEY = import.meta.env.VITE_OMDB_API_KEY

if (!API_KEY) {
  console.warn('VITE_OMDB_API_KEY is not set in .env')
}

export async function searchMovies(query, page = 1) {
  const { data } = await axios.get(BASE, {
    params: { s: query, apikey: API_KEY, page },
  })
  if (data.Response === 'False') return []
  return data.Search || []
}

export async function getMovieById(imdbId) {
  const { data } = await axios.get(BASE, {
    params: { i: imdbId, apikey: API_KEY },
  })
  if (data.Response === 'False') return null
  return data
}

export async function fetchMoviesByKeyword(keyword, page = 1) {
  const { data } = await axios.get(BASE, {
    params: { s: keyword, apikey: API_KEY, page },
  })
  if (data.Response === 'False') return []
  return data.Search || []
}

export async function getMovieByTitle(title) {
  try {
    if (!title || !title.trim()) return null
    
    const cleanTitle = title.trim()
    
    // First search for the movie
    const { data: searchData } = await axios.get(BASE, {
      params: { s: cleanTitle, apikey: API_KEY },
    })
    
    if (searchData.Response === 'False' || !searchData.Search || searchData.Search.length === 0) {
      // Try without common suffixes/prefixes
      const titleVariations = [
        cleanTitle.replace(/:\s*(The|Part|Chapter)\s+\d+/i, '').trim(),
        cleanTitle.replace(/\s*\(.*?\)/g, '').trim(), // Remove year/notes in parentheses
        cleanTitle.split(':')[0].trim(), // Take first part before colon
      ].filter(t => t && t !== cleanTitle)
      
      for (const variation of titleVariations) {
        const { data: altData } = await axios.get(BASE, {
          params: { s: variation, apikey: API_KEY },
        })
        if (altData.Response !== 'False' && altData.Search && altData.Search.length > 0) {
          const movieToFetch = altData.Search[0]
          if (movieToFetch.imdbID) {
            const fullDetails = await getMovieById(movieToFetch.imdbID)
            if (fullDetails && fullDetails.Response !== 'False') {
              return fullDetails
            }
          }
        }
      }
      return null
    }
    
    // Find the best match (exact title match preferred, then partial match)
    const exactMatch = searchData.Search.find(m => 
      m.Title.toLowerCase() === cleanTitle.toLowerCase()
    )
    
    const partialMatch = !exactMatch ? searchData.Search.find(m => 
      m.Title.toLowerCase().includes(cleanTitle.toLowerCase()) ||
      cleanTitle.toLowerCase().includes(m.Title.toLowerCase().split(':')[0])
    ) : null
    
    const movieToFetch = exactMatch || partialMatch || searchData.Search[0]
    
    // Get full details using IMDb ID
    if (movieToFetch.imdbID) {
      const fullDetails = await getMovieById(movieToFetch.imdbID)
      if (fullDetails && fullDetails.Response !== 'False') {
        return fullDetails
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching movie by title "${title}":`, error)
    return null
  }
}
