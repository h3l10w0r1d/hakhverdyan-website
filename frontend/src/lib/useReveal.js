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

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 30 });
      ScrollTrigger.batch(targets, {
        start: "top 85%",
        once: true,
        onEnter: batch => {
          batch.forEach(el => { el.dataset.revealed = "1"; });
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", overwrite: true });
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
