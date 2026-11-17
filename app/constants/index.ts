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

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
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

  return `You are a senior technical recruiter and ATS (Applicant Tracking System) specialist. You have reviewed thousands of resumes and know exactly why candidates get filtered out or called back.

Analyze the attached resume image and produce honest, specific, actionable feedback.

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
- Each tip title should be short and specific. Each explanation must reference the actual content of this resume (quote or paraphrase the line) and say exactly how to change it. Avoid generic advice that could apply to any resume.
- If the resume is strong in a category, say so with a "good" tip and explain what makes it work.

Output format:
Respond with a single JSON object that matches this TypeScript interface exactly:
${AIResponseFormat}

Return only the raw JSON. No markdown, no code fences, no commentary before or after. All scores must be integers.`;
};
