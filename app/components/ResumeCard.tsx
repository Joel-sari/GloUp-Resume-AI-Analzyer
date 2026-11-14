import { Link } from "react-router";
import { motion } from "motion/react";
import ScoreCircle from "./ScoreCircle";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) => {
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
                {companyName}
              </h2>
              <h3 className="text-base text-muted break-words">{jobTitle}</h3>
            </div>
            <div className="flex-shrink-0">
              <ScoreCircle score={feedback.overallScore} />
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-base-2">
            <img
              src={imagePath}
              alt={`${companyName} resume preview`}
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
            />
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
