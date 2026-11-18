import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * Looping "before → after" resume animation for the landing page.
 * A dull, gray resume gets scanned by a light beam, lights up with
 * gradient highlights, and its score counts up from 42 to 94.
 */

type Phase = "dull" | "scan" | "glow";

const SCAN_SECONDS = 1.8;
const PHASE_MS: Record<Phase, number> = {
  dull: 2300,
  scan: SCAN_SECONDS * 1000,
  glow: 3800,
};
const NEXT_PHASE: Record<Phase, Phase> = {
  dull: "scan",
  scan: "glow",
  glow: "dull",
};
const BEFORE_SCORE = 42;
const AFTER_SCORE = 94;

type Row = { width: number; kind: "heading" | "line"; issue?: boolean };

const SECTIONS: Row[][] = [
  [
    { width: 36, kind: "heading" },
    { width: 94, kind: "line" },
    { width: 80, kind: "line", issue: true },
    { width: 88, kind: "line" },
  ],
  [
    { width: 30, kind: "heading" },
    { width: 90, kind: "line", issue: true },
    { width: 72, kind: "line" },
  ],
  [
    { width: 42, kind: "heading" },
    { width: 96, kind: "line" },
    { width: 84, kind: "line" },
    { width: 66, kind: "line", issue: true },
  ],
];

const HEADER_ROWS = 2;
const TOTAL_ROWS = HEADER_ROWS + SECTIONS.reduce((n, s) => n + s.length, 0);
/** Delay (s) so each row lights up as the scan beam passes it. */
const rowDelay = (index: number) => (index / TOTAL_ROWS) * SCAN_SECONDS;

const CAPTIONS: Record<Phase, string> = {
  dull: "Your resume today",
  scan: "GloUp is scanning…",
  glow: "Your resume, glowed up ✨",
};

/* Chips hang off the sheet's edge, overlapping it by a fixed 3rem. */
const CHIPS = [
  { text: "ATS match 94%", className: "right-[calc(100%-3rem)] top-24", delay: 0.15 },
  { text: "+12 keywords hit", className: "left-[calc(100%-3rem)] top-[44%]", delay: 0.4 },
  { text: "Tone: confident", className: "right-[calc(100%-3rem)] bottom-20", delay: 0.65 },
];

const SPARKLES = [
  { className: "-top-4 left-6", size: 18, delay: 0 },
  { className: "-right-5 top-10", size: 14, delay: 0.3 },
  { className: "-left-5 top-1/2", size: 12, delay: 0.6 },
  { className: "-bottom-3 right-10", size: 16, delay: 0.9 },
  { className: "-top-2 right-1/3", size: 10, delay: 1.2 },
];

const RED = "#fb7185";
const GREEN = "#4ade80";

function Bar({
  row,
  index,
  lit,
  staggered,
}: {
  row: Row;
  index: number;
  lit: boolean;
  staggered: boolean;
}) {
  const height = row.kind === "heading" ? "h-2.5" : "h-2";
  const litStyle =
    row.kind === "heading"
      ? "bg-gradient-to-r from-violet via-pink to-orange"
      : "bg-ink/80";
  return (
    <div
      className={`relative ${height} overflow-hidden rounded-full bg-[#34343c]`}
      style={{ width: `${row.width}%` }}
    >
      <motion.div
        className={`absolute inset-0 rounded-full ${litStyle}`}
        initial={false}
        animate={{ opacity: lit ? 1 : 0 }}
        transition={{ duration: 0.35, delay: staggered ? rowDelay(index) : 0 }}
      />
    </div>
  );
}

function Mark({
  index,
  lit,
  staggered,
}: {
  index: number;
  lit: boolean;
  staggered: boolean;
}) {
  const delay = staggered ? rowDelay(index) : 0;
  return (
    <span className="relative ml-auto h-4 w-4 shrink-0">
      <motion.span
        className="absolute inset-0 flex items-center justify-center rounded-full bg-badge-red text-[10px] font-bold leading-none text-badge-red-text"
        initial={false}
        animate={{ opacity: lit ? 0 : 1, scale: lit ? 0.4 : 1 }}
        transition={{ duration: 0.25, delay }}
      >
        ×
      </motion.span>
      <motion.span
        className="absolute inset-0 flex items-center justify-center rounded-full bg-badge-green text-[10px] font-bold leading-none text-badge-green-text"
        initial={false}
        animate={{ opacity: lit ? 1 : 0, scale: lit ? 1 : 0.4 }}
        transition={{ type: "spring", stiffness: 400, damping: 18, delay }}
      >
        ✓
      </motion.span>
    </span>
  );
}

function ScoreBadge({
  score,
  lit,
}: {
  score: MotionValue<number>;
  lit: boolean;
}) {
  const text = useTransform(score, (v) => Math.round(v).toString());
  const ring = useTransform(score, (v) => v / 100);
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
        <circle
          cx="28"
          cy="28"
          r="24"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="4"
        />
        <motion.circle
          cx="28"
          cy="28"
          r="24"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ pathLength: ring }}
          initial={false}
          animate={{ stroke: lit ? GREEN : RED }}
          transition={{ duration: 0.6 }}
        />
      </svg>
      <motion.span
        className="text-sm font-bold tabular-nums"
        initial={false}
        animate={{ color: lit ? GREEN : RED }}
        transition={{ duration: 0.6 }}
      >
        {text}
      </motion.span>
    </div>
  );
}

