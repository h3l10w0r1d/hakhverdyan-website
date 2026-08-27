import { useEffect, useRef } from "react";
import gsap from "gsap";
import useReveal from "../lib/useReveal";
import MagnetButton from "../components/MagnetButton";
import { ArrowIcon, CheckIcon, WrenchIcon, DraftIcon, HeadsetIcon, GlobeIcon, ClockIcon, ShieldCheckIcon } from "../lib/icons";

const SERVICES = [
  {
    num: "01",
    icon: <WrenchIcon size={22} />,
    title: "Construction & Assembly",
    lead: "On-site construction and structural assembly for aluminum, PVC, and glass systems — residential and commercial. Certified crews handle everything from measurement to final fit.",
    items: ["Site measurement & prep", "Structural assembly & installation", "Sealing & weatherproofing", "Post-install cleanup & walkthrough"],
  },
  {
    num: "02",
    icon: <DraftIcon size={22} />,
    title: "Engineering Consultation",
    lead: "Technical planning and material specification before you commit — sized, priced, and ready to build. We catch spec issues before they become expensive reorders.",
    items: ["Load & structural review", "Material & profile selection", "Technical drawings", "Budget-accurate quoting"],
  },
  {
    num: "03",
    icon: <HeadsetIcon size={22} />,
    title: "Technical & After-Sales Support",
    lead: "Maintenance, part replacement, and advisory support long after installation is complete. The relationship doesn't end at handover.",
    items: ["Scheduled maintenance visits", "Replacement parts sourcing", "Troubleshooting & repairs", "Priority phone support"],
  },
];

const INCLUDED = [
  { icon: "֏", title: "Fixed Quote", desc: "Priced before work starts, honored through completion — no change orders you didn't approve." },
  { icon: <ClockIcon />, title: "On-Time Crews", desc: "Scheduled dates are commitments. Delays get communicated before they happen, not after." },
  { icon: <ShieldCheckIcon />, title: "Licensed & Insured", desc: "Every install is covered — materials, labor, and liability, from day one." },
  { icon: <GlobeIcon />, title: "EU-Sourced Parts", desc: "Replacement components come from the same vetted manufacturers as the original install." },
];

export default function Services() {
  const finalCtaRef = useRef(null);
  useReveal([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".services-hero .section-tag", { opacity: 0, y: 14, duration: 0.6 }, 0.1)
        .from(".services-hero h1", { opacity: 0, y: 22, duration: 0.8 }, 0.2)
        .from(".services-hero .sub", { opacity: 0, y: 16, duration: 0.7 }, 0.35);

      gsap.utils.toArray(".feature-panel-glow").forEach((glow, i) => {
        gsap.to(glow, { x: i % 2 === 0 ? 30 : -30, y: -20, duration: 4 + i, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
    });

    const onCtaMove = e => {
      const el = finalCtaRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    };
    finalCtaRef.current?.addEventListener("mousemove", onCtaMove);

    return () => {
      finalCtaRef.current?.removeEventListener("mousemove", onCtaMove);
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section className="services-hero">
        <div className="services-hero-inner">
          <div className="section-tag">Services</div>
          <h1>Not just a supplier — your build partner from spec to support.</h1>
          <p className="sub">Three services, one team. No separate contractors to coordinate, no gaps between "we sold it" and "we installed it."</p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 20 }}>
        <div className="container">
          {SERVICES.map((svc, i) => (
            <div className={"feature-row" + (i % 2 === 1 ? " reverse" : "")} key={svc.num}>
              <div className="feature-copy reveal">
                <div className="feature-num">{svc.num} / {String(SERVICES.length).padStart(2, "0")}</div>
                <h3>{svc.title}</h3>
                <p className="lead">{svc.lead}</p>
                <ul className="feature-list">
                  {svc.items.map(item => (
                    <li key={item}><span className="check"><CheckIcon size={13} /></span>{item}</li>
                  ))}
                </ul>
                <MagnetButton as="button" className="btn-secondary">Ask about this service <ArrowIcon size={16} /></MagnetButton>
              </div>
              <div className="feature-visual reveal">
                <div className="story-panel">
                  <div className="story-panel-grid"></div>
                  <div className="story-panel-glow feature-panel-glow"></div>
                  <div className="story-panel-mark" style={{ display: "flex", alignItems: "center", justifyContent: "center", transform: "translate(-50%,-50%) scale(3.2)" }}>
                    {svc.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="block" id="included">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Every project includes</div>
              <h2 className="section-title">The baseline, not the upsell.</h2>
            </div>
            <p className="section-sub">These aren't add-ons — they're how every job runs by default.</p>
          </div>
          <div className="why-grid">
            {INCLUDED.map(item => (
              <div className="why-card reveal" key={item.title}>
                <div className="why-ic">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="final-cta reveal" id="finalCta" ref={finalCtaRef}>
            <h2>Not sure which service you need?</h2>
            <p>Call +374&nbsp;60&nbsp;770&nbsp;700 and describe the project — we'll tell you exactly what it involves.</p>
            <div className="cta-row">
              <MagnetButton as="button" className="btn-primary">Request a Quote <ArrowIcon size={16} /></MagnetButton>
              <button className="btn-secondary">Call +374 60 770 700</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
