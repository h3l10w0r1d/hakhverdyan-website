import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import MagnetButton from "../components/MagnetButton";
import useSEO from "../lib/useSEO";
import { useQuoteCart } from "../context/QuoteCartContext";
import { ArrowIcon, CheckIcon } from "../lib/icons";
import { SERVICES_META } from "../lib/servicesData";

export default function ServiceDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setPanelOpen } = useQuoteCart();
  const finalCtaRef = useRef(null);

  const meta = SERVICES_META.find(s => s.slug === slug);
  const service = meta && {
    ...meta,
    title: t(`services.${meta.keyPrefix}Title`),
    lead: t(`services.${meta.keyPrefix}Lead`),
    intro: t(`services.${meta.keyPrefix}Intro`),
    outro: t(`services.${meta.keyPrefix}Outro`),
    items: [1, 2, 3, 4].map(n => ({
      title: t(`services.${meta.keyPrefix}Item${n}`),
      desc: t(`services.${meta.keyPrefix}Item${n}Desc`),
    })),
  };
  const others = meta ? SERVICES_META.filter(s => s.slug !== slug) : [];

  useSEO({
    title: service ? service.title : undefined,
    description: service ? service.lead : undefined,
    path: `/services/${slug}`,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    if (!service) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".article-back", { opacity: 0, y: 10, duration: 0.5 }, 0)
        .from(".article-hero .feature-num", { opacity: 0, y: 14, duration: 0.6 }, 0.1)
        .from(".article-hero h1", { opacity: 0, y: 20, duration: 0.8 }, 0.2)
        .from(".article-hero .sub", { opacity: 0, y: 16, duration: 0.7 }, 0.35)
        .from(".article-cover", { opacity: 0, scale: 0.97, duration: 0.8 }, 0.45)
        .from(".article-body .feature-list li", { opacity: 0, y: 14, duration: 0.5, stagger: 0.06 }, 0.65);
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
  }, [service]);

  if (!meta) {
    return (
      <section className="services-hero">
        <div className="services-hero-inner">
          <div className="section-tag">{t("services.tag")}</div>
          <h1>{t("services.notFoundTitle")}</h1>
          <MagnetButton as="button" className="btn-secondary" onClick={() => navigate("/services")} style={{ marginTop: 24 }}>
            {t("services.backToServices")}
          </MagnetButton>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="article-hero">
        <div className="article-hero-inner">
          <Link className="article-back" to="/services">
            <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}><ArrowIcon size={14} /></span> {t("services.backToServices")}
          </Link>
          <div className="feature-num">{service.num} / {String(SERVICES_META.length).padStart(2, "0")}</div>
          <h1>{service.title}</h1>
          <p className="sub" style={{ maxWidth: 640, marginBottom: 36 }}>{service.lead}</p>
          <img className="article-cover" src={service.image} alt={service.title} />
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="article-body">
            <p>{service.intro}</p>

            <ul className="feature-list feature-list-detailed">
              {service.items.map(item => (
                <li key={item.title}>
                  <span className="check"><CheckIcon size={13} /></span>
                  <div>
                    <div className="feature-list-item-title">{item.title}</div>
                    <p className="feature-list-item-desc">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p>{service.outro}</p>

            <div className="service-ask-cta">
              <span>{t("services.askAboutThis")}</span>
              <Link className="feature-more-link" to={`/contacts?service=${encodeURIComponent(service.title)}`}>
                {t("services.askAboutService")} <ArrowIcon size={15} />
              </Link>
            </div>
          </div>

          <div className="related-posts">
            <div className="section-tag">{t("services.otherServices")}</div>
            <div className="blog-grid" style={{ gridTemplateColumns: `repeat(${others.length}, 1fr)`, marginTop: 20 }}>
              {others.map(o => (
                <Link className="blog-card" to={`/services/${o.slug}`} key={o.slug}>
                  <div className="blog-thumb" style={{ height: 160 }}>
                    <img src={o.image} alt={t(`services.${o.keyPrefix}Title`)} loading="lazy" />
                  </div>
                  <h3 style={{ fontSize: 16 }}>{t(`services.${o.keyPrefix}Title`)}</h3>
                  <span className="blog-card-link">{t("services.learnMore")} <ArrowIcon size={15} /></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container article-cta">
          <div className="final-cta" id="finalCta" ref={finalCtaRef}>
            <h2>{t("services.finalCtaTitle")}</h2>
            <p>{t("services.finalCtaDesc")}</p>
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
