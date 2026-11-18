import { useState } from 'react'

// Highlight [placeholders] the AI left for the user to fill in, e.g. "[X]%".
export const WithPlaceholders = ({ text }: { text: string }) => (
  <>
    {text.split(/(\[[^\]]+\])/g).map((part, i) =>
      /^\[[^\]]+\]$/.test(part) ? (
        <mark key={i} className="rounded bg-accent/20 px-1 font-semibold text-accent" title="Fill this in with your real number">
          {part}
        </mark>
      ) : (
        part
      ),
    )}
  </>
)

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (e.g. insecure context); nothing useful to do
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      // don't let the press reach a parent that flips or drags (flash cards)
      onPointerDown={(e) => e.stopPropagation()}
      className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:border-accent/50 hover:text-ink"
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

/** Before / After cards for a rewrite tip (or just the quoted line). */
const Rewrite = ({ quote, suggestion }: { quote?: string; suggestion?: string }) => {
  if (!quote && !suggestion) return null;

  // Only a quote: show which line the tip is about.
  if (!suggestion) {
    return (
      <blockquote className="rounded-xl border-l-2 border-border bg-base/50 px-4 py-3 text-sm italic text-muted">
        “{quote}”
      </blockquote>
    )
  }

  return (
    <div className="grid gap-2">
      {quote && (
        <div className="rounded-xl border border-badge-red-text/20 bg-badge-red/40 px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-badge-red-text">Before</p>
          <p className="text-sm leading-6 text-muted">{quote}</p>
        </div>
      )}
      <div className="rounded-xl border border-badge-green-text/25 bg-badge-green/40 px-4 py-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-badge-green-text">After</p>
          <CopyButton text={suggestion} />
        </div>
        <p className="text-sm leading-6 text-ink"><WithPlaceholders text={suggestion} /></p>
      </div>
    </div>
  )
}

export default Rewrite
