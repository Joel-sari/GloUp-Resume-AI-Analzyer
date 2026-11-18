import { cn } from "~/lib/utils";

export type Status = "good" | "warn" | "bad";

const STYLES: Record<Status, string> = {
  good: "bg-badge-green text-badge-green-text",
  warn: "bg-badge-yellow text-badge-yellow-text",
  bad: "bg-badge-red text-badge-red-text",
};

const LABELS: Record<Status, string> = { good: "Good", warn: "Needs attention", bad: "Problem" };

/** Small round check / ! / × icon used by tips, checks and requirements. */
const StatusIcon = ({ status, className }: { status: Status; className?: string }) => (
  <span
    role="img"
    aria-label={LABELS[status]}
    className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", STYLES[status], className)}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      {status === "good" && <path d="M5 12.5l4.5 4.5L19 7.5" />}
      {status === "warn" && (
        <>
          <path d="M12 6v7" />
          <path d="M12 17.5v.5" />
        </>
      )}
      {status === "bad" && (
        <>
          <path d="M7 7l10 10" />
          <path d="M17 7L7 17" />
        </>
      )}
    </svg>
  </span>
);

export default StatusIcon;
