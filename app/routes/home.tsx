import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { MotionConfig, motion } from "motion/react";
import type { Route } from "./+types/home";
import { resumes } from "~/constants";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import AuroraBackground from "~/components/AuroraBackground";

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
  const { auth } = usePuterStore();
  const navigate = useNavigate();
  const username = auth.user?.username;

  useEffect(() => {
    // not authenticated → back to auth, remembering where to return to
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated, navigate]);

  const count = resumes.length;
  const scores = resumes.map((r) => r.feedback.overallScore);
  const average = count
    ? Math.round(scores.reduce((a, b) => a + b, 0) / count)
    : 0;
  const best = count ? Math.max(...scores) : 0;

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
                {username ? `Welcome back, ${username}` : "Your workspace"}
              </motion.span>

              <motion.h1 {...fadeUp(0.1)}>
                Track your applications &amp;{" "}
                <span className="text-gradient">resume ratings</span>
              </motion.h1>

              <motion.h2 {...fadeUp(0.2)}>
                Review your submissions and check AI-powered feedback.
              </motion.h2>

              {count > 0 && (
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

            {count > 0 ? (
              <div className="resumes-section">
                {resumes.map((resume, i) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.4 + i * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <ResumeCard resume={resume} />
                  </motion.div>
                ))}
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
        </div>
      </main>
    </MotionConfig>
  );
}
