import { useLocation } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
}

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div {...pageTransition}>
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/movie/:id"
          element={
            <motion.div {...pageTransition}>
              <MovieDetail />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}
