import { motion } from 'motion/react'
import ScoreBadge from '~/components/score/ScoreBadge';
import AnimatedNumber from '~/components/ui/AnimatedNumber';
import { ALL_CATEGORIES, categoryAnchor, scoreTier, type CategoryKey } from '~/lib/score';


// One compact row per category: name, animated bar, score and badge.
// The row links to that category's feedback (the page switches tabs for ATS).
const Category = ( { title, score, fixes, anchor, index }: { title: string, score: number, fixes: number, anchor: string, index: number } ) => {

  const tier = scoreTier(score);
  return (
    <li>
      <a
        href={`#${anchor}`}
        className="group -mx-3 grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-2/70 sm:grid-cols-[8rem_1fr_10rem] sm:gap-4"
      >
        <span className="flex flex-col">
          <span className="font-semibold text-ink">{title}</span>
          <span className="text-xs text-muted">{fixes === 0 ? 'No fixes' : `${fixes} ${fixes === 1 ? 'fix' : 'fixes'}`}</span>
        </span>

        <span className="h-2 w-full overflow-hidden rounded-full bg-base/70">
          <motion.span
            className={`block h-full rounded-full ${tier.bar}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${score}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>

        <span className="flex items-center justify-end gap-2">
          <span className={`w-8 text-right text-lg font-bold ${tier.text}`}>
            <AnimatedNumber value={score} />
          </span>
          <span className="max-sm:hidden"><ScoreBadge score={score}/></span>
          <span className="text-muted transition-transform group-hover:translate-x-0.5" aria-hidden>›</span>
        </span>
      </a>
    </li>
  )

}

const Summary = ( {feedback} : {feedback: Feedback} ) => {
  const fixesIn = (key: CategoryKey) => feedback[key].tips.filter((t) => t.type === 'improve').length;

  return (
    <section className="review-card !gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold text-ink">Score breakdown</h3>
        <p className="text-sm text-muted">Tap a category to open its feedback.</p>
      </div>
      <ul className="flex flex-col">
        {ALL_CATEGORIES.map(({ key, label }, i) => (
          <Category
            key={key}
            title={label}
            score={feedback[key].score}
            fixes={fixesIn(key)}
            anchor={categoryAnchor(key)}
            index={i}
          />
        ))}
      </ul>
    </section>
  );
}

export default Summary
