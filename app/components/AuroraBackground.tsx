import { motion, useReducedMotion } from "motion/react";

/**
 * Slow-drifting aurora blobs and twinkling stars, shared by every page.
 * Render it as the first child of a `relative overflow-hidden` container
 * and put the page content in a `relative` sibling after it.
 */

/* Fixed positions so server and client render the same stars. */
const STARS = [
  { x: 6, y: 12, s: 2, d: 0 },
  { x: 14, y: 68, s: 1.5, d: 1.1 },
  { x: 22, y: 30, s: 1, d: 2.3 },
  { x: 31, y: 84, s: 2, d: 0.6 },
  { x: 43, y: 8, s: 1.5, d: 1.8 },
  { x: 52, y: 92, s: 1, d: 2.9 },
  { x: 61, y: 18, s: 2, d: 0.3 },
  { x: 69, y: 56, s: 1, d: 1.5 },
  { x: 77, y: 6, s: 1.5, d: 2.6 },
  { x: 84, y: 74, s: 2, d: 0.9 },
  { x: 91, y: 38, s: 1, d: 2.1 },
  { x: 96, y: 88, s: 1.5, d: 1.3 },
];

export default function AuroraBackground() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-violet/30 blur-[140px]"
        animate={reduced ? undefined : { x: [0, 80, 0], y: [0, 50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 top-1/4 h-[520px] w-[520px] rounded-full bg-pink/25 blur-[140px]"
        animate={reduced ? undefined : { x: [0, -70, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 left-1/3 h-[520px] w-[520px] rounded-full bg-orange/20 blur-[150px]"
        animate={reduced ? undefined : { x: [0, 60, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {STARS.map((star, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-ink"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.s,
            height: star.s,
          }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [1, 1.6, 1] }}
          transition={{
            duration: 3.2,
            delay: star.d,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
