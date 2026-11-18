import { type PointerEvent } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { verdictFor } from '~/lib/score'

const Sparkle = ({ className, delay }: { className: string; delay: number }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={`pointer-events-none absolute z-20 text-ink drop-shadow-[0_0_8px_rgba(236,72,153,0.9)] ${className}`}
    initial={{ opacity: 0, scale: 0, rotate: -30 }}
    animate={{ opacity: [0, 1, 0.85], scale: [0, 1.25, 1], rotate: 0 }}
    transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    fill="currentColor"
  >
    <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
  </motion.svg>
);

/**
 * The resume preview. A gradient frame that tilts with the pointer, with a
 * glare that follows it. When it first appears, a light band sweeps across it
 * once and a few sparkles pop in (the glow up moment).
 */
export const ResumePreview = ({ imageUrl, resumeUrl, score }: { imageUrl: string; resumeUrl: string; score?: number }) => {
  const reduced = useReducedMotion();

  // pointer position over the card, 0..1 on each axis (0.5 = centre)
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 18 };
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), spring);
  const glareX = useTransform(px, [0, 1], ['0%', '100%']);
  const glareY = useTransform(py, [0, 1], ['0%', '100%']);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.16), transparent 45%)`;

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const verdict = score !== undefined ? verdictFor(score) : null;

  return (
    <motion.div
      className="relative mx-auto w-fit max-w-full [perspective:1200px]"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* soft halo behind the card */}
      <motion.div
        aria-hidden
        className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-violet via-pink to-orange blur-3xl"
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <Sparkle className="-left-3 top-10 h-6 w-6" delay={1.4} />
      <Sparkle className="-right-2 top-1/3 h-4 w-4" delay={1.6} />
      <Sparkle className="bottom-16 -left-2 h-3.5 w-3.5" delay={1.8} />

      <motion.div
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative rounded-[28px] bg-gradient-to-br from-violet/70 via-pink/50 to-orange/50 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.7)]"
      >
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-[27px] bg-surface/90 p-3 backdrop-blur-xl"
        >
          <img
            src={imageUrl}
            alt="Resume preview"
            className="max-h-[78vh] w-full rounded-[20px] object-contain lg:max-h-[calc(100vh-24rem)] lg:w-auto"
          />

          {/* light band that sweeps across once */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-150%' }}
            animate={{ x: '400%' }}
            transition={{ duration: 1.4, delay: 0.5, ease: 'easeInOut' }}
          />

          {/* glare that follows the pointer */}
          {!reduced && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundImage: glare }}
            />
          )}

          {/* hover hint */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-base/90 to-transparent pb-5 pt-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full border border-border bg-surface/90 px-4 py-2 text-sm font-semibold text-ink backdrop-blur">
              Open full PDF ↗
            </span>
          </span>
        </a>
      </motion.div>

      {/* floating score badge */}
      {verdict && score !== undefined && (
        <motion.div
          className="absolute right-2 -top-4 z-20 flex items-center gap-2 rounded-full border border-border bg-surface/95 py-1.5 pl-1.5 pr-4 shadow-[0_12px_40px_-12px_rgba(236,72,153,0.7)] backdrop-blur sm:-right-6"
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.4, delay: 1.2 },
            scale: { duration: 0.5, delay: 1.2, type: 'spring', bounce: 0.5 },
            y: { duration: 4, delay: 1.8, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full primary-gradient text-sm font-bold text-white">
            {score}
          </span>
          <span className={`text-sm font-semibold ${verdict.text}`}>{verdict.label}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

/** Placeholder card while the resume loads, with a scan line moving down it. */
export const PreviewSkeleton = () => (
  <div className="relative mx-auto w-full max-w-md rounded-[28px] bg-gradient-to-br from-violet/50 via-pink/30 to-orange/30 p-px">
    <div className="relative aspect-[8.5/11] overflow-hidden rounded-[27px] bg-surface/90 p-8 backdrop-blur-xl">
      <div className="flex flex-col gap-3">
        <div className="h-5 w-1/2 animate-pulse rounded-full bg-surface-2" />
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-surface-2" />
        {[0.9, 0.75, 0.85, 0.6, 0.8, 0.7, 0.9, 0.55, 0.8, 0.65].map((w, i) => (
          <div
            key={i}
            className={`h-2.5 animate-pulse rounded-full bg-surface-2 ${i % 4 === 0 ? 'mt-5' : ''}`}
            style={{ width: `${w * 100}%` }}
          />
        ))}
      </div>
      <motion.div
        aria-hidden
        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-pink/25 to-transparent"
        initial={{ top: '-25%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-violet via-pink to-orange shadow-[0_0_12px_2px_rgba(236,72,153,0.6)]" />
      </motion.div>
    </div>
  </div>
);

export default ResumePreview
