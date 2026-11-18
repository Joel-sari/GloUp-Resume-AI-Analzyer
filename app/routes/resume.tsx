import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import ATS from '~/components/review/ATS';
import Details from '~/components/review/Details';
import Summary from '~/components/review/Summary';
import Navbar from '~/components/layout/Navbar';
import AuroraBackground from '~/components/layout/AuroraBackground';
import ScoreCircle from '~/components/score/ScoreCircle';
import FixDeck from '~/components/review/FixDeck';
import JobMatch from '~/components/review/JobMatch';
import QuickChecks from '~/components/review/QuickChecks';
import { PreviewSkeleton, ResumePreview } from '~/components/review/ResumePreview';
import ReviewEmptyState from '~/components/review/ReviewEmptyState';
import GlowHeadline from '~/components/review/GlowHeadline';
import TargetRole from '~/components/review/TargetRole';
import { usePuterStore } from '~/lib/puter';
import { normalizeFeedback } from '~/lib/feedback';
import { verdictFor } from '~/lib/score';
import { useCardSpotlight } from '~/lib/useCardSpotlight';


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

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

type TabKey = 'fixes' | 'breakdown' | 'ats' | 'fit';

const Resume = () => {

  const { auth, isLoading, fs, kv } = usePuterStore();
  // declared before the effects so it exists when their dependency arrays are read
  const { id } = useParams();
  const navigate = useNavigate()

  const [imageUrl, setImageUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [job, setJob] = useState<{ companyName?: string; jobTitle?: string; jobDescription?: string }>({});
  const [checks, setChecks] = useState<ResumeChecks | undefined>();
  const [status, setStatus] = useState<Status>('loading');
  const [tab, setTab] = useState<TabKey>('fixes');
  const tabBarRef = useRef<HTMLDivElement>(null);

  // glow on whichever card the cursor is over (see app.css .review-card)
  useCardSpotlight();

  // Links like #feedback-content (score breakdown rows) point at sections
  // that may live in another tab: switch to it, then scroll there once the
  // panel has swapped in.
  useEffect(() => {
    const onHash = () => {
      const target = decodeURIComponent(window.location.hash.slice(1));
      if (!target.startsWith('feedback-')) return;
      setTab(target === 'feedback-ATS' ? 'ats' : 'breakdown');
      setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const selectTab = (next: TabKey) => {
    setTab(next);
    // if the tab bar has scrolled off the top, bring it back so the new panel starts in view
    const bar = tabBarRef.current;
    if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


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
      setJob({ companyName: data.companyName, jobTitle: data.jobTitle, jobDescription: data.jobDescription });
      setChecks(data.checks);

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
      // normalize so older records (and odd model output) can't break the UI
      const fb = normalizeFeedback(data.feedback);
      if (!fb) return setStatus('incomplete');
      setFeedback(fb)
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

  const missingReqs = feedback?.requirements?.filter((r) => r.status === 'missing').length ?? 0;
  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'fixes', label: 'Fixes', count: fixes },
    { key: 'breakdown', label: 'Breakdown' },
    { key: 'ats', label: 'ATS' },
    ...(feedback?.requirements?.length ? [{ key: 'fit' as const, label: 'Role fit', count: missingReqs || undefined }] : []),
  ];

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
              <ReviewEmptyState
                title="We couldn't find this resume"
                body="The link may be wrong, or the resume was deleted. Head back to your dashboard or run a fresh analysis."
              />
            ) : (
              <>
                {/* header: headline + the role it was scored against */}
                <div className="mt-8 flex flex-col items-start gap-4">
                  <motion.span
                    {...fadeUp(0.05)}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
                  >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    Resume review
                  </motion.span>
                  <GlowHeadline />
                  <motion.div {...fadeUp(0.5)} className="max-w-full">
                    <TargetRole jobTitle={job.jobTitle} companyName={job.companyName} jobDescription={job.jobDescription} />
                  </motion.div>
                </div>

                {/*
                  Desktop: left = the result (score + resume, sticky), right = the work (tabs).
                  Mobile: the left wrapper dissolves (display: contents) so the order
                  becomes score → tabs → resume.
                */}
                <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-12">
                  <aside className="max-lg:contents lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-6">
                    <AnimatePresence>
                      {status === 'ready' && feedback && verdict && (
                        <motion.div
                          key="score"
                          className="max-lg:order-1"
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {/* score card, with a slowly rotating gradient ring */}
                          <div className="conic-ring rounded-[28px] p-[1.5px] shadow-[0_30px_90px_-30px_rgba(168,85,247,0.7)]">
                            <div className="flex flex-col items-center gap-4 rounded-[26.5px] bg-surface/95 p-5 backdrop-blur-xl sm:flex-row sm:gap-5">
                              <ScoreCircle score={feedback.overallScore} />
                              <div className="flex flex-1 flex-col gap-1.5 text-center sm:text-left">
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Overall score</span>
                                <span className={`text-2xl font-bold ${verdict.text}`}>{verdict.label}</span>
                                {/* the AI's personal one-liner when we have it (v2), else the generic band text */}
                                <span className={`text-sm leading-6 ${feedback.headline ? 'text-ink' : 'text-muted'}`}>
                                  {feedback.headline ?? verdict.blurb}
                                </span>
                                <div className="mt-1 flex flex-wrap justify-center gap-2 sm:justify-start">
                                  <button
                                    type="button"
                                    onClick={() => selectTab('fixes')}
                                    className="rounded-full bg-badge-yellow px-3 py-1 text-sm font-semibold text-badge-yellow-text transition-transform hover:scale-105"
                                  >
                                    {fixes} {fixes === 1 ? 'fix' : 'fixes'} to make →
                                  </button>
                                  <span className="rounded-full bg-badge-green px-3 py-1 text-sm font-semibold text-badge-green-text">
                                    {strengths} {strengths === 1 ? 'strength' : 'strengths'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* the resume itself; sized to fit under the score card on desktop */}
                    <div className="max-lg:order-3 max-lg:mt-6">
                      <AnimatePresence mode="wait">
                        {imageUrl && resumeUrl ? (
                          <ResumePreview key="preview" imageUrl={imageUrl} resumeUrl={resumeUrl} />
                        ) : (
                          <motion.div key="skeleton" exit={{ opacity: 0 }}>
                            <PreviewSkeleton />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </aside>

                  {/* right: the review itself */}
                  <section className="flex flex-col gap-6 max-lg:order-2">
                    <AnimatePresence mode="wait">
                      {status === 'ready' && feedback && verdict ? (
                        <motion.div
                          key="review"
                          className="flex flex-col gap-6"
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {/* tab bar: sticks to the top while you scroll a panel */}
                          <div ref={tabBarRef} className="sticky top-3 z-30 scroll-mt-3">
                            <div role="tablist" aria-label="Review sections" className="flex gap-1 overflow-x-auto rounded-full border border-border bg-surface/85 p-1 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                              {tabs.map((t) => {
                                const active = tab === t.key;
                                return (
                                  <button
                                    key={t.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => selectTab(t.key)}
                                    className={`relative flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'text-white' : 'text-muted hover:text-ink'}`}
                                  >
                                    {active && (
                                      <motion.span
                                        layoutId="review-tab-pill"
                                        className="absolute inset-0 rounded-full primary-gradient"
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                      />
                                    )}
                                    <span className="relative">{t.label}</span>
                                    {t.count !== undefined && t.count > 0 && (
                                      <span className={`relative rounded-full px-1.5 text-xs ${active ? 'bg-white/20' : 'bg-surface-2'}`}>{t.count}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* the active panel; switching blurs one out and the next in */}
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={tab}
                              role="tabpanel"
                              className="flex flex-col gap-6"
                              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            >
                              {tab === 'fixes' && <FixDeck feedback={feedback}/>}
                              {tab === 'breakdown' && (
                                <>
                                  <Summary feedback={feedback}/>
                                  <Details feedback={feedback}/>
                                </>
                              )}
                              {tab === 'ats' && (
                                <>
                                  <ATS score={feedback.ATS.score} suggestions={feedback.ATS.tips} keywords={feedback.keywords}/>
                                  {checks && <QuickChecks checks={checks}/>}
                                </>
                              )}
                              {tab === 'fit' && feedback.requirements && (
                                <JobMatch requirements={feedback.requirements} jobTitle={job.jobTitle}/>
                              )}
                            </motion.div>
                          </AnimatePresence>
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
              </>
            )}
          </div>
        </div>
      </main>
    </MotionConfig>
  );
};

export default Resume
