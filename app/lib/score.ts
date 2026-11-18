// One place for score cutoffs, labels and colors, so every badge, bar and
// verdict on the site agrees. Cutoffs match the bands in prepareInstructions.

export interface ScoreTier {
  key: "strong" | "good" | "weak";
  label: string;
  text: string; // text color class
  bg: string; // tinted background class
  bar: string; // solid fill for progress bars
}

export const scoreTier = (score: number): ScoreTier => {
  if (score > 69)
    return { key: "strong", label: "Strong", text: "text-badge-green-text", bg: "bg-badge-green", bar: "bg-badge-green-text" };
  if (score > 49)
    return { key: "good", label: "Good Start", text: "text-badge-yellow-text", bg: "bg-badge-yellow", bar: "bg-badge-yellow-text" };
  return { key: "weak", label: "Needs Work", text: "text-badge-red-text", bg: "bg-badge-red", bar: "bg-badge-red-text" };
};

// The overall verdict splits the top band in two (90+ is "ready to send").
export const verdictFor = (score: number) => {
  const tier = scoreTier(score);
  if (score >= 90) return { ...tier, label: "Ready to send", blurb: "This one is ready to go out. Polish the last details and hit apply." };
  if (score >= 70) return { ...tier, label: "Solid", blurb: "A strong base. A few targeted fixes will push it over the line." };
  if (score >= 50) return { ...tier, label: "Needs work", blurb: "Some real issues could get this filtered out. The fixes below show you where to start." };
  return { ...tier, label: "Major fixes", blurb: "This needs a rework before you send it. Start with the top fixes below." };
};

export type CategoryKey = "ATS" | "toneAndStyle" | "content" | "structure" | "skills";

// Categories shown in Details (ATS has its own card).
export const DETAIL_CATEGORIES: { key: Exclude<CategoryKey, "ATS">; label: string }[] = [
  { key: "toneAndStyle", label: "Tone & Style" },
  { key: "content", label: "Content" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills" },
];

export const ALL_CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "ATS", label: "ATS" },
  ...DETAIL_CATEGORIES,
];

// Anchor id for a category's section, used by the summary rows and top fixes.
export const categoryAnchor = (key: CategoryKey) => `feedback-${key}`;

const IMPACT_RANK: Record<TipImpact, number> = { high: 0, medium: 1, low: 2 };
export const impactRank = (impact?: TipImpact) => (impact ? IMPACT_RANK[impact] : 1);

export const IMPACT_STYLE: Record<TipImpact, { label: string; className: string }> = {
  high: { label: "High impact", className: "bg-badge-red text-badge-red-text" },
  medium: { label: "Medium impact", className: "bg-badge-yellow text-badge-yellow-text" },
  low: { label: "Low impact", className: "bg-surface-2 text-muted" },
};

// "improve" first (most impactful first), then "good".
export const sortTips = (tips: FeedbackTip[]) =>
  [...tips].sort((a, b) => {
    if (a.type !== b.type) return a.type === "improve" ? -1 : 1;
    return impactRank(a.impact) - impactRank(b.impact);
  });

export interface RankedFix extends FeedbackTip {
  category: CategoryKey;
  categoryLabel: string;
}

// The n most important fixes across every category: highest impact first,
// ties go to the weaker category.
export const topFixes = (feedback: Feedback, n = 3): RankedFix[] =>
  ALL_CATEGORIES.flatMap(({ key, label }) =>
    feedback[key].tips
      .filter((t) => t.type === "improve")
      .map((t) => ({ ...t, category: key, categoryLabel: label, _score: feedback[key].score })),
  )
    .sort((a, b) => impactRank(a.impact) - impactRank(b.impact) || a._score - b._score)
    .slice(0, n)
    .map(({ _score, ...fix }) => fix);
