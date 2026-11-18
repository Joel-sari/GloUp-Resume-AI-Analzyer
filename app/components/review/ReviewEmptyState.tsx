import { Link } from 'react-router'
import { motion } from 'motion/react'

/** Shown when there's no record, or the analysis never finished. */
const ReviewEmptyState = ({ title, body }: { title: string; body: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    className="mx-auto mt-16 w-full max-w-xl rounded-[28px] bg-gradient-to-br from-violet/60 via-pink/40 to-orange/40 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.6)]"
  >
    <div className="flex flex-col items-center gap-4 rounded-[27px] bg-surface/90 p-10 text-center backdrop-blur-xl">
      <span className="text-4xl">🔍</span>
      <p className="text-2xl font-semibold text-ink">{title}</p>
      <p className="text-muted">{body}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link to="/" className="back-button rounded-full px-5 py-2.5 font-medium">Back to dashboard</Link>
        <Link to="/upload" className="primary-button w-fit px-5 py-2.5 font-semibold hover:primary-gradient-hover">
          Run a new analysis
        </Link>
      </div>
    </div>
  </motion.div>
);

export default ReviewEmptyState
