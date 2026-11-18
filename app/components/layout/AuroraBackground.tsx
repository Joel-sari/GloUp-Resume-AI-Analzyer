import { useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

/**
 * Slow-drifting aurora blobs, a faint dot grid, film grain, twinkling stars
 * and a soft glow that trails the cursor. Shared by every page.
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

// Static SVG noise, tiled. Adds texture so the gradients don't look flat/banded.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function AuroraBackground() {
  const reduced = useReducedMotion();

  // cursor glow (page coordinates, so it works on long scrolling pages)
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(520px circle at ${sx}px ${sy}px, rgba(168,85,247,0.13), transparent 60%)`;

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx.set(e.pageX);
      my.set(e.pageY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, mx, my]);

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

      {/* dot grid, fading out toward the bottom */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
        }}
      />

      {/* glow that trails the cursor */}
      {!reduced && <motion.div className="absolute inset-0" style={{ backgroundImage: glow }} />}

      {/* film grain */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />

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
