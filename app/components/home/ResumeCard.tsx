import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import ScoreCircle from "~/components/score/ScoreCircle";
import CompanyLogo from "~/components/ui/CompanyLogo";
import { usePuterStore } from "~/lib/puter";
import { verdictFor } from "~/lib/score";

// "3 days ago" style label for when the resume was analyzed.
const timeAgo = (ms: number) => {
  const minutes = Math.round((Date.now() - ms) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(ms).toLocaleDateString();
};

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4h6v3" />
  </svg>
);

interface ResumeCardProps {
  resume: Resume;
  /** Resolves when the analysis (record + files) is gone; rejects on failure. */
  onDelete: (resume: Resume) => Promise<void>;
}

const ResumeCard = ({ resume, onDelete }: ResumeCardProps) => {
  const { id, companyName, jobTitle, feedback, imagePath, createdAt } = resume;
  const { fs } = usePuterStore();
  const [imageUrl, setImageUrl] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  // imagePath is a Puter storage path, not a public URL: read the file and
  // turn it into a blob URL (freed again when the card unmounts).
  useEffect(() => {
    let url = "";
    let cancelled = false;
    fs.read(imagePath)
      .then((blob) => {
        if (!blob || cancelled) return;
        url = URL.createObjectURL(blob);
        setImageUrl(url);
      })
      .catch((err) => console.error("Could not load preview", err));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [imagePath]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(false);
    try {
      await onDelete(resume);
      // the parent removes this card; nothing else to do
    } catch {
      setDeleting(false);
      setDeleteError(true);
    }
  };

  const title = companyName?.trim() || jobTitle?.trim() || "General review";
  const subtitle = companyName?.trim() ? jobTitle?.trim() : jobTitle?.trim() ? "" : "No job posting";
  const verdict = feedback ? verdictFor(feedback.overallScore) : null;
  const fixes = feedback
    ? [feedback.ATS, feedback.toneAndStyle, feedback.content, feedback.structure, feedback.skills]
        .flatMap((c) => c.tips)
        .filter((t) => t.type === "improve").length
    : 0;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="spotlight-card group flex h-full flex-col overflow-hidden rounded-[26px] border border-border bg-surface/80 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_30px_80px_-30px_rgba(168,85,247,0.55)]"
    >
      <Link
        to={`/resume/${id}`}
        className="flex flex-1 flex-col rounded-[26px] outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
      >
        {/* resume preview */}
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-base-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${title} resume preview`}
              className="h-full w-full object-cover object-top transition-transform duration-700 animate-in fade-in group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-surface-2/60" />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent" />

          {verdict && (
            <span className={`absolute left-3 top-3 rounded-full border border-border bg-base/85 px-2.5 py-1 text-xs font-semibold ${verdict.text} backdrop-blur`}>
              {verdict.label}
            </span>
          )}
          <span className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink opacity-0 transition-all duration-300 group-hover:opacity-100">
            View feedback
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-1">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>

        {/* who + score */}
        <div className="flex items-center gap-3 px-5 pt-4">
          <CompanyLogo name={companyName || jobTitle} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-ink">{title}</p>
            {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
          </div>
          {feedback ? (
            <ScoreCircle score={feedback.overallScore} size={60} />
          ) : (
            <span className="rounded-full bg-badge-yellow px-3 py-1 text-xs font-semibold text-badge-yellow-text">
              Incomplete
            </span>
          )}
        </div>

        {/* meta */}
        <div className="mt-auto flex items-center justify-between gap-3 px-5 pb-4 pt-3 text-xs text-muted">
          <span>{createdAt ? `Analyzed ${timeAgo(createdAt)}` : "Analyzed earlier"}</span>
          {feedback ? (
            <span className="rounded-full bg-surface-2 px-2.5 py-1 font-semibold">
              {fixes} {fixes === 1 ? "fix" : "fixes"}
            </span>
          ) : (
            <span>Analysis didn't finish</span>
          )}
        </div>
      </Link>

      {/* delete: a sibling of the link (a button can't live inside an <a>) */}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${title} analysis`}
        title="Delete"
        className="absolute right-3 top-3 z-10 rounded-full border border-border bg-base/75 p-2 text-muted backdrop-blur transition-all hover:border-badge-red-text/50 hover:text-badge-red-text focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <TrashIcon />
      </button>

      {/* confirm overlay */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            role="alertdialog"
            aria-label={`Delete ${title} analysis?`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onKeyDown={(e) => e.key === "Escape" && !deleting && setConfirming(false)}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-base/85 p-6 text-center backdrop-blur-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-badge-red text-badge-red-text">
              <TrashIcon />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold text-ink">Delete this analysis?</p>
              <p className="max-w-xs text-sm text-muted">
                This removes the resume, its preview and all feedback for <span className="text-ink">{title}</span>. It can't be undone.
              </p>
              {deleteError && <p className="text-sm font-semibold text-badge-red-text">Couldn't delete it. Try again.</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                autoFocus
                disabled={deleting}
                onClick={() => setConfirming(false)}
                className="back-button rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-full bg-badge-red-text px-4 py-2 text-sm font-semibold text-base-2 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default ResumeCard;
