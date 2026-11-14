import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const username = auth.user?.username;

  const handleSignOut = async () => {
    await auth.signOut();
    if (!usePuterStore.getState().auth.isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div className="px-4">
      <nav className="navbar">
        <Link to="/" className="text-2xl font-bold text-gradient">
          GloUp
        </Link>

        <div className="flex items-center gap-3">
          {username && (
            <span className="hidden items-center gap-2 rounded-full border border-border bg-surface-2/70 py-1.5 pl-1.5 pr-3 text-sm text-muted sm:inline-flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full primary-gradient text-xs font-bold uppercase text-white">
                {username.charAt(0)}
              </span>
              {username}
            </span>
          )}

          <Link
            to="/upload"
            className="primary-button w-fit px-5 py-2.5 font-semibold hover:primary-gradient-hover"
          >
            Upload Resume
          </Link>

          {auth.isAuthenticated && (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isLoading}
              className="back-button rounded-full px-3 py-2.5 text-sm font-medium disabled:cursor-wait disabled:opacity-60"
              title="Log out"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 3v18" />
              </svg>
              <span className="max-sm:hidden">Log out</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
