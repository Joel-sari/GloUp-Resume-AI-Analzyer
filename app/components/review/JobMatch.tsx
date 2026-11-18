import { useState } from 'react'
import StatusIcon, { type Status } from '~/components/ui/StatusIcon'

const STATUS: Record<JobRequirement['status'], { icon: Status; label: string; text: string }> = {
  met: { icon: 'good', label: 'Met', text: 'text-badge-green-text' },
  partial: { icon: 'warn', label: 'Partial', text: 'text-badge-yellow-text' },
  missing: { icon: 'bad', label: 'Missing', text: 'text-badge-red-text' },
};

/** "Do I qualify?" — each key requirement in the posting, met / partial / missing. */
const JobMatch = ({ requirements, jobTitle }: { requirements: JobRequirement[]; jobTitle?: string }) => {
  const count = (s: JobRequirement['status']) => requirements.filter((r) => r.status === s).length;
  // missing first, so the gaps are what you see
  const order = { missing: 0, partial: 1, met: 2 };
  const sorted = [...requirements].sort((a, b) => order[a.status] - order[b.status]);
  // the gaps stay visible; met requirements collapse behind a toggle
  const [showMet, setShowMet] = useState(false);
  const metCount = count('met');
  const shown = showMet ? sorted : sorted.filter((r) => r.status !== 'met');

  return (
    <section className="review-card">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold text-ink">Role fit</h3>
        <p className="text-sm text-muted">
          The key requirements {jobTitle ? <>for <span className="text-ink">{jobTitle}</span></> : 'in the posting'}, checked against your resume.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['met', 'partial', 'missing'] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-3 py-1.5 text-sm">
            <span className={`font-bold ${STATUS[s].text}`}>{count(s)}</span>
            <span className="text-muted">{STATUS[s].label.toLowerCase()}</span>
          </span>
        ))}
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {shown.map((r, i) => (
          <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <StatusIcon status={STATUS[r.status].icon} className="mt-0.5" />
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                {r.requirement}
                <span className={`text-xs font-semibold ${STATUS[r.status].text}`}>{STATUS[r.status].label}</span>
              </p>
              {r.evidence && <p className="text-sm leading-6 text-muted">{r.evidence}</p>}
            </div>
          </li>
        ))}
      </ul>

      {metCount > 0 && (
        <button
          type="button"
          onClick={() => setShowMet((v) => !v)}
          aria-expanded={showMet}
          className="w-fit text-sm font-semibold text-accent hover:underline"
        >
          {showMet ? 'Hide met requirements' : `Show ${metCount} met ${metCount === 1 ? 'requirement' : 'requirements'}`}
        </button>
      )}
    </section>
  )
}

export default JobMatch
