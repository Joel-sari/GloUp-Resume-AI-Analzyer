import { useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import Rewrite from '~/components/review/Rewrite'
import { IMPACT_STYLE, topFixes, type RankedFix } from '~/lib/score'

// How the stack looks: depth 0 is the card on top, 1-2 peek out behind it.
const STACK_DEPTH = 3;
const SWIPE_DISTANCE = 90;
const SWIPE_VELOCITY = 500;

// dir > 0 = going forward, dir < 0 = going back.
// Forward: the top card flies off to the left and a new card rises from the back.
// Back: the previous card flies in from the left and the bottom card sinks away.
const cardVariants = {
  enter: (dir: number) =>
    dir > 0
      ? { x: 0, y: STACK_DEPTH * 20, scale: 1 - STACK_DEPTH * 0.05, opacity: 0, rotate: 0 }
      : { x: -360, y: 0, scale: 1, opacity: 0, rotate: -10 },
  exit: (dir: number) =>
    dir > 0
      ? { x: -380, opacity: 0, rotate: -12, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] as const } }
      : { y: STACK_DEPTH * 20, scale: 1 - STACK_DEPTH * 0.05, opacity: 0 },
};

const atDepth = (depth: number) => ({
  x: 0,
  rotate: 0,
  y: depth * 20,
  scale: 1 - depth * 0.05,
  opacity: depth === 0 ? 1 : 1 - depth * 0.3,
});

type DeckItem = { kind: 'fix'; fix: RankedFix; n: number } | { kind: 'end' };

