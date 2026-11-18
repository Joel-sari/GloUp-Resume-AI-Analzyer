import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { usePuterStore } from "./lib/puter";
import { useEffect } from "react";
import ProfileManager from "./components/layout/ProfileManager";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {

  // the init that comes from out usePuterStore() starts our connection up with Puter
  const { init } = usePuterStore(); 


  // the init function verifies whether or not the user is there
  useEffect(()=> {
    init()

  }, [init])
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <script src="https://js.puter.com/v2/"></script>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      {/* asks for a display name on first sign-in; also the "Edit name" dialog */}
      <ProfileManager />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const title = notFound ? "This page doesn't exist" : "Something went wrong";
  let details = notFound
    ? "The link may be broken, or the page was moved."
    : "An unexpected error occurred. Try again, or head back to your dashboard.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error) && !notFound) {
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    // only show the real error while developing
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-[28px] bg-gradient-to-br from-violet/60 via-pink/40 to-orange/40 p-px shadow-[0_30px_90px_-30px_rgba(168,85,247,0.6)]">
        <div className="flex flex-col items-center gap-4 rounded-[27px] bg-surface/95 p-10 text-center">
          <p className="text-7xl font-bold text-gradient">{notFound ? "404" : "Oops"}</p>
          <p className="text-2xl font-semibold text-ink">{title}</p>
          <p className="text-muted">{details}</p>
          <a href="/" className="primary-button mt-2 w-fit px-6 py-3 font-semibold hover:primary-gradient-hover">
            Back to dashboard
          </a>
          {stack && (
            <pre className="mt-4 max-h-64 w-full overflow-auto rounded-xl bg-base p-4 text-left text-xs text-muted">
              <code>{stack}</code>
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
