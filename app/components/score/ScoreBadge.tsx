import { scoreTier } from "~/lib/score";

interface ScoreBadgeProps {
  score: number;
}

// Strong (> 69) / Good Start (> 49) / Needs Work. The cutoffs and colors live
// in lib/score.ts so every badge, bar and verdict on the site agrees.
const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const { label, bg, text } = scoreTier(score);

  return (
    <div className={`score-badge ${bg} ${text}`}>
      <p className="text-xs font-semibold whitespace-nowrap">{label}</p>
    </div>
  );
};

export default ScoreBadge;
