import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import Nav from "./Nav";
import Footer from "./Footer";
import QuoteCart from "./QuoteCart";

export default function Layout() {
  const { pathname } = useLocation();

  // Reset scroll to top on every route change (SPA navigation doesn't do this by default).
  // Uses "instant" rather than the global smooth-scroll CSS so it can't be interrupted by
  // residual scroll momentum from the page you navigated away from.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // One-time global ambient effects: nav fade-in, cursor glow, drifting background blobs.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("#navInner", { y: -30, opacity: 0, duration: 0.8, ease: "power4.out" });
      gsap.to(".blob-1", { x: -20, y: 30, duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".blob-2", { x: 20, y: -20, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });

    const glow = document.getElementById("cursorGlow");
    const quickX = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3.out" });
    const quickY = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3.out" });
    const onMove = e => { quickX(e.clientX); quickY(e.clientY); };
    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <div className="bg-field">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="grid-overlay"></div>
      </div>
      <div className="cursor-glow" id="cursorGlow"></div>

      <Nav />
      <Outlet />
      <Footer />
      <QuoteCart />
    </>
  );
}