function Sparkle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z"
        fill="url(#sparkle-gradient)"
      />
      <defs>
        <linearGradient id="sparkle-gradient" x1="0" y1="0" x2="24" y2="24">
          <stop stopColor="#f5f5f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function GlowUpDemo() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("dull");
  const score = useMotionValue(BEFORE_SCORE);

  // Advance the loop. With reduced motion, sit on the finished state.
  useEffect(() => {
    if (reduced) {
      setPhase("glow");
      return;
    }
    const t = setTimeout(() => setPhase(NEXT_PHASE[phase]), PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  // Count the score up when the glow lands, reset when we go dull again.
  useEffect(() => {
    if (phase === "glow") {
      if (reduced) {
        score.set(AFTER_SCORE);
        return;
      }
      const controls = animate(score, AFTER_SCORE, {
        duration: 1.1,
        ease: "easeOut",
      });
      return () => controls.stop();
    }
    if (phase === "dull") score.set(BEFORE_SCORE);
  }, [phase, reduced, score]);

  const lit = phase !== "dull";
  const staggered = phase === "scan";
  const glowing = phase === "glow";

  let rowIndex = 0;

  return (
    <div className="relative mx-auto w-[300px] sm:w-[340px]">
      {/* ambient glow behind the sheet */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-[40px] bg-gradient-to-br from-violet/50 via-pink/35 to-orange/35 blur-3xl"
        initial={false}
        animate={{ opacity: glowing ? 1 : 0.15, scale: glowing ? 1 : 0.9 }}
        transition={{ duration: 0.9 }}
      />

      {/* the resume sheet */}
      <motion.div
        className="relative"
        initial={false}
        animate={{
          y: glowing ? -8 : 0,
          rotate: glowing ? 0 : -1.5,
          scale: glowing ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 110, damping: 16 }}
      >
        <div className="relative overflow-hidden rounded-3xl p-px">
          <div className="absolute inset-0 bg-border" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-violet via-pink to-orange"
            initial={false}
            animate={{ opacity: lit ? 1 : 0 }}
            transition={{ duration: 0.8, delay: staggered ? 0.3 : 0 }}
          />

          <motion.div
            className="relative overflow-hidden rounded-[23px] p-6"
            initial={false}
            animate={{
              backgroundColor: glowing ? "#15111c" : "#1e1e24",
              boxShadow: glowing
                ? "0 30px 80px -20px rgba(168,85,247,0.55)"
                : "0 20px 50px -30px rgba(0,0,0,0.8)",
            }}
            transition={{ duration: 0.8 }}
          >
            {/* header: avatar, name, title, score */}
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#34343c]">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-violet to-pink"
                  initial={false}
                  animate={{ opacity: lit ? 1 : 0 }}
                  transition={{ duration: 0.35, delay: staggered ? rowDelay(0) : 0 }}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2.5">
                <Bar
                  row={{ width: 70, kind: "heading" }}
                  index={rowIndex++}
                  lit={lit}
                  staggered={staggered}
                />
                <Bar
                  row={{ width: 45, kind: "line" }}
                  index={rowIndex++}
                  lit={lit}
                  staggered={staggered}
                />
              </div>
              <ScoreBadge score={score} lit={glowing} />
            </div>

            <div className="my-5 h-px w-full bg-white/5" />

            {/* body sections */}
            <div className="flex flex-col gap-5">
              {SECTIONS.map((rows, s) => (
                <div key={s} className="flex flex-col gap-2.5">
                  {rows.map((row, r) => {
                    const index = rowIndex++;
                    return (
                      <div key={r} className="flex items-center gap-2">
                        <Bar
                          row={row}
                          index={index}
                          lit={lit}
                          staggered={staggered}
                        />
                        {row.issue && (
                          <Mark index={index} lit={lit} staggered={staggered} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* scan beam */}
            <AnimatePresence>
              {phase === "scan" && (
                <motion.div
                  key="beam"
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 h-28 -translate-y-1/2"
                  initial={{ top: "-10%", opacity: 0 }}
                  animate={{ top: "110%", opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    top: { duration: SCAN_SECONDS, ease: "linear" },
                    opacity: { duration: 0.2 },
                  }}
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, rgba(236,72,153,0.22), transparent)",
                  }}
                >
                  <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-pink to-transparent shadow-[0_0_24px_6px_rgba(236,72,153,0.55)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* floating result chips */}
        <AnimatePresence>
          {glowing &&
            CHIPS.map((chip) => (
              <motion.div
                key={chip.text}
                className={`absolute ${chip.className} flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-xl backdrop-blur max-sm:hidden`}
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 20,
                  delay: chip.delay,
                }}
              >
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet to-pink" />
                {chip.text}
              </motion.div>
            ))}
        </AnimatePresence>

        {/* sparkles */}
        <AnimatePresence>
          {glowing &&
            SPARKLES.map((s, i) => (
              <motion.div
                key={i}
                aria-hidden
                className={`pointer-events-none absolute ${s.className}`}
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.1, 0],
                  rotate: [0, 90, 180],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.6,
                  delay: s.delay,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                }}
              >
                <Sparkle size={s.size} />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {/* caption */}
      <div className="mt-8 flex h-6 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            className={`text-sm font-medium ${glowing ? "text-gradient" : "text-muted"}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {CAPTIONS[phase]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
