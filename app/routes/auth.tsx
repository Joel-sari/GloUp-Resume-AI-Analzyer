import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { MotionConfig, motion } from "motion/react";
import { usePuterStore } from "~/lib/puter";
import GlowUpDemo from "~/components/auth/GlowUpDemo";
import AuroraBackground from "~/components/layout/AuroraBackground";

export function meta() {
  return [
    { title: "GloUp | Give your resume a glow up" },
    {
      name: "description",
      content:
        "Sign in to GloUp and get an instant, job-matched resume score with concrete edits.",
    },
  ];
}

const HEADLINE = ["Give", "your", "resume", "the"];
const HEADLINE_GRADIENT = ["Glow", "Up"];
const HEADLINE_TAIL = ["it", "deserves."];

const PERKS = [
  {
    title: "Instant ATS score",
    body: "See how you rank before a recruiter ever does.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Matched to the job",
    body: "Paste the posting and get feedback aimed at that exact role.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M4 20V4" />
        <path d="M4 20h16" />
        <path d="M8 16l3-4 3 2 5-7" />
      </svg>
    ),
  },
  {
    title: "Concrete edits",
    body: "Not vibes — the actual lines to change and why.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
        <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z" />
      </svg>
    ),
  },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Auth() {
  const { auth, error, init, isLoading, puterReady } = usePuterStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedNext = searchParams.get("next");
  const nextPath =
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/";

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(nextPath, { replace: true });
    }
  }, [auth.isAuthenticated, navigate, nextPath]);

  let wordIndex = 0;
  const word = (text: string, className = "") => {
    const i = wordIndex++;
    return (
      <motion.span
        key={`${text}-${i}`}
        className={`mr-[0.28em] inline-block ${className}`}
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.span>
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative flex items-center justify-center overflow-hidden bg-[url('/images/bg-main-gloup.svg')] bg-cover bg-center px-4 pb-16">
        <AuroraBackground />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* left: copy + sign-in */}
          <div className="flex flex-col items-start gap-8 max-lg:items-center max-lg:text-center">
            <motion.div {...fadeUp(0)} className="flex flex-col items-start gap-5 max-lg:items-center">
              <Link to="/" className="text-2xl font-bold text-gradient">
                GloUp
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                AI-powered resume glow-ups
              </span>
            </motion.div>

            <h1 className="max-w-xl !leading-[1.05] max-sm:!text-[2.6rem]">
              {HEADLINE.map((w) => word(w))}
              {HEADLINE_GRADIENT.map((w) => word(w, "text-gradient"))}
              {HEADLINE_TAIL.map((w) => word(w))}
            </h1>

            <motion.p
              {...fadeUp(0.75)}
              className="max-w-md text-lg leading-8 text-muted"
            >
              Upload your resume, paste the job, and GloUp scores it, flags
              what's holding you back, and tells you exactly what to fix.
            </motion.p>

            {/* sign-in card */}
            <motion.section
              {...fadeUp(0.9)}
              className="w-full max-w-md rounded-[28px] bg-gradient-to-br from-violet/60 via-pink/40 to-orange/40 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.6)]"
            >
              <div className="rounded-[27px] bg-surface/90 p-6 backdrop-blur-xl sm:p-7">
                <ul className="mb-6 flex flex-col gap-4 text-left">
                  {PERKS.map((perk, i) => (
                    <motion.li
                      key={perk.title}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 1.1 + i * 0.12 }}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                        {perk.icon}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold text-ink">
                          {perk.title}
                        </span>
                        <span className="text-sm leading-6 text-muted">
                          {perk.body}
                        </span>
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {error && (
                  <p
                    className="mb-4 rounded-2xl border border-badge-red-text/30 bg-badge-red px-4 py-3 text-sm text-badge-red-text"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                {isLoading ? (
                  <button
                    className="primary-button flex cursor-wait items-center justify-center gap-3 py-4 text-lg font-semibold opacity-80"
                    disabled
                    type="button"
                  >
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Checking your session…
                  </button>
                ) : !puterReady ? (
                  <motion.button
                    className="primary-button py-4 text-lg font-semibold hover:primary-gradient-hover"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={init}
                    type="button"
                  >
                    Retry connection
                  </motion.button>
                ) : (
                  <motion.button
                    className="primary-button group flex items-center justify-center gap-2 py-4 text-lg font-semibold hover:primary-gradient-hover"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void auth.signIn()}
                    type="button"
                  >
                    Start your glow up
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </motion.button>
                )}

                <p className="mt-4 text-center text-xs leading-5 text-muted">
                  Secure sign-in with Puter. New here? You can create a free
                  account on the way and you'll land right back here.
                </p>
              </div>
            </motion.section>
          </div>

          {/* right: the glow-up animation */}
          <motion.div
            className="relative flex justify-center py-6 lg:py-12"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlowUpDemo />
          </motion.div>
        </div>
      </main>
    </MotionConfig>
  );
}
