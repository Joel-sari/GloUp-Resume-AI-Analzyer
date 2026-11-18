import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

// Publishable key from logo.dev (safe in the browser). Without one we just
// show the avatar, so the app works fine before you sign up.
const LOGO_DEV_KEY = import.meta.env.VITE_LOGO_DEV_KEY as string | undefined;

// A few brand-gradient pairs; each company always gets the same one.
const AVATAR_GRADIENTS = [
  "from-violet to-pink",
  "from-pink to-orange",
  "from-orange to-violet",
  "from-accent to-orange",
  "from-violet to-orange",
];

// One request size for every logo on the site (big enough for the largest use, sharp on retina).
const LOGO_PX = 128;

const hash = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

interface CompanyLogoProps {
  name?: string;
  size?: number; // px
  className?: string;
}

/**
 * The company's logo (logo.dev name lookup) in a circle. If there's no key,
 * no name, or logo.dev doesn't know the company, it's a gradient avatar with
 * the first letter instead.
 */
const CompanyLogo = ({ name, size = 40, className }: CompanyLogoProps) => {
  const clean = name?.trim() ?? "";
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Only request the logo in the browser: an <img> that errors during server
  // render can fail before React hydrates and its onError never fires.
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [clean]);

  // Same URL everywhere for a given company (fixed size, lowercased name), so
  // the browser's 24-hour cache of Logo.dev images is reused across the
  // dashboard and review page instead of downloading each size separately.
  const src =
    mounted && LOGO_DEV_KEY && clean
      ? `https://img.logo.dev/name/${encodeURIComponent(clean.toLowerCase())}?token=${LOGO_DEV_KEY}&size=${LOGO_PX}&format=png&fallback=404`
      : null;

  const gradient = AVATAR_GRADIENTS[Math.abs(hash(clean.toLowerCase())) % AVATAR_GRADIENTS.length];

  return (
    <span
      className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      {/* avatar: always underneath, visible until (unless) a real logo loads */}
      <span
        aria-hidden={loaded}
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient} font-bold uppercase text-white`}
        style={{ fontSize: size * 0.42 }}
      >
        {clean.charAt(0) || "?"}
      </span>

      {src && !failed && (
        <img
          src={src}
          alt={clean ? `${clean} logo` : ""}
          onLoad={() => setLoaded(true)}
          // fallback=404 makes unknown companies error instead of returning a monogram
          onError={() => setFailed(true)}
          className={`relative h-full w-full bg-white object-contain p-[14%] transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </span>
  );
};

export default CompanyLogo;
