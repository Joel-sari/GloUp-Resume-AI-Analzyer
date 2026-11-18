import { useEffect } from "react";

/**
 * One pointer listener for the whole page: lights up the `.review-card`
 * under the cursor by setting --x / --y on it (see app.css). Mouse only,
 * and off for users who prefer reduced motion.
 */
export function useCardSpotlight() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lit: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const card = (e.target as Element | null)?.closest?.(".review-card") as HTMLElement | null;
      if (lit && lit !== card) lit.dataset.lit = "false";
      lit = card;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--y", `${e.clientY - rect.top}px`);
      card.dataset.lit = "true";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (lit) lit.dataset.lit = "false";
    };
  }, []);
}
