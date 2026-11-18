import { motion } from "motion/react";

export interface AnalysisStep {
  key: string;
  label: string;
}

interface AnalysisProgressProps {
  steps: AnalysisStep[];
  currentStep: number; // index into steps; steps.length means all done
  progress: number; // 0-100
  statusText: string;
  error?: string | null;
  onRetry?: () => void;
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const AnalysisProgress = ({ steps, currentStep, progress, statusText, error, onRetry }: AnalysisProgressProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const isDone = clamped >= 100 && !error;

  return (
    <div className="flex w-full flex-col gap-6 rounded-[27px] bg-surface/90 p-6 backdrop-blur-xl sm:p-8">
      {/* header: status + percentage */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {error ? (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-badge-red text-badge-red-text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="h-3 w-3">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
          ) : isDone ? (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-badge-green text-badge-green-text">
              <CheckIcon />
            </span>
          ) : (
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          )}
          <p className={`truncate text-left text-base font-medium sm:text-lg ${error ? "text-badge-red-text" : "text-ink"}`}>
            {error ?? statusText}
          </p>
        </div>
        <motion.span
          key={clamped}
          initial={{ opacity: 0.6, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 text-2xl font-bold tabular-nums text-gradient"
        >
          {clamped}%
        </motion.span>
      </div>

      {/* progress bar */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-border"
      >
        <motion.div
          className={`h-full rounded-full ${error ? "bg-badge-red-text/70" : "bg-gradient-to-r from-violet via-pink to-orange"}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
        {!error && !isDone && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "calc(100% + 24rem)" }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
          />
        )}
      </div>

      {/* step list */}
      <ol className="grid gap-2 text-left sm:grid-cols-2">
        {steps.map((step, i) => {
          const state = error && i === currentStep
            ? "error"
            : i < currentStep || isDone
              ? "done"
              : i === currentStep
                ? "active"
                : "pending";

          return (
            <li
              key={step.key}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-2 transition-colors ${
                state === "active"
                  ? "border-accent/40 bg-accent/10"
                  : state === "error"
                    ? "border-badge-red-text/40 bg-badge-red"
                    : "border-border bg-surface/60"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  state === "done"
                    ? "bg-gradient-to-br from-violet to-pink text-white"
                    : state === "active"
                      ? "border-2 border-accent/30 border-t-accent animate-spin"
                      : state === "error"
                        ? "bg-badge-red-text/80 text-white"
                        : "border border-border text-muted"
                }`}
              >
                {state === "done" ? <CheckIcon /> : state === "active" || state === "error" ? "" : i + 1}
              </span>
              <span className={`text-sm ${state === "pending" ? "text-muted" : "text-ink"}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {!error && !isDone && (
        <p className="text-center text-xs text-muted">
          The AI step usually takes 10 to 20 seconds.
        </p>
      )}

      {error && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="primary-button py-3 font-semibold hover:primary-gradient-hover"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default AnalysisProgress;
