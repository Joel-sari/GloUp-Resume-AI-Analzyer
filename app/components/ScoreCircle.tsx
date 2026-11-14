import { useId } from "react";

const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const strokeDashoffset = circumference * (1 - progress);
  // Several circles can be on one page; each needs its own gradient id.
  const gradientId = `score-grad-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div className="relative h-[100px] w-[100px]">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        className="-rotate-90 transform"
      >
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="55%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(236,72,153,0.45))" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none text-ink">{score}</span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
          / 100
        </span>
      </div>
    </div>
  );
};

export default ScoreCircle;
