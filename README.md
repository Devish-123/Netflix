
# Netflix Clone – Premium

A cinematic Netflix-style React app with OMDb and Gemini AI integration.

## Tech Stack 

- **React** (Vite)
- **Tailwind CSS
- **Framer Motion** (animations)
-Zustand** (global state)
- **Axios** (API requests)
- **React Router*

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env` and set your API keys (never commit `.env`):

   ```env
   VITE_OMDB_API_KEY=YOUR_OMDB_KEY
   VITE_GEMINI_API_KEY=YOUR_GEMINI_KEY
   ```

   - **OMDb**: Get a free key at [omdbapi.com](https://www.omdbapi.com/apikey.aspx).
   - **Gemini**: Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

3. **Run the app**

   ```bash
   npm run dev
   ```

   Open the URL shown in the terminal (e.g. `http://localhost:5173`).

## Features

- **Home**: Auto-loads rows (Trending, Popular, Latest, Action) from OMDb; hero banner with slow zoom.
- **Movie cards**: Poster, title, IMDb rating when available; hover scale, lift, glow, overlay.
- **Click flow**: Not logged in → Login modal (phone + password, front-end only); after login → Movie detail.
- **Movie detail**: Full OMDb data; Trailer button opens YouTube search in a new tab.
- **Search**: Navbar search with 400ms debounce and dropdown suggestions; same login check on select.
- **AI row**: Type a prompt (e.g. “dark thriller movies”); Gemini returns keywords/titles; OMDb fetches and shows “AI Recommended For You” row.
- **UX**: Skeleton loaders, lazy images, horizontal scroll snap, glassmorphism, smooth transitions, dimmed non-hovered cards.

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run preview` – Preview production build
=======
# Netflix
>>>>>>> 9dea54a5c1cc8499eb899888a3abe0059c876644
