import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReveal from "../lib/useReveal";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import CountUp from "../components/CountUp";
import FeaturedProducts from "../components/FeaturedProducts";
import PARTNER_LOGOS from "../lib/partnerLogos";
import {
  ArrowIcon, CheckIcon, StarIcon, GlobeIcon, WrenchIcon, ClockIcon,
} from "../lib/icons";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useSEO({ title: t("seo.home.title"), description: t("seo.home.description"), path: "/" });
  const heroVisualRef = useRef(null);
  const finalCtaRef = useRef(null);

  const CATEGORIES = [
    { cat: "profiles", title: t("home.cat1Title"), desc: t("home.cat1Desc"),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 4h16v6H10v10H4V4z" /></svg> },
    { cat: "profiles", title: t("home.cat2Title"), desc: t("home.cat2Desc"),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2" /><line x1="9" y1="6" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="18" /></svg> },
    { cat: "hardware", title: t("home.cat3Title"), desc: t("home.cat3Desc"),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="3" width="12" height="18" rx="1" /><circle cx="13" cy="12" r="1.4" fill="currentColor" stroke="none" /></svg> },
    { cat: "doors", title: t("home.cat4Title"), desc: t("home.cat4Desc"),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="18" rx="1" /><rect x="13" y="3" width="8" height="18" rx="1" /></svg> },
  ];

  useReveal([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".headline .line span", { yPercent: 110, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".headline .line span", { yPercent: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.1)
        .from(".eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0)
        .from(".hero .sub", { opacity: 0, y: 18, duration: 0.8 }, 0.5)
        .from(".hero .cta-row > *", { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 }, 0.63)
        .from(".hero .stat", { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.75)
        .from(".hero-visual .panel", { opacity: 0, scale: 0.92, duration: 1.1, ease: "power3.out" }, 0.2)
        .from(".float-card, .badge-promo", { opacity: 0, scale: 0.8, duration: 0.7, stagger: 0.15, ease: "back.out(1.7)" }, 0.85);

      gsap.to(".card-stock", { y: -14, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".card-rating", { y: 12, duration: 3.1, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.3 });
      gsap.to(".badge-promo", { y: -10, rotate: 2, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.5 });
      gsap.to(".panel-glow", { x: 30, y: 20, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".scroll-cue .stick i", { top: "100%", duration: 1.4, ease: "power2.inOut", repeat: -1 });
      gsap.to("#marqueeTrack", { xPercent: -50, duration: 16, ease: "none", repeat: -1 });
      gsap.to("#promoMarquee", { xPercent: -50, duration: 18, ease: "none", repeat: -1 });

      gsap.to("#processFill", {
        width: "100%", ease: "none",
        scrollTrigger: { trigger: ".process-wrap", start: "top 75%", end: "bottom 60%", scrub: true },
      });
      gsap.utils.toArray(".process-step").forEach(step =>
        ScrollTrigger.create({ trigger: step, start: "top 70%", onEnter: () => step.classList.add("active") })
      );
    });

    function onMouseMove(e) {
      const relX = (e.clientX / window.innerWidth - 0.5) * 14;
      const relY = (e.clientY / window.innerHeight - 0.5) * 14;
      gsap.to(heroVisualRef.current, { rotateY: relX, rotateX: -relY, duration: 0.8, ease: "power2.out", transformPerspective: 900 });
    }
    window.addEventListener("mousemove", onMouseMove);

    const catCards = gsap.utils.toArray(".cat-card");
    const catCardHandlers = catCards.map(card => {
      const onMove = e => {
        const r = card.getBoundingClientRect();
        const relX = (e.clientX - r.left - r.width / 2) / r.width;
        const relY = (e.clientY - r.top - r.height / 2) / r.height;
        gsap.to(card, { rotateY: relX * 8, rotateX: -relY * 8, duration: 0.4, ease: "power2.out", transformPerspective: 700 });
      };
      const onLeave = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
      const onClick = () => {
        const cat = card.dataset.cat;
        navigate(cat ? `/catalog?cat=${cat}` : "/catalog");
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("click", onClick);
      return { card, onMove, onLeave, onClick };
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
      window.removeEventListener("mousemove", onMouseMove);
      catCardHandlers.forEach(({ card, onMove, onLeave, onClick }) => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("click", onClick);
      });
      finalCtaRef.current?.removeEventListener("mousemove", onCtaMove);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pip">{t("home.eyebrowPip")}</span> {t("home.eyebrow")}</div>
            <h1 className="headline">
              <span className="line"><span>{t("home.headlineLine1")}</span></span>
              <span className="line"><span className="accent">{t("home.headlineAccent")}</span><span>{t("home.headlineLine2Rest")}</span></span>
              <span className="line"><span>{t("home.headlineLine3")}</span></span>
            </h1>
            <p className="sub">{t("home.sub")}</p>
            <div className="cta-row">
              <MagnetButton as="button" className="btn-primary">{t("home.getFreeQuote")} <ArrowIcon size={16} /></MagnetButton>
              <button className="btn-secondary" onClick={() => navigate("/catalog")}>{t("home.browseCatalog")}</button>
            </div>
            <div className="stats-row">
              <div className="stat"><CountUp target={500} suffix="+" /><div className="label">{t("home.statProjects")}</div></div>
              <div className="stat"><CountUp target={15} suffix="+" /><div className="label">{t("home.statYears")}</div></div>
              <div className="stat"><CountUp target={48} suffix="h" /><div className="label">{t("home.statTurnaround")}</div></div>
            </div>
          </div>

          <div className="hero-visual" ref={heroVisualRef}>
            <div className="panel">
              <div className="panel-grid"></div>
              <div className="panel-glow"></div>
              <div className="panel-frame"><span></span><span></span><span></span><span></span></div>
            </div>
            <div className="float-card card-stock">
              <div className="ic"><CheckIcon size={18} /></div>
              <div><div className="txt-title">{t("home.inStock")}</div><div className="txt-sub">{t("home.inStockItem")}</div></div>
            </div>
            <div className="float-card card-rating">
              <div className="ic"><StarIcon size={18} /></div>
              <div><div className="txt-title">{t("home.rating")}</div><div className="txt-sub">{t("home.ratingSub")}</div></div>
            </div>
            <div className="badge-promo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20M2 12h20" /></svg>
              {t("home.promoBadge")}
            </div>
          </div>
        </div>
        <div className="scroll-cue"><span>{t("home.scroll")}</span><div className="stick"><i></i></div></div>
      </section>

      <section className="marquee-section">
        <div className="marquee-label">{t("home.marqueeLabel")}</div>
        <div className="marquee-mask">
          <div className="marquee-track logo-track" id="marqueeTrack">
            {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((p, i) => (
              <div className="logo-chip" key={p.name + i}>
                <img src={p.src} alt={p.name} loading={i < PARTNER_LOGOS.length ? "eager" : "lazy"} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="why">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("home.whyTag")}</div>
              <h2 className="section-title">{t("home.whyTitle")}</h2>
            </div>
            <p className="section-sub">{t("home.whySub")}</p>
          </div>
          <div className="why-grid">
            <div className="why-card reveal">
              <div className="why-ic">֏</div>
              <h3>{t("home.why1Title")}</h3>
              <p>{t("home.why1Desc")}</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><GlobeIcon /></div>
              <h3>{t("home.why2Title")}</h3>
              <p>{t("home.why2Desc")}</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><WrenchIcon /></div>
              <h3>{t("home.why3Title")}</h3>
              <p>{t("home.why3Desc")}</p>
            </div>
            <div className="why-card reveal">
              <div className="why-ic"><ClockIcon /></div>
              <h3>{t("home.why4Title")}</h3>
              <p>{t("home.why4Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="catalog" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("home.catalogTag")}</div>
              <h2 className="section-title">{t("home.catalogTitle")}</h2>
            </div>
            <button className="view-all-link" onClick={() => navigate("/catalog")}>
              {t("home.browseFullCatalog")} <ArrowIcon size={16} />
            </button>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map(c => (
              <div className="cat-card reveal" data-cat={c.cat} key={c.title}>
                <div className="cat-glow"></div>
                <div className="cat-top"><div className="cat-ic">{c.icon}</div></div>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <span className="cat-link">{t("common.viewCatalog")} <ArrowIcon /></span>
                </div>
              </div>
            ))}

            <div className="cat-card wide reveal" data-cat="sheets">
              <div className="cat-glow"></div>
              <div className="cat-top">
                <div className="cat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 8l8-4 8 4-8 4-8-4z" /><path d="M4 12l8 4 8-4" /><path d="M4 16l8 4 8-4" /></svg></div>
                <span className="cat-tag">{t("home.absTag")}</span>
              </div>
              <div>
                <h3>{t("home.absTitle")}</h3>
                <p>{t("home.absDesc")}</p>
                <span className="cat-link">{t("home.claimPrice")} <ArrowIcon /></span>
              </div>
            </div>

            <div className="cat-card reveal" data-cat="sheets">
              <div className="cat-glow"></div>
              <div className="cat-top"><div className="cat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 15l6-6 4 4 8-8" /></svg></div></div>
              <div>
                <h3>{t("home.steelTitle")}</h3>
                <p>{t("home.steelDesc")}</p>
                <span className="cat-link">{t("common.viewCatalog")} <ArrowIcon /></span>
              </div>
            </div>

            <div className="cat-card reveal" data-cat="doors">
              <div className="cat-glow"></div>
              <div className="cat-top"><div className="cat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14h18" /></svg></div></div>
              <div>
                <h3>{t("home.gateTitle")}</h3>
                <p>{t("home.gateDesc")}</p>
                <span className="cat-link">{t("common.viewCatalog")} <ArrowIcon /></span>
              </div>
            </div>

            <div className="cat-card reveal" data-cat="facades">
              <div className="cat-glow"></div>
              <div className="cat-top"><div className="cat-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M4 9h16M4 15h16M12 2v20" /></svg></div></div>
              <div>
                <h3>{t("home.facadeTitle")}</h3>
                <p>{t("home.facadeDesc")}</p>
                <span className="cat-link">{t("common.viewCatalog")} <ArrowIcon /></span>
              </div>
            </div>

            <div className="cat-card light span3 center reveal" data-cat="">
              <div>
                <h3>{t("home.seeFullCatalog")}</h3>
                <p>{t("home.seeFullCatalogDesc")}</p>
                <span className="cat-link">{t("home.openCatalog")} <ArrowIcon /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="products" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("home.productsTag")}</div>
              <h2 className="section-title">{t("home.productsTitle")}</h2>
            </div>
            <p className="section-sub">{t("home.productsSub")}</p>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="promo reveal">
            <div className="promo-marquee" aria-hidden="true">
              <div className="promo-marquee-track" id="promoMarquee">
                <span>{t("home.limitedStock")} · {t("home.limitedStock")} · {t("home.limitedStock")} ·</span>
                <span>{t("home.limitedStock")} · {t("home.limitedStock")} · {t("home.limitedStock")} ·</span>
              </div>
            </div>
            <div className="promo-content">
              <div className="promo-badge">{t("home.limitedOffer")}</div>
              <h3>{t("home.promoTitle")}</h3>
              <p>{t("home.promoDesc")}</p>
            </div>
            <div className="promo-price">
              <div className="old">3,000֏/m²</div>
              <div className="new">2,400<small>֏/m²</small></div>
              <MagnetButton as="button" className="btn-primary" onClick={() => navigate("/catalog?cat=sheets")}>
                {t("home.claimPrice")} <ArrowIcon size={16} />
              </MagnetButton>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="process">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("home.processTag")}</div>
              <h2 className="section-title">{t("home.processTitle")}</h2>
            </div>
            <p className="section-sub">{t("home.processSub")}</p>
          </div>
          <div className="process-wrap">
            <div className="process-line"><div className="process-line-fill" id="processFill"></div></div>
            <div className="process-grid">
              <div className="process-step reveal"><div className="process-num">01</div><h4>{t("home.process1Title")}</h4><p>{t("home.process1Desc")}</p></div>
              <div className="process-step reveal"><div className="process-num">02</div><h4>{t("home.process2Title")}</h4><p>{t("home.process2Desc")}</p></div>
              <div className="process-step reveal"><div className="process-num">03</div><h4>{t("home.process3Title")}</h4><p>{t("home.process3Desc")}</p></div>
              <div className="process-step reveal"><div className="process-num">04</div><h4>{t("home.process4Title")}</h4><p>{t("home.process4Desc")}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="services">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("home.servicesTag")}</div>
              <h2 className="section-title">{t("home.servicesTitle")}</h2>
            </div>
            <button className="view-all-link" onClick={() => navigate("/services")}>
              {t("home.seeAllServices")} <ArrowIcon size={16} />
            </button>
          </div>
          <div className="services-grid">
            <div className="service-card reveal" onClick={() => navigate("/services")} style={{ cursor: "pointer" }}>
              <div className="service-num">01</div>
              <h3>{t("home.svc1Title")}</h3>
              <p>{t("home.svc1Desc")}</p>
              <span className="service-link">{t("common.learnMore")} <ArrowIcon /></span>
            </div>
            <div className="service-card reveal" onClick={() => navigate("/services")} style={{ cursor: "pointer" }}>
              <div className="service-num">02</div>
              <h3>{t("home.svc2Title")}</h3>
              <p>{t("home.svc2Desc")}</p>
              <span className="service-link">{t("common.learnMore")} <ArrowIcon /></span>
            </div>
            <div className="service-card reveal" onClick={() => navigate("/services")} style={{ cursor: "pointer" }}>
              <div className="service-num">03</div>
              <h3>{t("home.svc3Title")}</h3>
              <p>{t("home.svc3Desc")}</p>
              <span className="service-link">{t("common.learnMore")} <ArrowIcon /></span>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="testimonials">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("home.testimonialsTag")}</div>
              <h2 className="section-title">{t("home.testimonialsTitle")}</h2>
            </div>
            <p className="section-sub">{t("home.testimonialsSub")}</p>
          </div>
          <div className="testi-grid">
            <div className="testi-card reveal">
              <div className="testi-stars">★★★★★</div>
              <p>{t("home.testi1")}</p>
              <div className="testi-who"><div className="testi-avatar">A.G.</div><div><div className="testi-name">A. G.</div><div className="testi-role">{t("home.testi1Role")}</div></div></div>
            </div>
            <div className="testi-card reveal">
              <div className="testi-stars">★★★★★</div>
              <p>{t("home.testi2")}</p>
              <div className="testi-who"><div className="testi-avatar">V.M.</div><div><div className="testi-name">V. M.</div><div className="testi-role">{t("home.testi2Role")}</div></div></div>
            </div>
            <div className="testi-card reveal">
              <div className="testi-stars">★★★★★</div>
              <p>{t("home.testi3")}</p>
              <div className="testi-who"><div className="testi-avatar">S.H.</div><div><div className="testi-name">S. H.</div><div className="testi-role">{t("home.testi3Role")}</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="final-cta reveal" id="finalCta" ref={finalCtaRef}>
            <h2>{t("home.finalCtaTitle")}</h2>
            <p>{t("home.finalCtaDesc")}</p>
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
