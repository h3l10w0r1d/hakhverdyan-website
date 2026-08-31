import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Scroll-in reveal for every ".reveal" element currently in the DOM. Call once per page,
// after the page's own content (and any data it needs, e.g. fetched products) has rendered.
export default function useReveal(deps = []) {
  useEffect(() => {
    // Skip elements a previous run of this hook already revealed (e.g. re-run after async content mounts).
    const targets = gsap.utils.toArray(".reveal").filter(el => !el.dataset.revealed);
    if (!targets.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(targets, { opacity: 1, y: 0, scale: 1, filter: "none" });
        targets.forEach(el => { el.dataset.revealed = "1"; });
        return;
      }
      gsap.set(targets, { opacity: 0, y: 34, scale: 0.96, filter: "blur(6px)" });
      ScrollTrigger.batch(targets, {
        start: "top 88%",
        once: true,
        onEnter: batch => {
          batch.forEach(el => { el.dataset.revealed = "1"; });
          gsap.to(batch, {
            opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
            duration: 0.9, stagger: 0.08, ease: "power3.out", overwrite: true,
          });
        },
      });
    });
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
