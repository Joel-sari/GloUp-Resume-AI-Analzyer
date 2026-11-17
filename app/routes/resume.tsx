import { useEffect, useState, type PointerEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import ATS from '~/components/ATS';
import Details from '~/components/Details';
import Summary from '~/components/Summary';
import Navbar from '~/components/Navbar';
import AuroraBackground from '~/components/AuroraBackground';
import ScoreCircle from '~/components/ScoreCircle';
import { usePuterStore } from '~/lib/puter';


export const meta = () => ([
  {title: 'GloUp | Review'},
  {name: 'description', content: 'Detailed overview of your resume'},
])

// loading  → still fetching from kv / fs
// ready    → feedback is here, show everything
// incomplete → record exists but the analysis never finished (feedback is null)
// missing  → no record for this id, or the files could not be read
type Status = 'loading' | 'ready' | 'incomplete' | 'missing';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// Same bands the AI is told to score with (see prepareInstructions).
const verdictFor = (score: number) => {
  if (score >= 90) return { label: 'Ready to send', tone: 'text-badge-green-text', blurb: 'This one is ready to go out. Polish the last details and hit apply.' };
  if (score >= 70) return { label: 'Solid', tone: 'text-badge-green-text', blurb: 'A strong base. A few targeted fixes will push it over the line.' };
  if (score >= 50) return { label: 'Needs work', tone: 'text-badge-yellow-text', blurb: 'Some real issues could get this filtered out. The fixes below show you where to start.' };
  return { label: 'Major fixes', tone: 'text-badge-red-text', blurb: 'This needs a rework before you send it. Start with the top improvements below.' };
};

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const Sparkle = ({ className, delay }: { className: string; delay: number }) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={`pointer-events-none absolute z-20 text-ink drop-shadow-[0_0_8px_rgba(236,72,153,0.9)] ${className}`}
    initial={{ opacity: 0, scale: 0, rotate: -30 }}
    animate={{ opacity: [0, 1, 0.85], scale: [0, 1.25, 1], rotate: 0 }}
    transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    fill="currentColor"
  >
    <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
  </motion.svg>
);

/**
 * The resume preview. A gradient frame that tilts with the pointer, with a
 * glare that follows it. When it first appears, a light band sweeps across it
 * once and a few sparkles pop in (the glow up moment).
 */
