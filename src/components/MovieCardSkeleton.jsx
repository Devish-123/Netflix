import { motion } from 'framer-motion'

export default function MovieCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-shrink-0 w-[180px] sm:w-[200px]"
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800/80">
        <div className="w-full h-full bg-gradient-to-r from-neutral-800 via-neutral-700/50 to-neutral-800 bg-[length:200%_100%] animate-shimmer" />
      </div>
      <div className="mt-2 h-4 w-3/4 rounded bg-neutral-800 animate-pulse" />
      <div className="mt-1 h-3 w-1/3 rounded bg-neutral-800 animate-pulse" />
    </motion.div>
  )
}
