import { useEffect, useRef } from "react";
import gsap from "gsap";

// Animates 0 -> target once mounted. Used for the hero/about stat rows.
export default function CountUp({ target, suffix = "", delay = 1.3, duration = 1.6 }) {
  const ref = useRef(null);

  useEffect(() => {
    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: target, duration, delay, ease: "power2.out",
      onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(counter.val); },
    });
    return () => tween.kill();
  }, [target, delay, duration]);

  return (
    <div className="num">
      <span ref={ref}>0</span>
      {suffix && <span className="suffix">{suffix}</span>}
    </div>
  );
}
