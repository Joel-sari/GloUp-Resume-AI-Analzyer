// Turning the model's reply into a Feedback object the UI can trust.
// Models occasionally wrap JSON in prose or fences, skip a field, or return a
// score as a string; older saved records also lack the newer fields.

/** Pull the JSON object out of the model's text reply. Throws if there is none. */
export const parseFeedbackJSON = (text: string): unknown => {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    // fall back to the outermost {...} in case the model added commentary
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("The AI response did not contain JSON.");
    return JSON.parse(cleaned.slice(start, end + 1));
  }
};

const clampScore = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(Math.min(100, Math.max(0, n))) : 0;
};

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const strList = (value: unknown) =>
  Array.isArray(value) ? value.map(str).filter(Boolean) : [];

const IMPACTS = ["high", "medium", "low"];
const STATUSES = ["met", "partial", "missing"];

const normalizeTip = (raw: any): FeedbackTip | null => {
  const tip = str(raw?.tip);
  if (!tip) return null;
  const type: TipType = raw?.type === "good" ? "good" : "improve";
  return {
    type,
    tip,
    explanation: str(raw?.explanation) || undefined,
    impact: type === "improve" && IMPACTS.includes(raw?.impact) ? raw.impact : undefined,
    quote: str(raw?.quote) || undefined,
    suggestion: str(raw?.suggestion) || undefined,
  };
};

const normalizeCategory = (raw: any): FeedbackCategory => ({
  score: clampScore(raw?.score),
  tips: Array.isArray(raw?.tips)
    ? raw.tips.map(normalizeTip).filter((t: FeedbackTip | null): t is FeedbackTip => t !== null)
    : [],
});

/**
 * Validate and fill in a feedback object. Returns null when it isn't
 * recognizably feedback at all (no overall score).
 */
export const normalizeFeedback = (raw: any): Feedback | null => {
  if (!raw || typeof raw !== "object" || raw.overallScore === undefined) return null;

  return {
    overallScore: clampScore(raw.overallScore),
    headline: str(raw.headline) || undefined,
    ATS: normalizeCategory(raw.ATS),
    toneAndStyle: normalizeCategory(raw.toneAndStyle),
    content: normalizeCategory(raw.content),
    structure: normalizeCategory(raw.structure),
    skills: normalizeCategory(raw.skills),
    keywords: raw.keywords
      ? { matched: strList(raw.keywords.matched), missing: strList(raw.keywords.missing) }
      : undefined,
    requirements: Array.isArray(raw.requirements)
      ? raw.requirements
          .map((r: any) => ({
            requirement: str(r?.requirement),
            status: STATUSES.includes(r?.status) ? r.status : "partial",
            evidence: str(r?.evidence),
          }))
          .filter((r: JobRequirement) => r.requirement)
      : undefined,
  };
};
