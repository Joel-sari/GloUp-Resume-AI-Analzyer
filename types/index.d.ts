interface Job {
  title: string;
  description: string;
  location: string;
  requiredSkills: string[];
}

type TipType = "good" | "improve";
type TipImpact = "high" | "medium" | "low";

interface FeedbackTip {
  type: TipType;
  tip: string; // short title
  explanation?: string; // older ATS tips have no explanation
  impact?: TipImpact; // "improve" tips only (schema v2+)
  quote?: string; // exact line from the resume the tip is about (v2+)
  suggestion?: string; // rewritten version of `quote`; [brackets] = user fills in (v2+)
}

interface FeedbackCategory {
  score: number;
  tips: FeedbackTip[];
}

interface JobRequirement {
  requirement: string;
  status: "met" | "partial" | "missing";
  evidence: string;
}

interface Feedback {
  overallScore: number;
  headline?: string; // one personal sentence about the resume (v2+)
  ATS: FeedbackCategory;
  toneAndStyle: FeedbackCategory;
  content: FeedbackCategory;
  structure: FeedbackCategory;
  skills: FeedbackCategory;
  keywords?: { matched: string[]; missing: string[] }; // empty when no job given (v2+)
  requirements?: JobRequirement[]; // empty when no job given (v2+)
}

// Facts read straight from the PDF text at upload time (no AI involved).
interface ResumeChecks {
  pageCount: number;
  wordCount: number;
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  hasWebsite: boolean; // GitHub, portfolio, personal site...
  bulletCount: number;
  quantifiedBullets: number; // bullets containing a number, % or $
}

interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback | null; // null if the analysis never finished
  checks?: ResumeChecks;
  createdAt?: number; // ms since epoch
  schemaVersion?: number; // missing = v1 (before keywords/rewrites)
}
