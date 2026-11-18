export const resumes: Resume[] = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume_01.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "2",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume_02.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "3",
    companyName: "Apple",
    jobTitle: "iOS Developer",
    imagePath: "/images/resume_03.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 75,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
];

// Bump when the Feedback shape changes, so the UI can tell old records apart.
// v1: scores + tips. v2: headline, impact, quote/suggestion, keywords, requirements.
export const FEEDBACK_SCHEMA_VERSION = 2;

export const AIResponseFormat = `
interface Feedback {
  overallScore: number; // 0-100, your holistic judgment of the whole resume
  headline: string; // ONE sentence (max ~25 words) naming this resume's biggest strength and biggest gap, specific to this candidate
  ATS: Category; // parseability, keyword match, contact info
  toneAndStyle: Category;
  content: Category;
  structure: Category;
  skills: Category;
  keywords: {
    matched: string[]; // important keywords/skills from the job posting that DO appear in the resume
    missing: string[]; // important keywords/skills from the job posting that do NOT appear in the resume
  };
  requirements: {
    requirement: string; // one concrete requirement from the posting, e.g. "3+ years of React"
    status: "met" | "partial" | "missing";
    evidence: string; // one short sentence: where the resume shows it, or what is lacking
  }[];
}

interface Category {
  score: number; // 0-100
  tips: Tip[]; // 3-4 tips
}

interface Tip {
  type: "good" | "improve";
  tip: string; // short, specific title
  explanation: string; // 1-3 sentences explaining why and exactly what to change
  impact?: "high" | "medium" | "low"; // REQUIRED when type is "improve": how much fixing it would move the score
  quote?: string; // the exact text from the resume this tip is about, copied verbatim
  suggestion?: string; // when the tip is about specific wording: the rewritten version of quote
}`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) => {
  const hasJob = jobTitle.trim() || jobDescription.trim();

  const jobContext = hasJob
    ? `The candidate is applying for this role:
Job title: ${jobTitle.trim() || "not provided"}
Job description:
"""
${jobDescription.trim() || "not provided"}
"""
Score and advise relative to this role. Pull concrete keywords, skills, and requirements from the posting and check whether the resume reflects them.`
    : `No target job was provided. Evaluate the resume on its own merits as a general application in the candidate's apparent field.`;

  const jobRules = hasJob
    ? `Rules for keywords and requirements:
- keywords: up to 12 matched and up to 12 missing. Use the posting's own wording for each term (e.g. "TypeScript", "CI/CD", "stakeholder management"). Order each list by importance to the role. Only count a keyword as matched if it, or an obvious synonym, appears in the resume.
- requirements: the 4-8 most important requirements in the posting (must-haves first). "met" means the resume clearly shows it, "partial" means related experience but not a clear match, "missing" means no evidence.`
    : `No job was provided, so return "keywords": { "matched": [], "missing": [] } and "requirements": [].`;

  return `You are a senior technical recruiter and ATS (Applicant Tracking System) specialist. You have reviewed thousands of resumes and know exactly why candidates get filtered out or called back.

Analyze the attached resume and produce honest, specific, actionable feedback.

${jobContext}

Scoring guidelines (each score is 0-100):
- 90-100: exceptional, ready to send.
- 70-89: solid, a few targeted fixes.
- 50-69: needs real work; several issues would hurt the candidate.
- Below 50: significant problems with content, structure, or relevance.
Be strict. Most resumes land between 50 and 80. Do not inflate scores to be kind. A low score with clear fixes helps the candidate more than a flattering one.

What to evaluate:
- ATS: parseability (single column, standard section headings, no tables or graphics that break parsing), keyword match against the role, and clear contact info.
- Tone and style: professional, confident, concise. Flag passive voice, filler, clichés, and inconsistent tense.
- Content: strong action verbs, quantified impact (numbers, scale, outcomes), relevance to the role, no vague duties.
- Structure: logical section order, scannable layout, consistent formatting, appropriate length.
- Skills: the right skills are present, specific, and backed by evidence in the experience section.

Rules for tips:
- Give 3-4 tips per category. Mix "good" and "improve" as the resume deserves, but lead with the most impactful improvements.
- Each tip title should be short and specific. Each explanation must reference the actual content of this resume and say exactly how to change it. Avoid generic advice that could apply to any resume.
- If the resume is strong in a category, say so with a "good" tip and explain what makes it work.
- Every "improve" tip needs an impact: "high" if it could cost the candidate an interview, "medium" if it noticeably weakens the resume, "low" for polish.
- When a tip is about a specific line (a bullet, the summary, a heading), copy that line into quote exactly as written. If the fix is a rewrite, put the improved line in suggestion.
- Never invent facts in a suggestion. Do not add numbers, tools, employers or achievements the resume does not state. Where a number would make the line stronger but you don't know it, use a bracketed placeholder the candidate fills in, e.g. "Cut page load time by [X]% by ...".
- Leave quote and suggestion out for tips about the resume as a whole (layout, length, section order).

${jobRules}

Output format:
Respond with a single JSON object that matches this TypeScript interface exactly:
${AIResponseFormat}

Return only the raw JSON. No markdown, no code fences, no commentary before or after. All scores must be integers.`;
};
