import { Link } from "react-router";

/**
 * Site footer: ownership line.
 * When the app goes commercial (V2), Logo.dev's free plan requires a visible
 * "Logos provided by Logo.dev" link (to https://logo.dev), e.g. here.
 */
const Footer = () => (
  <footer className="relative mt-auto px-4 pb-8 pt-16">
    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted sm:flex-row">
      <div className="flex items-center gap-2.5">
        <Link to="/" className="font-bold text-ink">
          <span className="text-gradient">GloUp</span>
        </Link>
        <span aria-hidden>·</span>
        <span>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-ink">joelsaricodes</span>. All
          rights reserved.
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
