import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import useReveal from "../lib/useReveal";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import { ArrowIcon, CheckIcon, WrenchIcon, DraftIcon, HeadsetIcon, GlobeIcon, ClockIcon, ShieldCheckIcon } from "../lib/icons";

export default function Services() {
  const { t } = useTranslation();
  useSEO({ title: t("seo.services.title"), description: t("seo.services.description"), path: "/services" });
  const finalCtaRef = useRef(null);
  useReveal([]);

  const SERVICES = [
    {
      num: "01",
      icon: <WrenchIcon size={22} />,
      title: t("services.svc1Title"),
      lead: t("services.svc1Lead"),
      items: [t("services.svc1Item1"), t("services.svc1Item2"), t("services.svc1Item3"), t("services.svc1Item4")],
    },
    {
      num: "02",
      icon: <DraftIcon size={22} />,
      title: t("services.svc2Title"),
      lead: t("services.svc2Lead"),
      items: [t("services.svc2Item1"), t("services.svc2Item2"), t("services.svc2Item3"), t("services.svc2Item4")],
    },
    {
      num: "03",
      icon: <HeadsetIcon size={22} />,
      title: t("services.svc3Title"),
      lead: t("services.svc3Lead"),
      items: [t("services.svc3Item1"), t("services.svc3Item2"), t("services.svc3Item3"), t("services.svc3Item4")],
    },
  ];

  const INCLUDED = [
    { icon: "֏", title: t("services.inc1Title"), desc: t("services.inc1Desc") },
    { icon: <ClockIcon />, title: t("services.inc2Title"), desc: t("services.inc2Desc") },
    { icon: <ShieldCheckIcon />, title: t("services.inc3Title"), desc: t("services.inc3Desc") },
    { icon: <GlobeIcon />, title: t("services.inc4Title"), desc: t("services.inc4Desc") },
  ];

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
          <div className="section-tag">{t("services.tag")}</div>
          <h1>{t("services.title")}</h1>
          <p className="sub">{t("services.sub")}</p>
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
                <MagnetButton as="button" className="btn-secondary">{t("services.askAboutService")} <ArrowIcon size={16} /></MagnetButton>
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
              <div className="section-tag">{t("services.includedTag")}</div>
              <h2 className="section-title">{t("services.includedTitle")}</h2>
            </div>
            <p className="section-sub">{t("services.includedSub")}</p>
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
            <h2>{t("services.finalCtaTitle")}</h2>
            <p>{t("services.finalCtaDesc")}</p>
            <div className="cta-row">
              <MagnetButton as="button" className="btn-primary">{t("common.requestQuote")} <ArrowIcon size={16} /></MagnetButton>
              <button className="btn-secondary">{t("common.callUs")}</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