const ResumePreview = ({ imageUrl, resumeUrl, score }: { imageUrl: string; resumeUrl: string; score?: number }) => {
  const reduced = useReducedMotion();

  // pointer position over the card, 0..1 on each axis (0.5 = centre)
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 18 };
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), spring);
  const glareX = useTransform(px, [0, 1], ['0%', '100%']);
  const glareY = useTransform(py, [0, 1], ['0%', '100%']);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.16), transparent 45%)`;

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const verdict = score !== undefined ? verdictFor(score) : null;

  return (
    <motion.div
      className="relative mx-auto w-fit max-w-full [perspective:1200px]"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* soft halo behind the card */}
      <motion.div
        aria-hidden
        className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-violet via-pink to-orange blur-3xl"
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <Sparkle className="-left-3 top-10 h-6 w-6" delay={1.4} />
      <Sparkle className="-right-2 top-1/3 h-4 w-4" delay={1.6} />
      <Sparkle className="bottom-16 -left-2 h-3.5 w-3.5" delay={1.8} />

      <motion.div
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative rounded-[28px] bg-gradient-to-br from-violet/70 via-pink/50 to-orange/50 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.7)]"
      >
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-[27px] bg-surface/90 p-3 backdrop-blur-xl"
        >
          <img
            src={imageUrl}
            alt="Resume preview"
            className="max-h-[78vh] w-full rounded-[20px] object-contain lg:w-auto"
          />

          {/* light band that sweeps across once */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-150%' }}
            animate={{ x: '400%' }}
            transition={{ duration: 1.4, delay: 0.5, ease: 'easeInOut' }}
          />

          {/* glare that follows the pointer */}
          {!reduced && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundImage: glare }}
            />
          )}

          {/* hover hint */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-base/90 to-transparent pb-5 pt-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full border border-border bg-surface/90 px-4 py-2 text-sm font-semibold text-ink backdrop-blur">
              Open full PDF ↗
            </span>
          </span>
        </a>
      </motion.div>

      {/* floating score badge */}
      {verdict && score !== undefined && (
        <motion.div
          className="absolute -right-3 -top-4 z-20 flex items-center gap-2 rounded-full border border-border bg-surface/95 py-1.5 pl-1.5 pr-4 shadow-[0_12px_40px_-12px_rgba(236,72,153,0.7)] backdrop-blur sm:-right-6"
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.4, delay: 1.2 },
            scale: { duration: 0.5, delay: 1.2, type: 'spring', bounce: 0.5 },
            y: { duration: 4, delay: 1.8, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full primary-gradient text-sm font-bold text-white">
            {score}
          </span>
          <span className={`text-sm font-semibold ${verdict.tone}`}>{verdict.label}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

/** Placeholder card while the resume loads, with a scan line moving down it. */
const PreviewSkeleton = () => (
  <div className="relative mx-auto w-full max-w-md rounded-[28px] bg-gradient-to-br from-violet/50 via-pink/30 to-orange/30 p-px">
    <div className="relative aspect-[8.5/11] overflow-hidden rounded-[27px] bg-surface/90 p-8 backdrop-blur-xl">
      <div className="flex flex-col gap-3">
        <div className="h-5 w-1/2 animate-pulse rounded-full bg-surface-2" />
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-surface-2" />
        {[0.9, 0.75, 0.85, 0.6, 0.8, 0.7, 0.9, 0.55, 0.8, 0.65].map((w, i) => (
          <div
            key={i}
            className={`h-2.5 animate-pulse rounded-full bg-surface-2 ${i % 4 === 0 ? 'mt-5' : ''}`}
            style={{ width: `${w * 100}%` }}
          />
        ))}
      </div>
      <motion.div
        aria-hidden
        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-pink/25 to-transparent"
        initial={{ top: '-25%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-violet via-pink to-orange shadow-[0_0_12px_2px_rgba(236,72,153,0.6)]" />
      </motion.div>
    </div>
  </div>
);

/** Shown when there's no record, or the analysis never finished. */
const EmptyState = ({ title, body }: { title: string; body: string }) => (
  <motion.div
    {...fadeUp(0.1)}
    className="mx-auto mt-16 w-full max-w-xl rounded-[28px] bg-gradient-to-br from-violet/60 via-pink/40 to-orange/40 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.6)]"
  >
    <div className="flex flex-col items-center gap-4 rounded-[27px] bg-surface/90 p-10 text-center backdrop-blur-xl">
      <span className="text-4xl">🔍</span>
      <p className="text-2xl font-semibold text-ink">{title}</p>
      <p className="text-muted">{body}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link to="/" className="back-button rounded-full px-5 py-2.5 font-medium">Back to dashboard</Link>
        <Link to="/upload" className="primary-button w-fit px-5 py-2.5 font-semibold hover:primary-gradient-hover">
          Run a new analysis
        </Link>
      </div>
    </div>
  </motion.div>
);


const Resume = () => {

  const { auth, isLoading, fs, kv } = usePuterStore();
  // declared before the effects so it exists when their dependency arrays are read
  const { id } = useParams();
  const navigate = useNavigate()

  const [imageUrl, setImageUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [job, setJob] = useState<{ companyName?: string; jobTitle?: string }>({});
  const [status, setStatus] = useState<Status>('loading');


  // not signed in → send to auth, then come back to this resume
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  }, [isLoading, auth.isAuthenticated, id, navigate]);

  // this is where we will get the data as this page is loaded
  useEffect(() => {
    // wait until puter is ready before touching kv / fs
    if (isLoading || !id) return;

    // if the user leaves (or the id changes) mid-load, ignore late results
    let cancelled = false;
    const objectUrls: string[] = [];

    // we will use the key value storage to get our information
    const loadResume = async () => {
      setStatus('loading');
      const stored = await kv.get(`resume:${id}`);
      if (cancelled) return;
      if (!stored) return setStatus('missing');

      const data = JSON.parse(stored);
      setJob({ companyName: data.companyName, jobTitle: data.jobTitle });

      // now we can read by getting the blob and converting it
      const resumeBlob = await fs.read(data.resumePath)
      if (cancelled) return;
      if (!resumeBlob) return setStatus('missing');

      const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf'})
      const pdfUrl = URL.createObjectURL(pdfBlob);
      objectUrls.push(pdfUrl);
      // setting the state
      setResumeUrl(pdfUrl)

      // the preview image is only for the UI, so a missing one isn't fatal
      const imageBlob = await fs.read(data.imagePath);
      if (cancelled) return;
      if (imageBlob) {
        const imgUrl = URL.createObjectURL(imageBlob);
        objectUrls.push(imgUrl);
        setImageUrl(imgUrl)
      }

      //finally set loaded data into feedback state
      if (!data.feedback) return setStatus('incomplete');
      setFeedback(data.feedback)
      setStatus('ready');
    };

    loadResume().catch((err) => {
      console.error(err);
      if (!cancelled) setStatus('missing');
    });

    // free the blob URLs when leaving the page
    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [id, isLoading]);

  // counts across every category, for the hero line
  const allTips = feedback
    ? [feedback.ATS, feedback.toneAndStyle, feedback.content, feedback.structure, feedback.skills].flatMap((c) => c.tips ?? [])
    : [];
  const fixes = allTips.filter((t) => t.type === 'improve').length;
  const strengths = allTips.length - fixes;
  const verdict = feedback ? verdictFor(feedback.overallScore) : null;
  const jobLine = [job.jobTitle, job.companyName].filter(Boolean).join(' · ');

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative overflow-hidden bg-[url('/images/bg-main-gloup.svg')] bg-cover">
        <AuroraBackground />

        <div className="relative">
          <Navbar />

          <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-8 sm:px-8">
            {/* top bar */}
            <motion.div {...fadeUp(0)} className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/" className="back-button rounded-full px-4 py-2 text-sm font-semibold">
                <BackIcon />
                Back to dashboard
              </Link>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="back-button rounded-full px-4 py-2 text-sm font-semibold"
                >
                  Open PDF ↗
                </a>
              )}
            </motion.div>

            {status === 'missing' ? (
              <EmptyState
                title="We couldn't find this resume"
                body="The link may be wrong, or the resume was deleted. Head back to your dashboard or run a fresh analysis."
              />
            ) : (
              <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                {/* left: the resume itself, sticky on desktop, below the review on mobile */}
                <section className="max-lg:order-last lg:sticky lg:top-8 lg:self-start">
                  <AnimatePresence mode="wait">
                    {imageUrl && resumeUrl ? (
                      <ResumePreview
                        key="preview"
                        imageUrl={imageUrl}
                        resumeUrl={resumeUrl}
                        score={feedback?.overallScore}
                      />
                    ) : (
                      <motion.div key="skeleton" exit={{ opacity: 0 }}>
                        <PreviewSkeleton />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>

                {/* right: hero + review */}
                <section className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <motion.span
                      {...fadeUp(0.05)}
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                      Resume review
                    </motion.span>

                    <motion.h1 {...fadeUp(0.1)} className="!text-4xl sm:!text-5xl">
                      Your resume,{' '}
                      <span className="text-gradient whitespace-nowrap">glowed up</span>
                    </motion.h1>

                    {jobLine && (
                      <motion.p {...fadeUp(0.15)} className="text-lg text-muted">
                        Scored against <span className="font-semibold text-ink">{jobLine}</span>
                      </motion.p>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {status === 'ready' && feedback && verdict ? (
                      <motion.div
                        key="review"
                        className="flex flex-col gap-10"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {/* score card */}
                        <div className="rounded-[28px] bg-gradient-to-br from-violet/60 via-pink/40 to-orange/40 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.6)]">
                          <div className="flex flex-col items-center gap-6 rounded-[27px] bg-surface/90 p-6 backdrop-blur-xl sm:flex-row sm:p-8">
                            <div className="scale-125">
                              <ScoreCircle score={feedback.overallScore} />
                            </div>
                            <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
                              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Overall score</span>
                              <span className={`text-3xl font-bold ${verdict.tone}`}>{verdict.label}</span>
                              <span className="text-muted">{verdict.blurb}</span>
                              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                                <span className="rounded-full bg-badge-yellow px-3 py-1 text-sm font-semibold text-badge-yellow-text">
                                  {fixes} {fixes === 1 ? 'fix' : 'fixes'} to make
                                </span>
                                <span className="rounded-full bg-badge-green px-3 py-1 text-sm font-semibold text-badge-green-text">
                                  {strengths} {strengths === 1 ? 'strength' : 'strengths'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* your components */}
                        <div className="flex flex-col gap-8">
                          <Summary feedback={feedback}/>
                          <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []}/>
                          <Details feedback={feedback}/>
                        </div>
                      </motion.div>
                    ) : status === 'incomplete' ? (
                      <motion.div key="incomplete" {...fadeUp(0)} className="rounded-2xl border border-badge-yellow-text/30 bg-badge-yellow p-6">
                        <p className="text-lg font-semibold text-badge-yellow-text">This analysis didn't finish</p>
                        <p className="mt-1 text-muted">
                          Your resume was saved, but the AI review never came back. Run it again to get your score.
                        </p>
                        <Link to="/upload" className="primary-button mt-4 inline-block w-fit px-5 py-2.5 font-semibold hover:primary-gradient-hover">
                          Try again
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="loading"
                        className="flex flex-col items-center gap-4 rounded-[28px] border border-border bg-surface/70 p-8 backdrop-blur"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <img src="/images/resume-scan-2.gif" alt="Loading your review" className="w-full max-w-xs rounded-2xl"/>
                        <p className="text-muted">Pulling up your review…</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </MotionConfig>
  );
};

export default Resume
