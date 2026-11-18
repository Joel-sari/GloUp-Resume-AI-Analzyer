import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { usePuterStore } from "~/lib/puter";
import { useDisplayName, useProfile } from "~/lib/profile";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/upload", label: "New analysis", end: false },
];

const LogoMark = () => (
  <span className="relative flex h-9 w-9 items-center justify-center rounded-xl primary-gradient shadow-[0_8px_24px_-8px_rgba(236,72,153,0.8)] transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-105">
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
      <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" opacity=".75" />
    </svg>
  </span>
);

/** Avatar button with a small account menu (who's signed in, links, log out). */
const UserMenu = ({ name }: { name: string | null }) => {
  const { auth, isLoading } = usePuterStore();
  const openEditor = useProfile((s) => s.openEditor);
  const isTemp = Boolean(auth.user?.is_temp);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await auth.signOut();
    if (!usePuterStore.getState().auth.isAuthenticated) navigate("/auth", { replace: true });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={isTemp ? "Account menu (temporary account)" : "Account menu"}
        className="flex items-center gap-2 rounded-full border border-border bg-surface-2/60 py-1 pl-1 pr-2.5 text-sm text-muted transition-colors hover:border-accent/40 hover:text-ink"
      >
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full primary-gradient text-xs font-bold uppercase text-white">
          {/* small nudge: temporary accounts should be saved on Puter (details in the menu) */}
          {isTemp && (
            <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-badge-yellow-text" />
          )}
          {name ? name.charAt(0) : ""}
        </span>
        {name && <span className="max-w-28 truncate max-sm:hidden">{name}</span>}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <div className="px-3 py-2.5">
              <p className="text-xs text-muted">Signed in as</p>
              <p className="truncate font-semibold text-ink">{name ?? "…"}</p>
              {isTemp && (
                <p className="mt-1.5 text-xs leading-5 text-muted">
                  <span className="text-badge-yellow-text">Temporary account.</span> Save it on Puter so you don't lose
                  your resumes.{" "}
                  <a
                    href="https://puter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="font-semibold text-accent hover:underline"
                  >
                    Save on Puter ↗
                  </a>
                </p>
              )}
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                openEditor();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              Edit name
            </button>
            <div className="my-1 h-px bg-border" />
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              disabled={isLoading}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-badge-red hover:text-badge-red-text disabled:cursor-wait disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M15 17l5-5-5-5" />
                <path d="M20 12H9" />
                <path d="M12 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
              </svg>
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Sticky top bar. Transparent at the top of the page; once you scroll it
 * turns into a glass pill so content slides underneath it.
 */
const Navbar = () => {
  const { auth } = usePuterStore();
  const name = useDisplayName();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-4 pt-3">
      {/* full-width fade so content scrolling under the bar doesn't show beside it */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-base via-base/80 to-transparent transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
      <nav
        className={`relative mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 rounded-full border py-2 pl-2.5 pr-2 transition-all duration-300 ${
          scrolled
            ? "border-border bg-surface/80 shadow-[0_20px_60px_-30px_rgba(168,85,247,0.6)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <Link to="/" className="group flex items-center gap-2.5" aria-label="GloUp home">
          <LogoMark />
          <span className="text-xl font-bold tracking-tight text-ink">
            Glo<span className="text-gradient">Up</span>
          </span>
        </Link>

        {/* page links, with a pill that slides to the active one */}
        <div className="flex items-center gap-1 rounded-full border border-border bg-surface-2/40 p-1 max-sm:hidden">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${isActive ? "text-ink" : "text-muted hover:text-ink"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full border border-accent/30 bg-accent/15"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/upload"
            className="primary-button flex w-fit items-center gap-1.5 px-4 py-2 text-sm font-semibold hover:primary-gradient-hover"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="max-sm:hidden">Analyze resume</span>
            <span className="sm:hidden">New</span>
          </Link>
          {auth.isAuthenticated && <UserMenu name={name} />}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
