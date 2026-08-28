import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReveal from "../lib/useReveal";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import CountUp from "../components/CountUp";
import { useQuoteCart } from "../context/QuoteCartContext";
import { ArrowIcon, CheckIcon, WrenchIcon, ShieldCheckIcon, VennIcon, HeadsetIcon, PinIcon } from "../lib/icons";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const { t } = useTranslation();
  const { setPanelOpen } = useQuoteCart();
  useSEO({ title: t("seo.about.title"), description: t("seo.about.description"), path: "/about" });
  const finalCtaRef = useRef(null);

  useReveal([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".about-hero .eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0.1)
        .from(".about-hero h1", { opacity: 0, y: 22, duration: 0.9 }, 0.2)
        .from(".about-hero .sub", { opacity: 0, y: 18, duration: 0.8 }, 0.35)
        .from(".about-hero .stat", { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.5);

      gsap.to(".story-panel-glow", { x: 30, y: -20, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".chip-1", { y: -10, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".chip-2", { y: 10, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.3 });
      gsap.to("#aboutMarquee", { xPercent: -50, duration: 16, ease: "none", repeat: -1 });

      gsap.to("#timelineFill", {
        height: "100%", ease: "none",
        scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 70%", scrub: true },
      });
      gsap.utils.toArray(".timeline-item").forEach(item =>
        ScrollTrigger.create({ trigger: item, start: "top 75%", onEnter: () => item.classList.add("active") })
      );
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

  const LOCATIONS = [
    { name: t("about.loc1Name"), addr: t("about.loc1Addr") },
    { name: t("about.loc2Name"), addr: t("about.loc2Addr") },
  ];

  return (
    <>
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="eyebrow"><span className="pip">{t("about.eyebrowPip")}</span> {t("about.eyebrow")}</div>
          <h1>{t("about.headline")} <span className="accent">{t("about.headlineAccent")}</span> {t("about.headlineRest")}</h1>
          <p className="sub">{t("about.sub")}</p>
          <div className="stats-row">
            <div className="stat"><CountUp target={500} suffix="+" delay={0.9} duration={1.4} /><div className="label">{t("about.statProjects")}</div></div>
            <div className="stat"><CountUp target={15} suffix="+" delay={0.9} duration={1.4} /><div className="label">{t("about.statYears")}</div></div>
            <div className="stat"><CountUp target={2} delay={0.9} duration={1.4} /><div className="label">{t("about.statLocations")}</div></div>
            <div className="stat"><CountUp target={12} delay={0.9} duration={1.4} /><div className="label">{t("about.statPartners")}</div></div>
          </div>
        </div>
      </section>

      <section className="block" id="story" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="story-grid">
            <div className="story-copy">
              <p className="lead reveal">{t("about.storyLead")}</p>
              <p className="reveal">{t("about.storyP1")}</p>
              <p className="reveal">{t("about.storyP2")}</p>
            </div>
            <div className="story-visual reveal">
              <div className="story-panel">
                <div className="story-panel-grid"></div>
                <div className="story-panel-glow"></div>
                <svg className="story-panel-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 4h16v6H10v10H4V4z" /></svg>
              </div>
              <div className="story-chip chip-1">
                <div className="ic"><CheckIcon size={16} /></div>
                {t("about.chip1")}
              </div>
              <div className="story-chip chip-2">
                <div className="ic"><WrenchIcon size={16} /></div>
                {t("about.chip2")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="values">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("about.valuesTag")}</div>
              <h2 className="section-title">{t("about.valuesTitle")}</h2>
            </div>
            <p className="section-sub">{t("about.valuesSub")}</p>
          </div>
          <div className="why-grid">
            <div className="why-card reveal">
              <div className="why-ic"><ShieldCheckIcon /></div>
              <h3>{t("about.value1Title")}</h3>
              <p>{t("about.value1Desc")}</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><VennIcon /></div>
              <h3>{t("about.value2Title")}</h3>
              <p>{t("about.value2Desc")}</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><WrenchIcon /></div>
              <h3>{t("about.value3Title")}</h3>
              <p>{t("about.value3Desc")}</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><HeadsetIcon /></div>
              <h3>{t("about.value4Title")}</h3>
              <p>{t("about.value4Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="timeline">
        <div className="container">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column", alignItems: "center" }}>
            <div className="section-tag center">{t("about.timelineTag")}</div>
            <h2 className="section-title" style={{ maxWidth: 600 }}>{t("about.timelineTitle")}</h2>
          </div>
          <div className="timeline">
            <div className="timeline-line"><div className="timeline-line-fill" id="timelineFill"></div></div>

            <div className="timeline-item reveal">
              <div className="timeline-dot"></div>
              <div className="timeline-stage">{t("about.stage1")}</div>
              <h4>{t("about.stage1Title")}</h4>
              <p>{t("about.stage1Desc")}</p>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-dot"></div>
              <div className="timeline-stage">{t("about.stage2")}</div>
              <h4>{t("about.stage2Title")}</h4>
              <p>{t("about.stage2Desc")}</p>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-stage">{t("about.stage3")}</div>
              <h4>{t("about.stage3Title")}</h4>
              <p>{t("about.stage3Desc")}</p>
              <div className="timeline-dot"></div>
            </div>
            <div className="timeline-item reveal">
              <div className="timeline-dot"></div>
              <div className="timeline-stage">{t("about.stage4")}</div>
              <h4>{t("about.stage4Title")}</h4>
              <p>{t("about.stage4Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="team">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("about.teamTag")}</div>
              <h2 className="section-title">{t("about.teamTitle")}</h2>
            </div>
          </div>
          <div className="team-grid">
            <div className="team-card reveal"><div className="team-avatar">A</div><div className="team-name">{t("about.role1")}</div><div className="team-role">{t("about.role1Sub")}</div></div>
            <div className="team-card reveal"><div className="team-avatar">H</div><div className="team-name">{t("about.role2")}</div><div className="team-role">{t("about.role2Sub")}</div></div>
            <div className="team-card reveal"><div className="team-avatar">O</div><div className="team-name">{t("about.role3")}</div><div className="team-role">{t("about.role3Sub")}</div></div>
            <div className="team-card reveal"><div className="team-avatar">C</div><div className="team-name">{t("about.role4")}</div><div className="team-role">{t("about.role4Sub")}</div></div>
          </div>
          <div className="team-note">{t("about.teamNote")}</div>
        </div>
      </section>

      <section className="marquee-section">
        <div className="marquee-label">{t("about.marqueeLabel")}</div>
        <div className="marquee-mask">
          <div className="marquee-track" id="aboutMarquee">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i}>MEDOS&nbsp;&nbsp;&nbsp;&nbsp;MACO&nbsp;&nbsp;&nbsp;&nbsp;ARPLAS&nbsp;&nbsp;&nbsp;&nbsp;PALRAM&nbsp;&nbsp;&nbsp;&nbsp;FLEXIDOOR</span>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="locations">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("about.locationsTag")}</div>
              <h2 className="section-title">{t("about.locationsTitle")}</h2>
            </div>
          </div>
          <div className="locations-grid">
            {LOCATIONS.map(loc => (
              <div className="location-card reveal" key={loc.name}>
                <div className="location-map">
                  <div className="location-map-grid"></div>
                  <span className="pin"><PinIcon /></span>
                </div>
                <h3>{loc.name}</h3>
                <div className="addr">{loc.addr}</div>
                <div className="meta">
                  <span>{t("about.hoursWeek")}</span>
                  <span>{t("about.hoursSat")}</span>
                  <a href="tel:+37460770700">+374 60 770 700</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="final-cta reveal" id="finalCta" ref={finalCtaRef}>
            <h2>{t("about.finalCtaTitle")}</h2>
            <p>{t("about.finalCtaDesc")}</p>
            <div className="cta-row">
              <MagnetButton as="button" className="btn-primary" onClick={() => setPanelOpen(true)}>{t("common.requestQuote")} <ArrowIcon size={16} /></MagnetButton>
              <a className="btn-secondary" href="tel:+37460770700">{t("common.callUs")}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
