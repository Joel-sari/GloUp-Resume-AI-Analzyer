import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { MAX_NAME_LENGTH, useProfile } from "~/lib/profile";

/**
 * Loads the signed-in user's GloUp profile and shows the name dialog:
 * - first sign-in (no name saved yet): "What should we call you?" — required
 * - "Edit name" from the account menu: same dialog, cancellable
 * Rendered once at the app root.
 */
const ProfileManager = () => {
  const { auth, isLoading } = usePuterStore();
  const { displayName, loaded, editing, load, reset, closeEditor } = useProfile();
  const { pathname } = useLocation();

  // load the profile when someone signs in; forget it when they sign out
  const uuid = auth.user?.uuid;
  useEffect(() => {
    if (isLoading) return;
    if (auth.isAuthenticated && uuid) void load();
    else reset();
  }, [isLoading, auth.isAuthenticated, uuid, load, reset]);

  const onboarding = auth.isAuthenticated && loaded && !displayName && pathname !== "/auth";
  const open = onboarding || editing;
  if (!open) return null;

  return (
    <NameDialog
      mode={onboarding ? "welcome" : "edit"}
      // suggest their Puter username only when it's a real (non-random) one
      initial={displayName ?? (auth.user && !auth.user.is_temp ? auth.user.username : "")}
      onClose={closeEditor}
    />
  );
};

const NameDialog = ({ mode, initial, onClose }: { mode: "welcome" | "edit"; initial: string; onClose: () => void }) => {
  const save = useProfile((s) => s.save);
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const welcome = mode === "welcome";

  // native modal: focus trap, inert page behind it
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await save(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your name. Try again.");
      setSaving(false);
    }
  };

  const trimmed = name.trim();

  return (
    <dialog
      ref={ref}
      aria-labelledby="name-dialog-title"
      // Esc: closes the editor, but the first-time welcome must be completed
      onCancel={(e) => {
        e.preventDefault();
        if (!welcome && !saving) onClose();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[28px] bg-transparent p-0 text-ink backdrop:bg-base/80 backdrop:backdrop-blur-md open:animate-in open:fade-in open:zoom-in-95 open:duration-200"
    >
      <div className="rounded-[28px] bg-gradient-to-br from-violet/70 via-pink/50 to-orange/50 p-px shadow-[0_40px_120px_-30px_rgba(168,85,247,0.7)]">
        <form onSubmit={handleSubmit} className="!gap-5 rounded-[27px] bg-surface p-7">
          <div className="flex w-full flex-col items-center gap-3 text-center">
            {welcome && (
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl primary-gradient text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
                </svg>
              </span>
            )}
            <p id="name-dialog-title" className="text-2xl font-bold">
              {welcome ? (
                <>
                  Welcome to <span className="text-gradient">GloUp</span>
                </>
              ) : (
                "Edit your name"
              )}
            </p>
            <p className="text-sm text-muted">
              {welcome ? "What should we call you?" : "This is how GloUp greets you. You can change it any time."}
            </p>
          </div>

          <div className="form-div">
            <label htmlFor="display-name" className="text-sm">
              Your name
            </label>
            <input
              id="display-name"
              autoFocus
              autoComplete="given-name"
              maxLength={MAX_NAME_LENGTH}
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
            {error && <p className="text-sm font-semibold text-badge-red-text">{error}</p>}
          </div>

          <div className="flex w-full gap-3">
            {!welcome && (
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="back-button flex-1 justify-center rounded-full py-3 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!trimmed || saving}
              className="primary-button flex-1 py-3 font-semibold hover:primary-gradient-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : welcome ? "Continue" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default ProfileManager;
