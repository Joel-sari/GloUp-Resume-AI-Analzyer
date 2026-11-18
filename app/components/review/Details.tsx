import { Accordion, AccordionContent, AccordionHeader, AccordionItem } from '~/components/ui/Accordion'
import ScoreBadge from '~/components/score/ScoreBadge'
import StatusIcon from '~/components/ui/StatusIcon'
import Rewrite from '~/components/review/Rewrite'
import { DETAIL_CATEGORIES, IMPACT_STYLE, categoryAnchor, scoreTier, sortTips } from '~/lib/score'

const TipCard = ({ tip }: { tip: FeedbackTip }) => {
  const good = tip.type === 'good';
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2/50 p-4">
      <div className="flex items-start gap-3">
        <StatusIcon status={good ? 'good' : 'warn'} className="mt-0.5" />
        <div className="flex flex-1 flex-col gap-1">
          <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
            {tip.tip}
            {!good && tip.impact && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${IMPACT_STYLE[tip.impact].className}`}>
                {IMPACT_STYLE[tip.impact].label}
              </span>
            )}
          </p>
          {tip.explanation && <p className="text-sm leading-6 text-muted">{tip.explanation}</p>}
        </div>
      </div>
      <Rewrite quote={tip.quote} suggestion={tip.suggestion} />
    </li>
  )
}

const Details = ({ feedback }: { feedback: Feedback }) => {
  // open the weakest category first: that's where the work is
  const weakest = [...DETAIL_CATEGORIES].sort((a, b) => feedback[a.key].score - feedback[b.key].score)[0];

  return (
    <section className="review-card">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold text-ink">Line-by-line feedback</h3>
        <p className="text-sm text-muted">
          Fixes come first, biggest impact on top. Bracketed values like{' '}
          <mark className="rounded bg-accent/20 px-1 font-semibold text-accent">[X]</mark> are yours to fill in with real numbers.
        </p>
      </div>

      <Accordion allowMultiple defaultOpen={categoryAnchor(weakest.key)} className="!space-y-0">
        {DETAIL_CATEGORIES.map(({ key, label }) => {
          const category = feedback[key];
          const fixes = category.tips.filter((t) => t.type === 'improve').length;
          const strengths = category.tips.length - fixes;
          const id = categoryAnchor(key);

          return (
            <AccordionItem key={key} id={id} className="last:border-b-0">
              <AccordionHeader itemId={id} className="!px-1 !py-4 hover:text-ink">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-lg font-semibold text-ink">{label}</p>
                  <ScoreBadge score={category.score} />
                  <span className={`text-sm font-semibold ${scoreTier(category.score).text}`}>{category.score}/100</span>
                  <span className="text-xs text-muted">
                    {fixes} {fixes === 1 ? 'fix' : 'fixes'} · {strengths} {strengths === 1 ? 'strength' : 'strengths'}
                  </span>
                </div>
              </AccordionHeader>
              <AccordionContent itemId={id} className="[&>div>div]:!px-1">
                {category.tips.length > 0 ? (
                  <ul className="flex flex-col gap-3 pb-3">
                    {sortTips(category.tips).map((tip, i) => <TipCard key={i} tip={tip} />)}
                  </ul>
                ) : (
                  <p className="pb-3 text-sm text-muted">No tips for this category.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </section>
  )
}

export default Details
