import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { Route } from "./+types/home";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/layout/Navbar";
import Footer from "~/components/layout/Footer";
import ResumeCard from "~/components/home/ResumeCard";
import AuroraBackground from "~/components/layout/AuroraBackground";
import { useCardSpotlight } from "~/lib/useCardSpotlight";
import { useDisplayName } from "~/lib/profile";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GloUp" },
    {
      name: "description",
      content:
        "Upload your resume and get an instant, job-matched score with concrete edits.",
    },
  ];
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Home() {
  const { auth, isLoading, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const name = useDisplayName();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "score">("newest");

  // glow on whichever card the cursor is over
  useCardSpotlight();

  // Delete the record first (that's what makes it disappear for good), then
  // clean up the stored files. A failed file delete only leaves an orphaned
  // file in the user's Puter storage, so it isn't treated as an error.
  const deleteResume = async (resume: Resume) => {
    // Real failures throw. `undefined` means Puter isn't loaded; `false` is an explicit no.
    const result = await kv.delete(`resume:${resume.id}`);
    if (result === undefined || result === false) throw new Error("Could not delete the record");
    await Promise.allSettled([fs.delete(resume.resumePath), fs.delete(resume.imagePath)]);
    setResumes((list) => list.filter((r) => r.id !== resume.id));
  };

  useEffect(() => {
    // not authenticated → back to auth, remembering where to return to
    // (wait for Puter's startup check first, or every visit bounces once)
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/");
  }, [isLoading, auth.isAuthenticated, navigate]);

  // load every saved analysis from Puter's key-value store
  useEffect(() => {
    if (isLoading || !auth.isAuthenticated) return;
    let cancelled = false;

    const loadResumes = async () => {
      setLoadingResumes(true);
      const items = ((await kv.list("resume:*", true)) ?? []) as KVItem[];
      const parsed = items.flatMap((item) => {
        // only resume records (other keys, like the user's profile, live in the same store)
        if (!item.key?.startsWith("resume:")) return [];
        try {
          return [JSON.parse(item.value) as Resume];
        } catch {
          return []; // skip a corrupted record rather than breaking the page
        }
      });
      // newest first; records from before createdAt existed go last
      parsed.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      if (!cancelled) setResumes(parsed);
    };

    loadResumes()
      .catch((err) => console.error("Could not load resumes", err))
      .finally(() => !cancelled && setLoadingResumes(false));
    return () => {
      cancelled = true;
    };
  }, [isLoading, auth.isAuthenticated]);

  const count = resumes.length;
  // stats only count analyses that finished
  const scores = resumes.flatMap((r) => (r.feedback ? [r.feedback.overallScore] : []));
  const average = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const best = scores.length ? Math.max(...scores) : 0;

  const sorted =
    sortBy === "score"
      ? [...resumes].sort((a, b) => (b.feedback?.overallScore ?? -1) - (a.feedback?.overallScore ?? -1))
      : resumes; // already newest first

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative overflow-clip bg-[url('/images/bg-main-gloup.svg')] bg-cover">
        <AuroraBackground />

        <div className="relative flex min-h-screen flex-col">
          <Navbar />

          <section className="main-section">
            <div className="page-heading">
              <motion.span
                {...fadeUp(0)}
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                {name ? `Welcome back, ${name}` : "Your workspace"}
              </motion.span>

              <motion.h1 {...fadeUp(0.1)}>
                Track your applications &amp;{" "}
                <span className="text-gradient">resume ratings</span>
              </motion.h1>

              <motion.h2 {...fadeUp(0.2)}>
                Review your submissions and check AI-powered feedback.
              </motion.h2>

              {scores.length > 0 && (
                <motion.div
                  {...fadeUp(0.3)}
                  className="flex flex-wrap items-center justify-center gap-3"
                >
                  {[
                    { label: "Resumes", value: count },
                    { label: "Average score", value: average },
                    { label: "Best score", value: best },
                  ].map((stat) => (
                    <span
                      key={stat.label}
                      className="inline-flex items-baseline gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 backdrop-blur"
                    >
                      <span className="text-lg font-bold text-gradient">
                        {stat.value}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-wider text-muted">
                        {stat.label}
                      </span>
                    </span>
                  ))}
                </motion.div>
              )}
            </div>

            {loadingResumes ? (
              <div className="grid w-full max-w-[1400px] gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex animate-pulse flex-col overflow-hidden rounded-[26px] border border-border bg-surface/60">
                    <div className="aspect-[16/10] bg-surface-2/60" />
                    <div className="flex items-center gap-3 p-5">
                      <div className="h-11 w-11 rounded-full bg-surface-2" />
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="h-4 w-2/3 rounded-full bg-surface-2" />
                        <div className="h-3 w-1/2 rounded-full bg-surface-2" />
                      </div>
                      <div className="h-[60px] w-[60px] rounded-full bg-surface-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : count > 0 ? (
              <div className="flex w-full max-w-[1400px] flex-col gap-5">
                {/* toolbar */}
                <motion.div {...fadeUp(0.35)} className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted">
                    <span className="font-semibold text-ink">{count}</span> {count === 1 ? "analysis" : "analyses"}
                  </p>
                  <div role="radiogroup" aria-label="Sort resumes" className="flex gap-1 rounded-full border border-border bg-surface/70 p-1 backdrop-blur">
                    {([["newest", "Newest"], ["score", "Top score"]] as const).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={sortBy === key}
                        onClick={() => setSortBy(key)}
                        className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${sortBy === key ? "text-white" : "text-muted hover:text-ink"}`}
                      >
                        {sortBy === key && (
                          <motion.span layoutId="home-sort-pill" className="absolute inset-0 rounded-full primary-gradient" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                        )}
                        <span className="relative">{label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.ul layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {/* first tile: start a new analysis */}
                  <motion.li layout {...fadeUp(0.4)}>
                    <Link
                      to="/upload"
                      className="group flex h-full items-center gap-4 rounded-[26px] border border-dashed border-border bg-surface/30 p-5 transition-colors sm:min-h-72 sm:flex-col sm:justify-center sm:p-8 sm:text-center hover:border-accent/60 hover:bg-accent/5"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl primary-gradient sm:h-14 sm:w-14 text-white transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-6 w-6">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-lg font-semibold text-ink">New analysis</span>
                        <span className="text-sm text-muted">Score a resume against another job.</span>
                      </span>
                    </Link>
                  </motion.li>

                  <AnimatePresence mode="popLayout">
                    {sorted.map((resume, i) => (
                      <motion.li
                        key={resume.id}
                        layout
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.45 + i * 0.08, ease: [0.22, 1, 0.36, 1] } }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                      >
                        <ResumeCard resume={resume} onDelete={deleteResume} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </div>
            ) : (
              <motion.div
                {...fadeUp(0.4)}
                className="w-full max-w-xl rounded-[28px] bg-gradient-to-br from-violet/60 via-pink/40 to-orange/40 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.6)]"
              >
                <div className="flex flex-col items-center gap-5 rounded-[27px] bg-surface/90 px-8 py-12 text-center backdrop-blur-xl">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
                    </svg>
                  </span>
                  <h3 className="text-2xl font-semibold text-ink">
                    No resumes yet
                  </h3>
                  <p className="max-w-sm text-muted">
                    Upload your first resume and paste the job you want. GloUp
                    will score it and show you exactly what to fix.
                  </p>
                  <Link
                    to="/upload"
                    className="primary-button w-fit px-6 py-3 font-semibold hover:primary-gradient-hover"
                  >
                    Upload your first resume
                  </Link>
                </div>
              </motion.div>
            )}
          </section>
          <Footer />
        </div>
      </main>
    </MotionConfig>
  );
}
