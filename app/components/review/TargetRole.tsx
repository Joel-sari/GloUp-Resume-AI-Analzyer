import { useRef } from 'react'
import CompanyLogo from '~/components/ui/CompanyLogo'

interface TargetRoleProps {
  jobTitle?: string;
  companyName?: string;
  jobDescription?: string;
}

/**
 * The role this resume was scored against, as a chip under the headline.
 * When there's a posting, the chip opens it in a modal (native <dialog>:
 * Esc to close, focus trapping and a backdrop for free).
 */
const TargetRole = ({ jobTitle, companyName, jobDescription }: TargetRoleProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const title = jobTitle?.trim();
  const company = companyName?.trim();
  const posting = jobDescription?.trim();
  const label = title && company ? `${title} at ${company}` : title || company;

  const chip = (
    <>
      <CompanyLogo name={company || title} size={36} />
      <span className="flex min-w-0 flex-col text-left leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          {label ? 'Target role' : 'General review'}
        </span>
        <span className="truncate text-sm font-semibold text-ink">
          {label ?? 'No job posting, scored on its own merits'}
        </span>
      </span>
    </>
  );

  const chipClass =
    'inline-flex max-w-full items-center gap-3 rounded-full border border-border bg-surface/70 py-1.5 pl-1.5 pr-4 backdrop-blur';

  if (!posting) return <div className={chipClass}>{chip}</div>;

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={`${chipClass} group transition-colors hover:border-accent/50 hover:bg-surface-2/80`}
      >
        {chip}
        <span className="ml-1 flex shrink-0 items-center gap-1 border-l border-border pl-2 sm:pl-3 text-xs font-semibold text-accent">
          <span className="max-sm:sr-only">View posting</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </button>

      <dialog
        ref={ref}
        // the dialog element itself is only "hit" when clicking the backdrop
        onClick={(e) => e.target === ref.current && ref.current.close()}
        className="m-auto w-[min(42rem,calc(100vw-2rem))] rounded-[28px] border border-border bg-surface p-0 text-ink shadow-[0_40px_120px_-30px_rgba(168,85,247,0.6)] backdrop:bg-base/70 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95 open:duration-200"
      >
        <div className="flex max-h-[80vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">The posting</p>
              {label && <p className="text-lg font-semibold text-ink">{label}</p>}
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="rounded-full border border-border p-2 text-muted transition-colors hover:border-accent/50 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <p className="overflow-y-auto whitespace-pre-line px-6 py-5 text-sm leading-7 text-muted">{posting}</p>
        </div>
      </dialog>
    </>
  );
};

export default TargetRole
