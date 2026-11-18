import { loadPdfJs } from "./pdftoimg";

// Deterministic checks read straight from the PDF text. These are facts, so we
// compute them instead of asking the AI to guess.

export interface PdfText {
  pageCount: number;
  lines: string[];
  text: string;
}

/** Extract the text of every page, one entry per visual line. Null on failure. */
export async function extractPdfText(file: File): Promise<PdfText | null> {
  try {
    const lib = await loadPdfJs();
    const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    const lines: string[] = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      let current = "";
      for (const item of content.items) {
        if (!("str" in item)) continue; // skip marked-content markers
        current += item.str;
        if (item.hasEOL) {
          if (current.trim()) lines.push(current.trim());
          current = "";
        }
      }
      if (current.trim()) lines.push(current.trim());
    }

    return { pageCount: pdf.numPages, lines, text: lines.join("\n") };
  } catch (err) {
    console.error("PDF text extraction failed", err);
    return null;
  }
}

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE = /\+?\d[\d\s().-]{7,}\d/;
const LINKEDIN = /linkedin/i;
const WEBSITE = /github|gitlab|behance|dribbble|kaggle|portfolio|https?:\/\/|www\.|\b[\w-]+\.(dev|io|me|app|tech|design)\b/i;
const BULLET = /^[•●▪◦‣∙·■□➢➤►–—*-]\s*/;
const HAS_NUMBER = /\d|%|\$/;

export function computeChecks({ pageCount, lines, text }: PdfText): ResumeChecks {
  // emails would otherwise match the website pattern (e.g. name@site.dev)
  const withoutEmails = text.replace(new RegExp(EMAIL, "g"), " ");
  const bullets = lines.filter((l) => BULLET.test(l));

  return {
    pageCount,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    hasEmail: EMAIL.test(text),
    hasPhone: PHONE.test(text),
    hasLinkedIn: LINKEDIN.test(text),
    hasWebsite: WEBSITE.test(withoutEmails),
    bulletCount: bullets.length,
    quantifiedBullets: bullets.filter((b) => HAS_NUMBER.test(b.replace(BULLET, ""))).length,
  };
}

export type CheckStatus = "pass" | "warn" | "fail";

export interface CheckResult {
  label: string;
  status: CheckStatus;
  detail: string;
}

/** Turn raw checks into labelled pass / warn / fail rows for the UI. */
export function describeChecks(c: ResumeChecks): CheckResult[] {
  // Almost no text means a scanned or image-only PDF: ATS sees a blank page,
  // and every other check would be meaningless.
  if (c.wordCount < 60) {
    return [
      {
        label: "Readable text",
        status: "fail",
        detail: `Only ${c.wordCount} words could be read. This looks like a scanned or image-based PDF, so most ATS will see it as nearly blank. Export it from Word or Google Docs instead.`,
      },
    ];
  }

  const results: CheckResult[] = [
    {
      label: "Length",
      status: c.pageCount === 1 ? "pass" : c.pageCount === 2 ? "warn" : "fail",
      detail:
        c.pageCount === 1
          ? "1 page. Ideal for most roles."
          : c.pageCount === 2
            ? "2 pages. Fine with 10+ years of experience, long for early career."
            : `${c.pageCount} pages. Recruiters skim; cut it to 1–2.`,
    },
    {
      label: "Word count",
      status: c.wordCount < 300 ? "warn" : c.wordCount > 900 ? "warn" : "pass",
      detail:
        c.wordCount < 300
          ? `${c.wordCount} words. On the thin side; add detail and results.`
          : c.wordCount > 900
            ? `${c.wordCount} words. Dense; tighten bullets so the best parts stand out.`
            : `${c.wordCount} words. A healthy amount.`,
    },
    {
      label: "Email",
      status: c.hasEmail ? "pass" : "fail",
      detail: c.hasEmail ? "Found." : "No email found. Recruiters need a way to reach you.",
    },
    {
      label: "Phone",
      status: c.hasPhone ? "pass" : "warn",
      detail: c.hasPhone ? "Found." : "No phone number found.",
    },
    {
      label: "LinkedIn",
      status: c.hasLinkedIn ? "pass" : "warn",
      detail: c.hasLinkedIn ? "Found." : "Add your LinkedIn URL; most recruiters check it.",
    },
    {
      label: "Portfolio / GitHub",
      status: c.hasWebsite ? "pass" : "warn",
      detail: c.hasWebsite ? "Found." : "Optional, but a link to your work helps a lot in technical roles.",
    },
  ];

  // Bullet detection is heuristic; only report it when we clearly found bullets.
  if (c.bulletCount >= 3) {
    const ratio = c.quantifiedBullets / c.bulletCount;
    results.push({
      label: "Quantified bullets",
      status: ratio >= 0.5 ? "pass" : ratio >= 0.25 ? "warn" : "fail",
      detail: `${c.quantifiedBullets} of ${c.bulletCount} bullets include a number. ${
        ratio >= 0.5 ? "Nice, results are concrete." : "Add numbers: scale, %, time saved, users, revenue."
      }`,
    });
  }

  return results;
}