const Front = ({ fix, n, total }: { fix: RankedFix; n: number; total: number }) => (
  <div className="flex h-full flex-col justify-between gap-4 p-6 sm:p-7">
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full primary-gradient px-2.5 py-1 font-bold text-white">Fix {n} of {total}</span>
      <span className="rounded-full border border-border px-2.5 py-1 font-semibold text-muted">{fix.categoryLabel}</span>
      {fix.impact && (
        <span className={`rounded-full px-2.5 py-1 font-semibold ${IMPACT_STYLE[fix.impact].className}`}>
          {IMPACT_STYLE[fix.impact].label}
        </span>
      )}
    </div>

    <p className="text-2xl font-bold leading-snug text-ink sm:text-3xl">{fix.tip}</p>

    <div className="flex items-center justify-between gap-3 text-sm text-muted">
      <span className="inline-flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        Tap to see how
      </span>
      {fix.suggestion && <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">Rewrite inside ✎</span>}
    </div>
  </div>
);

const Back = ({ fix }: { fix: RankedFix }) => (
  <div className="flex h-full flex-col gap-3 overflow-y-auto p-6 sm:p-7">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">How to fix it</p>
    <p className="text-lg font-semibold text-ink">{fix.tip}</p>
    {fix.explanation && <p className="text-sm leading-6 text-muted">{fix.explanation}</p>}
    <Rewrite quote={fix.quote} suggestion={fix.suggestion} />
    <p className="mt-auto pt-2 text-xs text-muted">Tap to flip back</p>
  </div>
);

const EndCard = ({ total, onRestart }: { total: number; onRestart: () => void }) => (
  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
    <span className="text-5xl">🎉</span>
    <p className="text-2xl font-bold text-ink">That's all {total} {total === 1 ? 'fix' : 'fixes'}</p>
    <p className="max-w-sm text-sm text-muted">
      Make the edits, then upload the new version to see your score climb.
    </p>
    <div className="flex flex-wrap justify-center gap-3" onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" onClick={onRestart} className="back-button rounded-full px-4 py-2 text-sm font-semibold">
        Start over
      </button>
      <Link to="/upload" className="primary-button w-fit px-4 py-2 text-sm font-semibold hover:primary-gradient-hover">
        Upload new version
      </Link>
    </div>
  </div>
);

/** One card in the stack. Only the top card can be dragged or flipped. */
const DeckCard = ({
  item, depth, dir, total, flipped, onFlip, onSwipe, onRestart,
}: {
  item: DeckItem; depth: number; dir: number; total: number; flipped: boolean;
  onFlip: () => void; onSwipe: (d: number) => void; onRestart: () => void;
}) => {
  const isTop = depth === 0;
  const x = useMotionValue(0);
  // tilt while dragging, like a real card
  const dragRotate = useTransform(x, [-220, 220], [-12, 12]);

  // Releasing a swipe also counts as a tap; remember the drag so it doesn't flip.
  const dragged = useRef(false);
  const handleTap = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    onFlip();
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) onSwipe(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) onSwipe(-1);
  };

  const highImpact = item.kind === 'fix' && item.fix.impact === 'high';

  return (
    <motion.div
      custom={dir}
      variants={cardVariants}
      initial="enter"
      animate={atDepth(depth)}
      exit="exit"
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      style={{ x, rotate: isTop ? dragRotate : 0, zIndex: STACK_DEPTH - depth, transformOrigin: 'bottom center' }}
      drag={isTop && item.kind === 'fix' ? 'x' : false}
      dragSnapToOrigin
      dragElastic={0.8}
      onDragStart={() => { dragged.current = true; }}
      onDragEnd={handleDragEnd}
      onTap={isTop && item.kind === 'fix' ? handleTap : undefined}
      className={`absolute inset-0 [perspective:1400px] ${isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      aria-hidden={!isTop}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: isTop && flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        {/* front */}
        <div
          className={`backface-hidden absolute inset-0 rounded-[26px] p-px shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] ${
            highImpact ? 'bg-gradient-to-br from-pink via-orange/70 to-violet/60' : 'bg-gradient-to-br from-violet/80 via-pink/50 to-orange/40'
          }`}
        >
          <div className="h-full rounded-[25px] bg-surface">
            {/* cards waiting behind the top one are blank, so only their edges peek out */}
            {!isTop ? null : item.kind === 'fix' ? <Front fix={item.fix} n={item.n} total={total} /> : <EndCard total={total} onRestart={onRestart} />}
          </div>
        </div>
        {/* back */}
        {isTop && item.kind === 'fix' && (
          <div className="backface-hidden absolute inset-0 rounded-[26px] bg-gradient-to-br from-badge-green-text/50 via-violet/40 to-pink/40 p-px [transform:rotateY(180deg)]">
            <div className="h-full rounded-[25px] bg-surface">
              <Back fix={item.fix} />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/** Every fix as a flash card: flip for the how-to, swipe or click through. */
const FixDeck = ({ feedback }: { feedback: Feedback }) => {
  const fixes = topFixes(feedback, Infinity);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [flipped, setFlipped] = useState(false);

  const items: DeckItem[] = [...fixes.map((fix, i) => ({ kind: 'fix' as const, fix, n: i + 1 })), { kind: 'end' }];
  const visible = items.slice(index, index + STACK_DEPTH);
  const atEnd = index >= fixes.length;

  const go = (d: number) => {
    const next = Math.min(Math.max(index + d, 0), fixes.length);
    if (next === index) return;
    setDir(d);
    setFlipped(false);
    setIndex(next);
  };
  const jump = (i: number) => {
    setDir(i > index ? 1 : -1);
    setFlipped(false);
    setIndex(i);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if ((e.key === ' ' || e.key === 'Enter') && !atEnd && e.target === e.currentTarget) { e.preventDefault(); setFlipped((f) => !f); }
  };

  if (fixes.length === 0) {
    return (
      <section className="review-card items-center text-center">
        <span className="text-4xl">✨</span>
        <p className="text-xl font-bold text-ink">No fixes needed</p>
        <p className="text-sm text-muted">The AI didn't flag anything to improve. Check the breakdown for what's working.</p>
      </section>
    );
  }

  return (
    <section className="review-card">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-bold text-ink">
            Your fixes, <span className="text-gradient">one at a time</span>
          </h3>
          <p className="text-sm text-muted">Biggest impact first. Swipe or use the arrows; tap a card to flip it.</p>
        </div>
        <p className="shrink-0 text-sm text-muted">
          <span className="text-lg font-bold text-ink">{Math.min(index + 1, fixes.length)}</span>/{fixes.length}
        </p>
      </div>

      {/* segmented progress, click a segment to jump */}
      <div className="flex gap-1.5" role="tablist" aria-label="Fixes">
        {fixes.map((f, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Fix ${i + 1}: ${f.tip}`}
            onClick={() => jump(i)}
            className="group h-2 flex-1 rounded-full bg-base/70 py-0"
          >
            <span
              className={`block h-full rounded-full transition-all duration-500 ${
                i < index ? 'primary-gradient' : i === index ? 'bg-ink/70' : 'bg-transparent group-hover:bg-surface-2'
              }`}
            />
          </button>
        ))}
      </div>

      {/* the deck */}
      <div
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-roledescription="flash cards"
        aria-label={atEnd ? 'All fixes reviewed' : `Fix ${index + 1} of ${fixes.length}: ${fixes[index].tip}. ${flipped ? 'Showing how to fix it.' : 'Press space to flip.'}`}
        className="relative mb-6 h-[400px] rounded-[26px] outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:h-[360px]"
      >
        <AnimatePresence initial={false} custom={dir}>
          {visible
            .map((item, depth) => (
              <DeckCard
                key={item.kind === 'fix' ? `fix-${item.n}` : 'end'}
                item={item}
                depth={depth}
                dir={dir}
                total={fixes.length}
                flipped={flipped}
                onFlip={() => setFlipped((f) => !f)}
                onSwipe={go}
                onRestart={() => jump(0)}
              />
            ))
            .reverse() /* render back cards first so the top card paints last */}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="back-button rounded-full px-4 py-2 text-sm font-semibold disabled:pointer-events-none disabled:opacity-40"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          disabled={atEnd}
          className="rounded-full border border-accent/40 bg-accent/10 px-5 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 disabled:opacity-40"
        >
          {flipped ? 'Show title' : 'Flip card'}
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={atEnd}
          className="primary-button w-fit px-4 py-2 text-sm font-semibold hover:primary-gradient-hover disabled:pointer-events-none disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </section>
  );
};

export default FixDeck
