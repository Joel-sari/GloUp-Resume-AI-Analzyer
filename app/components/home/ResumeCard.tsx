import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import ScoreCircle from "~/components/score/ScoreCircle";
import { usePuterStore } from "~/lib/puter";

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

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath, createdAt },
}: {
  resume: Resume;
}) => {
  const { fs } = usePuterStore();
  const [imageUrl, setImageUrl] = useState("");

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

  return (
    <motion.div
      className="group relative"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Link
        to={`/resume/${id}`}
        className="relative block overflow-hidden rounded-[26px] p-px shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] transition-shadow duration-500 group-hover:shadow-[0_30px_80px_-30px_rgba(168,85,247,0.6)]"
      >
        {/* border: flat by default, gradient ring on hover */}
        <div className="absolute inset-0 bg-border" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet via-pink to-orange opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="resume-card">
          <div className="resume-card-header">
            <div className="flex min-w-0 flex-col gap-1.5">
              <h2 className="!text-2xl font-bold text-ink break-words">
                {companyName || jobTitle || "General review"}
              </h2>
              <h3 className="text-base text-muted break-words">
                {companyName ? jobTitle : null}
                {createdAt && (
                  <span className="block text-xs text-muted/80">
                    Analyzed {timeAgo(createdAt)}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex-shrink-0">
              {feedback ? (
                <ScoreCircle score={feedback.overallScore} />
              ) : (
                <span className="rounded-full bg-badge-yellow px-3 py-1 text-xs font-semibold text-badge-yellow-text">
                  Incomplete
                </span>
              )}
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-base-2">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${companyName || "Resume"} preview`}
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03] animate-in fade-in duration-500"
              />
            ) : (
              <div className="h-full w-full animate-pulse bg-surface-2/60" />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink opacity-0 transition-all duration-300 group-hover:opacity-100">
              View feedback
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ResumeCard;
