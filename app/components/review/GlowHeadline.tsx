import { motion } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] as const;

const Sparkle = ({ className, delay }: { className: string; delay: number }) => (
  <motion.svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`pointer-events-none absolute text-ink drop-shadow-[0_0_8px_rgba(236,72,153,0.9)] ${className}`}
    initial={{ opacity: 0, scale: 0, rotate: -45 }}
    animate={{ opacity: [0, 1, 0.4, 1], scale: [0, 1.3, 0.85, 1], rotate: 0 }}
    transition={{ duration: 0.9, delay, ease: 'easeOut' }}
  >
    <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
  </motion.svg>
);

/**
 * "Your Resume, Glowed Up" — the words do what they say:
 * "Glowed" wipes in from blurry to sharp, "Up" springs upward into place,
 * a soft glow pulses behind them, a light band sweeps the gradient every
 * few seconds (.glow-shimmer in app.css) and sparkles pop in around "Up".
 */
const GlowHeadline = () => (
  <h1 className="!text-4xl sm:!text-5xl xl:!text-6xl">
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
    >
      Your Resume,
    </motion.span>{' '}
    <span className="relative isolate inline-block whitespace-nowrap">
      {/* soft gradient halo behind the words = the glow */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -inset-y-3 -z-10 rounded-full bg-gradient-to-r from-violet/60 via-pink/55 to-orange/50 blur-2xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.45, 0.95, 0.45], scale: [0.95, 1.06, 0.95] }}
        transition={{ duration: 4.5, delay: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.span
        className="glow-shimmer glow-from-start relative inline-block"
        initial={{ clipPath: 'inset(-10% 100% -10% 0)', filter: 'blur(10px)' }}
        animate={{ clipPath: 'inset(-10% 0% -10% 0)', filter: 'blur(0px)' }}
        transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
      >
        Glowed
      </motion.span>{' '}
      <motion.span
        className="glow-shimmer glow-from-end relative inline-block [animation-delay:1.85s]"
        initial={{ y: '0.6em', opacity: 0, scale: 0.7 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 11, delay: 0.95 }}
      >
        Up
      </motion.span>

      <Sparkle className="-right-5 -top-2 h-5 w-5 sm:h-6 sm:w-6" delay={1.3} />
      <Sparkle className="-right-1 top-1/2 h-2.5 w-2.5" delay={1.45} />
      <Sparkle className="right-[2.2em] -top-3 h-3 w-3 max-sm:hidden" delay={1.6} />
    </span>
  </h1>
);

export default GlowHeadline
