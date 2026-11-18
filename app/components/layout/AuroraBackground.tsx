import { useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

/**
 * Slow-drifting aurora blobs, a faint dot grid, film grain, twinkling stars,
 * drifting sparkles, drifting light specks, two breathing light beams and
 * a soft glow that trails the cursor. Shared by every page; sits on top of
 * the (now glow-only) bg-main-gloup.svg.
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

// Small seeded random generator: the same "random" layout on the server and
// in the browser, so hydration matches and the layout is stable across visits.
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (rand: () => number, min: number, max: number) => min + rand() * (max - min);

type Sparkle = { x: number; y: number; size: number; dur: number; delay: number; peak: number; rot: number; tint: string };
type Mote = { x: number; y: number; size: number; dur: number; delay: number; peak: number; drift: number };

// Mostly white, with a few in the brand's colors (soft violet, pink, orange).
const SPARKLE_TINTS = ["#ffffff", "#ffffff", "#ffffff", "#ddd6fe", "#fbcfe8", "#fed7aa"];

/* Little four-point sparkles (the logo's shape) that drift down, spin and
   twinkle. Clustered on the left side and top right, plus a few more along
   both side margins so they never cross cards or text. */
const SPARKLES: Sparkle[] = (() => {
  const rand = seeded(42);
  const make = (n: number, [x0, x1]: number[], [y0, y1]: number[]) =>
    Array.from({ length: n }, () => {
      const dur = between(rand, 6, 11);
      return {
        x: between(rand, x0, x1),
        y: between(rand, y0, y1),
        size: between(rand, 6, 14),
        dur,
        delay: -between(rand, 0, dur), // negative: already mid-flight on load
        peak: between(rand, 0.45, 0.9),
        rot: between(rand, 0, 90),
        tint: SPARKLE_TINTS[Math.floor(rand() * SPARKLE_TINTS.length)],
      };
    });
  // the rest stay in the side margins so they never cut across cards or text
  return [
    ...make(8, [2, 12], [44, 68]),
    ...make(7, [87, 98], [1, 18]),
    ...make(3, [0, 10], [12, 95]),
    ...make(3, [90, 100], [25, 95]),
  ];
})();

/* Tiny specks of light that drift upward and fade. */
const MOTES: Mote[] = (() => {
  const rand = seeded(7);
  return Array.from({ length: 26 }, () => {
    const dur = between(rand, 10, 18);
    return {
      x: between(rand, 0, 100),
      y: between(rand, 5, 100),
      size: between(rand, 1, 2.6),
      dur,
      delay: -between(rand, 0, dur),
      peak: between(rand, 0.3, 0.8),
      drift: between(rand, -24, 24),
    };
  });
})();

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

      {/* two soft diagonal light beams, slowly breathing */}
      <motion.div
        className="absolute left-[78%] top-[14%] h-[28%] w-[12%] origin-top rotate-[30deg] rounded-full bg-gradient-to-b from-white/60 via-white/20 to-transparent blur-3xl"
        initial={{ opacity: 0.08 }}
        animate={reduced ? undefined : { opacity: [0.05, 0.14, 0.05] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[15%] -top-[1%] h-[31%] w-[12%] origin-top rotate-[30deg] rounded-full bg-gradient-to-b from-white/60 via-white/20 to-transparent blur-3xl"
        initial={{ opacity: 0.08 }}
        animate={reduced ? undefined : { opacity: [0.04, 0.12, 0.04] }}
        transition={{ duration: 12, delay: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* drifting sparkles + specks of light (animated in app.css) */}
      {SPARKLES.map((s, i) => (
        <span
          key={`s${i}`}
          className="bg-sparkle"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
              "--peak": s.peak,
              "--rot": `${s.rot}deg`,
              "--tint": s.tint,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c.6 5.6 6.4 11.4 12 12-5.6.6-11.4 6.4-12 12-.6-5.6-6.4-11.4-12-12C5.6 11.4 11.4 5.6 12 0z" />
          </svg>
        </span>
      ))}
      {MOTES.map((m, i) => (
        <span
          key={`m${i}`}
          className="bg-mote"
          style={
            {
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: m.size,
              height: m.size,
              "--dur": `${m.dur}s`,
              "--delay": `${m.delay}s`,
              "--peak": m.peak,
              "--drift": `${m.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}

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
