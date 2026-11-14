import { useState, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import AuroraBackground from "~/components/AuroraBackground";

export function meta() {
  return [
    { title: "GloUp | Upload" },
    {
      name: "description",
      content: "Upload your resume and the job you want for an ATS score and concrete fixes.",
    },
  ];
}

const STEPS = [
  { n: "01", title: "Paste the job", body: "Company, title and the posting." },
  { n: "02", title: "Drop your PDF", body: "One resume, up to 20 MB." },
  { n: "03", title: "Get your score", body: "ATS match plus line-by-line fixes." },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const Upload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  // Managing the file state
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");

    // if doesnt exist exit out of it
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name");
    const jobTitle = formData.get("job-title");
    const jobDescription = formData.get("job-description");

    console.log({ companyName, jobTitle, jobDescription });
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative overflow-hidden bg-[url('/images/bg-main-gloup.svg')] bg-cover">
        <AuroraBackground />

        <div className="relative">
          <Navbar />

          <section className="main-section">
            <div className="page-heading">
              <motion.span
                {...fadeUp(0)}
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                New analysis
              </motion.span>

              <motion.h1 {...fadeUp(0.1)}>
                Get feedback to land your{" "}
                <span className="text-gradient whitespace-nowrap">dream job</span>
              </motion.h1>

              <motion.h2 {...fadeUp(0.2)}>
                Drop your resume for an ATS score and improvement tips.
              </motion.h2>
            </div>

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  className="w-full max-w-2xl rounded-[28px] bg-gradient-to-br from-violet/60 via-pink/40 to-orange/40 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.6)]"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="flex flex-col items-center gap-6 rounded-[27px] bg-surface/90 p-8 text-center backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
                      <p className="text-lg font-medium text-ink">{statusText}</p>
                    </div>
                    <img
                      src="/images/resume-scan.gif"
                      alt="Scanning your resume"
                      className="w-full max-w-md rounded-2xl border border-border"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className="flex w-full max-w-2xl flex-col gap-6"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* how it works */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    {STEPS.map((step, i) => (
                      <motion.div
                        key={step.n}
                        {...fadeUp(0.35 + i * 0.08)}
                        className="flex items-start gap-3 rounded-2xl border border-border bg-surface/70 px-4 py-3 backdrop-blur"
                      >
                        <span className="text-sm font-bold text-gradient">{step.n}</span>
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold text-ink">{step.title}</span>
                          <span className="text-xs leading-5 text-muted">{step.body}</span>
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* the form card */}
                  <div className="rounded-[28px] bg-gradient-to-br from-violet/60 via-pink/40 to-orange/40 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.6)]">
                    <form
                      id="upload-form"
                      onSubmit={handleSubmit}
                      className="!gap-5 rounded-[27px] bg-surface/90 p-6 backdrop-blur-xl sm:p-8"
                    >
                      <div className="grid w-full gap-5 sm:grid-cols-2">
                        <div className="form-div">
                          <label htmlFor="company-name">Company name</label>
                          <input
                            id="company-name"
                            type="text"
                            name="company-name"
                            placeholder="e.g. Stripe"
                            autoComplete="organization"
                          />
                        </div>
                        <div className="form-div">
                          <label htmlFor="job-title">Job title</label>
                          <input
                            id="job-title"
                            type="text"
                            name="job-title"
                            placeholder="e.g. Frontend Engineer"
                            autoComplete="organization-title"
                          />
                        </div>
                      </div>

                      <div className="form-div">
                        <label htmlFor="job-description">Job description</label>
                        <textarea
                          id="job-description"
                          rows={6}
                          name="job-description"
                          placeholder="Paste the full posting — requirements, responsibilities, nice-to-haves. The more we see, the sharper the feedback."
                          className="resize-y"
                        />
                      </div>

                      <div className="form-div">
                        <label htmlFor="uploader">Resume</label>
                        <FileUploader file={file} onFileSelect={handleFileSelect} />
                      </div>

                      <motion.button
                        className="primary-button flex items-center justify-center gap-2 py-4 text-lg font-semibold hover:primary-gradient-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        type="submit"
                        disabled={!file}
                        whileHover={file ? { scale: 1.02 } : undefined}
                        whileTap={file ? { scale: 0.98 } : undefined}
                      >
                        Analyze resume
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
                        </svg>
                      </motion.button>
                      {!file && (
                        <p className="-mt-2 w-full text-center text-xs text-muted">
                          Add your resume to run the analysis.
                        </p>
                      )}
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </MotionConfig>
  );
};

export default Upload;
