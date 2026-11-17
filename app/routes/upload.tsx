import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import AuroraBackground from "~/components/AuroraBackground";
import AnalysisProgress, { type AnalysisStep } from "~/components/AnalysisProgress";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdftoimg";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "~/constants";

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

// Stages of handleAnalyze, shown in the progress card. Each has the
// percentage the bar jumps to when that stage starts.
const ANALYSIS_STEPS: (AnalysisStep & { at: number })[] = [
  { key: "upload", label: "Uploading resume", at: 5 },
  { key: "convert", label: "Converting to image", at: 20 },
  { key: "preview", label: "Uploading preview", at: 35 },
  { key: "save", label: "Saving details", at: 45 },
  { key: "analyze", label: "Analyzing with AI", at: 50 },
  { key: "finish", label: "Finishing up", at: 95 },
];

// While waiting on the model, creep the bar from the analyze step toward this
// ceiling so the UI keeps moving. It jumps to 100 when the response lands.
const ANALYZE_CEILING = 90;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const Upload = () => {

  const { auth, isLoading, fs, ai, kv} = usePuterStore();
  const navigate = useNavigate();


  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const creepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Managing the file state
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const stopCreep = () => {
    if (creepTimer.current) {
      clearInterval(creepTimer.current);
      creepTimer.current = null;
    }
  };

  // clear the timer if the user navigates away mid-run
  useEffect(() => stopCreep, []);

  // Advance the progress card to a named stage.
  const goToStep = (key: string, text: string) => {
    const i = ANALYSIS_STEPS.findIndex((s) => s.key === key);
    setCurrentStep(i);
    setProgress(ANALYSIS_STEPS[i].at);
    setStatusText(text);
  };

  const fail = (message: string) => {
    stopCreep();
    setError(message);
  };

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string; jobTitle: string; jobDescription: string; file: File }) => {
    setIsProcessing(true);
    setError(null);

    try {
      goToStep("upload", "Uploading your resume...");
      // we are uploading the file to puter storage, fs => file storage
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) return fail("Failed to upload the resume.");

      goToStep("convert", "Converting PDF to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) return fail(imageFile.error ?? "Failed to convert the PDF.");

      goToStep("preview", "Uploading the preview...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) return fail("Failed to upload the preview image.");

      goToStep("save", "Saving details...");
      const uuid = generateUUID();
      const resumeData = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: null as Feedback | null,
      };
      // kv is puters key value storage
      const kvKey = `resume:${uuid}`;
      await kv.set(kvKey, JSON.stringify(resumeData));

      goToStep("analyze", "Analyzing your resume...");
      // Keep the bar moving while the model works.
      creepTimer.current = setInterval(() => {
        setProgress((p) => (p < ANALYZE_CEILING ? p + 1 : p));
      }, 500);

      const feedback = await ai.feedback(
        uploadedFile.path,
        // string of instructions to give to the AI
        prepareInstructions({ jobTitle, jobDescription }),
      );
      stopCreep();
      if (!feedback) return fail("The AI did not return a response.");

      goToStep("finish", "Reading the feedback...");

      // retrieving feedback from claude. normalize: true gives a string, but
      // fall back to the first text block in case a provider returns blocks.
      const content = feedback.message.content;
      const feedbackText =
        typeof content === "string"
          ? content
          : (content.find((b: { type?: string }) => b?.type === "text")?.text ?? "");

      // strip ```json fences if the model added them anyway
      const cleaned = feedbackText.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
      resumeData.feedback = JSON.parse(cleaned) as Feedback;

      await kv.set(kvKey, JSON.stringify(resumeData));

      setCurrentStep(ANALYSIS_STEPS.length);
      setProgress(100);
      setStatusText("Analysis complete!");

      console.log(resumeData);
      navigate(`/resume/${uuid}`);
    } catch (err) {
      console.error(err);
      fail(err instanceof Error ? err.message : "Something went wrong during analysis.");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");

    // if doesnt exist exit out of it
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    
    // if the pdf file is not uploaded then we can do the following:
    if(!file) return;

    handleAnalyze( {companyName, jobTitle, jobDescription, file} )



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
                  <AnalysisProgress
                    steps={ANALYSIS_STEPS}
                    currentStep={currentStep}
                    progress={progress}
                    statusText={statusText}
                    error={error}
                    onRetry={() => {
                      setIsProcessing(false);
                      setError(null);
                      setProgress(0);
                      setCurrentStep(0);
                    }}
                  />
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
