import axios from 'axios'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  console.warn('VITE_GEMINI_API_KEY is not set in .env')
}

export async function getAIMovieSuggestions(userPrompt) {
  if (!API_KEY) {
    console.warn('Gemini API key not set')
    return []
  }

  const prompt = `You are a movie expert with access to IMDb database. The user asked: "${userPrompt}"

CRITICAL: Return ONLY movie titles that are GUARANTEED to exist in the OMDb/IMDb database. 
These must be REAL, POPULAR, WELL-KNOWN movies that are definitely in IMDb.

Rules:
1. Return exactly 5-8 SPECIFIC movie titles (not keywords or genres)
2. Use the EXACT official English titles as they appear in IMDb
3. For regional movies (Telugu, Hindi, Tamil, etc.), use their official IMDb English titles
4. Prioritize popular, well-known movies that are definitely in IMDb
5. If the request is for a specific language/region, return actual movie titles from that region
6. Output ONLY a valid JSON array, no explanations or markdown

Examples:
- "Telugu movies" → ["Baahubali: The Beginning", "RRR", "Pushpa: The Rise", "KGF: Chapter 1", "Magadheera"]
- "Hindi movies" → ["Dangal", "3 Idiots", "Lagaan", "PK", "Bajrangi Bhaijaan"]
- "dark sci-fi" → ["Blade Runner 2049", "Ex Machina", "Arrival", "Annihilation", "The Matrix"]

Output format: ["Movie Title 1", "Movie Title 2", "Movie Title 3", ...]`

  try {
    const { data } = await axios.post(
      `${GEMINI_URL}?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.warn('No text in Gemini response:', data)
      return []
    }

    // Try to extract JSON array from the response
    let cleaned = text.trim()
    
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    
    // Try to find JSON array in the text
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      cleaned = jsonMatch[0]
    }
    
    // Remove any leading/trailing non-JSON characters
    cleaned = cleaned.replace(/^[^\[\[]*/, '').replace(/[^\]]*$/, '')
    
    try {
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(item => typeof item === 'string' && item.trim().length > 0)
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', cleaned, parseError)
      // Fallback: try to extract movie titles from the text
      const lines = text.split('\n').filter(line => line.trim().length > 0)
      const extracted = lines
        .map(line => {
          // Try to extract quoted strings or simple titles
          const quoted = line.match(/"([^"]+)"/g)
          if (quoted) {
            return quoted.map(q => q.replace(/"/g, ''))
          }
          // Or extract simple words/phrases
          const words = line.match(/\b[\w\s-]{2,30}\b/g)
          return words ? words.slice(0, 2) : []
        })
        .flat()
        .filter(item => item && item.length > 1)
        .slice(0, 8)
      
      if (extracted.length > 0) {
        console.log('Using fallback extraction:', extracted)
        return extracted
      }
    }
    
    console.warn('Could not extract valid movie suggestions from:', text)
    return []
  } catch (e) {
    console.error('Gemini API error:', e.response?.data || e.message, e)
    return []
  }
}

export async function getMovieStoryline(movieTitle) {
  if (!API_KEY) {
    console.warn('Gemini API key not set')
    return null
  }

  const prompt = `Provide a brief, engaging storyline/plot summary for the movie "${movieTitle}". 
Keep it concise (2-3 sentences), spoiler-free, and engaging. 
Do not include any explanations or markdown, just the storyline text directly.`

  try {
    const { data } = await axios.post(
      `${GEMINI_URL}?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    
    // Clean up the response
    return text.trim().replace(/^["']|["']$/g, '')
  } catch (e) {
    console.error('Gemini API error getting storyline:', e.response?.data || e.message)
    return null
  }
}

export async function getMovieAgeRestriction(movieTitle) {
  if (!API_KEY) {
    console.warn('Gemini API key not set')
    return null
  }

  const prompt = `What is the age restriction/rating for the movie "${movieTitle}"? 
Respond with ONLY the rating (e.g., "R", "PG-13", "PG", "18+", "NC-17", "TV-MA", etc.) or "Not Rated" if unknown.
Do not include any explanations, just the rating.`

  try {
    const { data } = await axios.post(
      `${GEMINI_URL}?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 50,
        },
      },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    
    // Extract rating (clean up response)
    const cleaned = text.trim().replace(/^["']|["']$/g, '').toUpperCase()
    // Common ratings
    const ratings = ['R', 'PG-13', 'PG', 'G', 'NC-17', 'TV-MA', 'TV-14', 'TV-PG', '18+', '16+', '12+', 'NOT RATED']
    const found = ratings.find(r => cleaned.includes(r))
    return found || cleaned.split('\n')[0].split('.')[0].trim()
  } catch (e) {
    console.error('Gemini API error getting age restriction:', e.response?.data || e.message)
    return null
  }
}
