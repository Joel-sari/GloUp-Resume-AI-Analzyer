import { useState } from 'react'
import StatusIcon, { type Status } from '~/components/ui/StatusIcon'
import { describeChecks, type CheckStatus } from '~/lib/resumeChecks'

const ICON: Record<CheckStatus, Status> = { pass: 'good', warn: 'warn', fail: 'bad' };

/**
 * Facts read from the PDF text at upload (no AI): length, contact info, numbers.
 * Problems are listed in full; passes collapse into small chips you can expand.
 */
const QuickChecks = ({ checks }: { checks: ResumeChecks }) => {
  const results = describeChecks(checks);
  const issues = results.filter((r) => r.status !== 'pass')
    .sort((a, b) => (a.status === 'fail' ? -1 : 0) - (b.status === 'fail' ? -1 : 0));
  const passes = results.filter((r) => r.status === 'pass');
  const [showPasses, setShowPasses] = useState(false);

  return (
    <section className="review-card !gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-bold text-ink">Quick checks</h3>
          <p className="text-sm text-muted">Read straight from your PDF's text, the way an ATS sees it.</p>
        </div>
        <p className="shrink-0 text-sm text-muted">
          <span className="text-lg font-bold text-ink">{passes.length}</span>/{results.length} passed
        </p>
      </div>

      {issues.length > 0 && (
        <ul className="flex flex-col gap-2">
          {issues.map((r) => (
            <li key={r.label} className="flex items-start gap-3 rounded-2xl border border-border bg-surface-2/50 px-4 py-3">
              <StatusIcon status={ICON[r.status]} className="mt-0.5" />
              <p className="text-sm leading-6 text-muted">
                <span className="font-semibold text-ink">{r.label}.</span> {r.detail}
              </p>
            </li>
          ))}
        </ul>
      )}

      {passes.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowPasses((v) => !v)}
            aria-expanded={showPasses}
            className="flex flex-wrap items-center gap-2 text-left"
          >
            {passes.map((r) => (
              <span key={r.label} className="inline-flex items-center gap-1.5 rounded-full bg-badge-green px-3 py-1 text-xs font-semibold text-badge-green-text">
                ✓ {r.label}
              </span>
            ))}
            <span className="text-xs font-semibold text-accent">{showPasses ? 'Hide details' : 'Details'}</span>
          </button>
          {showPasses && (
            <ul className="grid gap-1 pl-1 text-sm text-muted animate-in fade-in slide-in-from-top-1 duration-300">
              {passes.map((r) => (
                <li key={r.label}><span className="font-medium text-ink">{r.label}:</span> {r.detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default QuickChecks
