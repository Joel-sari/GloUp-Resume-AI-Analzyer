import { useState } from 'react'
import { motion } from 'motion/react'
import ScoreBadge from '~/components/score/ScoreBadge'
import StatusIcon from '~/components/ui/StatusIcon'
import { IMPACT_STYLE, categoryAnchor, scoreTier, sortTips } from '~/lib/score'

interface ATSProps {
  score: number;
  suggestions: FeedbackTip[];
  keywords?: { matched: string[]; missing: string[] };
}

const INTRO = {
  strong: 'Applicant tracking systems should parse this cleanly and find what recruiters search for.',
  good: 'Mostly parseable, but a few gaps could cost you in keyword filters.',
  weak: "There's a real risk an ATS filters this out before a person ever reads it.",
} as const;

const Chip = ({ word, found, index }: { word: string; found: boolean; index: number }) => (
  <motion.li
    initial={{ opacity: 0, scale: 0.85 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3, delay: index * 0.03 }}
    className={
      found
        ? 'inline-flex items-center gap-1.5 rounded-full bg-badge-green px-3 py-1 text-sm font-medium text-badge-green-text'
        : 'inline-flex items-center gap-1.5 rounded-full border border-dashed border-badge-red-text/40 px-3 py-1 text-sm font-medium text-badge-red-text'
    }
  >
    <span aria-hidden>{found ? '✓' : '+'}</span>
    {word}
  </motion.li>
)

// Chips shown per list before "+N more"
const CHIP_LIMIT = 6;

const KeywordMatch = ({ matched, missing }: { matched: string[]; missing: string[] }) => {
  const [showAll, setShowAll] = useState(false);
  const total = matched.length + missing.length;
  const hidden = Math.max(0, missing.length - CHIP_LIMIT) + Math.max(0, matched.length - CHIP_LIMIT);
  const shownMissing = showAll ? missing : missing.slice(0, CHIP_LIMIT);
  const shownMatched = showAll ? matched : matched.slice(0, CHIP_LIMIT);
  const percent = Math.round((matched.length / total) * 100);
  const tier = scoreTier(percent);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-2/60 p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">Keyword match</p>
          <p className="text-sm text-muted">
            {matched.length} of {total} key terms from the posting appear in your resume.
          </p>
        </div>
        <p className={`text-3xl font-bold ${tier.text}`}>{percent}%</p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-base/70">
        <motion.div
          className={`h-full rounded-full ${tier.bar}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {missing.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Missing</p>
          <ul className="flex flex-wrap gap-2">
            {shownMissing.map((w, i) => <Chip key={w} word={w} found={false} index={i} />)}
          </ul>
        </div>
      )}
      {matched.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Already there</p>
          <ul className="flex flex-wrap gap-2">
            {shownMatched.map((w, i) => <Chip key={w} word={w} found index={i} />)}
          </ul>
        </div>
      )}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="w-fit text-sm font-semibold text-accent hover:underline"
        >
          {showAll ? 'Show fewer' : `Show ${hidden} more`}
        </button>
      )}

      {missing.length > 0 && (
        <p className="text-xs text-muted">
          Only add a missing term if it's true for you, and work it into a real bullet. A keyword
          list stuffed at the bottom reads as spam to recruiters.
        </p>
      )}
    </div>
  )
}

const ATS = ({ score, suggestions, keywords }: ATSProps) => {
  const tier = scoreTier(score);
  const hasKeywords = keywords && keywords.matched.length + keywords.missing.length > 0;

  return (
    <section id={categoryAnchor('ATS')} className="review-card">
      <div className="flex items-start gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tier.bg}`}>
          <span className={`text-xl font-bold ${tier.text}`}>{score}</span>
        </span>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-bold text-ink">ATS compatibility</h3>
            <ScoreBadge score={score} />
          </div>
          <p className="text-sm text-muted">{INTRO[tier.key]}</p>
        </div>
      </div>

      {hasKeywords && <KeywordMatch matched={keywords.matched} missing={keywords.missing} />}

      {suggestions.length > 0 && (
        <ul className="flex flex-col gap-3">
          {sortTips(suggestions).map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <StatusIcon status={s.type === 'good' ? 'good' : 'warn'} className="mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                  {s.tip}
                  {s.impact && s.type === 'improve' && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${IMPACT_STYLE[s.impact].className}`}>
                      {IMPACT_STYLE[s.impact].label}
                    </span>
                  )}
                </p>
                {s.explanation && <p className="text-sm leading-6 text-muted">{s.explanation}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ATS
