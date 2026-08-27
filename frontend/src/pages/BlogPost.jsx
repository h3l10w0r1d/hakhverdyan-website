import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import MagnetButton from "../components/MagnetButton";
import { fetchPost, fetchPosts } from "../lib/api";
import { localized } from "../lib/localized";
import { ArrowIcon } from "../lib/icons";

export default function BlogPost() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const fmtDate = iso => new Date(iso).toLocaleDateString(lang === "hy" ? "hy-AM" : "en-US", { month: "long", day: "numeric", year: "numeric" });

  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const finalCtaRef = useRef(null);

  useEffect(() => {
    setPost(null);
    setNotFound(false);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchPost(slug)
      .then(setPost)
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    fetchPosts({ category: post.category })
      .then(all => setRelated(all.filter(p => p.slug !== post.slug).slice(0, 2)))
      .catch(() => setRelated([]));
  }, [post]);

  useEffect(() => {
    if (!post) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".article-back", { opacity: 0, y: 10, duration: 0.5 }, 0)
        .from(".article-hero h1", { opacity: 0, y: 20, duration: 0.8 }, 0.1)
        .from(".article-meta-row", { opacity: 0, y: 14, duration: 0.6 }, 0.3)
        .from(".article-cover", { opacity: 0, scale: 0.97, duration: 0.8 }, 0.4)
        .from(".article-body p", { opacity: 0, y: 16, duration: 0.6, stagger: 0.06 }, 0.6);
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
  }, [post]);

  if (notFound) {
    return (
      <section className="services-hero">
        <div className="services-hero-inner">
          <div className="section-tag">{t("blog.tag")}</div>
          <h1>{t("blog.notFoundTitle")}</h1>
          <p className="sub">{t("blog.notFoundDesc")}</p>
          <MagnetButton as="button" className="btn-secondary" onClick={() => navigate("/blog")} style={{ marginTop: 24 }}>
            {t("blog.backToBlog")}
          </MagnetButton>
        </div>
      </section>
    );
  }

  if (!post) return <section className="services-hero" />;

  const title = localized(post, "title", lang);
  const category = localized(post, "category", lang);
  const content = localized(post, "content", lang);
  const paragraphs = content.split("\n\n");
  const wordDivisor = lang === "hy" ? 160 : 200; // Armenian reads a little slower word-for-word given longer average word length
  const minutes = Math.max(1, Math.round(content.split(/\s+/).length / wordDivisor));

  return (
    <>
      <section className="article-hero">
        <div className="article-hero-inner">
          <Link className="article-back" to="/blog">
            <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}><ArrowIcon size={14} /></span> {t("blog.backToBlog")}
          </Link>
          <h1>{title}</h1>
          <div className="article-meta-row">
            <span className="blog-category" style={{ position: "static", background: "var(--ink)" }}>{category}</span>
            <span>{fmtDate(post.published_at)}</span>
            <span className="dot" style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--grey-400)" }}></span>
            <span>{t("blog.minRead", { count: minutes })}</span>
          </div>
          <img className="article-cover" src={post.cover_url} alt={title} />
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="article-body">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {related.length > 0 && (
            <div className="related-posts">
              <div className="section-tag">{t("blog.moreOn", { category })}</div>
              <div className="blog-grid" style={{ gridTemplateColumns: `repeat(${related.length}, 1fr)`, marginTop: 20 }}>
                {related.map(r => (
                  <Link className="blog-card" to={`/blog/${r.slug}`} key={r.slug}>
                    <div className="blog-thumb" style={{ height: 160 }}>
                      <img src={r.cover_url} alt={localized(r, "title", lang)} loading="lazy" />
                      <span className="blog-category">{localized(r, "category", lang)}</span>
                    </div>
                    <h3 style={{ fontSize: 16 }}>{localized(r, "title", lang)}</h3>
                    <span className="blog-card-link">{t("common.readArticle")} <ArrowIcon size={15} /></span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="block">
        <div className="container article-cta">
          <div className="final-cta" id="finalCta" ref={finalCtaRef}>
            <h2>{t("blog.haveProject")}</h2>
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
