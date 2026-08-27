import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import useReveal from "../lib/useReveal";
import { fetchPosts } from "../lib/api";
import { localized } from "../lib/localized";
import { ArrowIcon } from "../lib/icons";

export default function Blog() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const fmtDate = iso => new Date(iso).toLocaleDateString(lang === "hy" ? "hy-AM" : "en-US", { month: "short", day: "numeric", year: "numeric" });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchPosts().then(setPosts).catch(() => setPosts([])).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(posts.map(p => p.category));
    return ["all", ...Array.from(set)];
  }, [posts]);

  const visible = activeTab === "all" ? posts : posts.filter(p => p.category === activeTab);

  useReveal([loading]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".services-hero .section-tag", { opacity: 0, y: 14, duration: 0.6 }, 0.1)
        .from(".services-hero h1", { opacity: 0, y: 22, duration: 0.8 }, 0.2)
        .from(".services-hero .sub", { opacity: 0, y: 16, duration: 0.7 }, 0.35);
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="services-hero">
        <div className="services-hero-inner">
          <div className="section-tag">{t("blog.tag")}</div>
          <h1>{t("blog.title")}</h1>
          <p className="sub">{t("blog.sub")}</p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 20 }}>
        <div className="container">
          {categories.length > 2 && (
            <div className="filter-tabs" style={{ marginBottom: 40 }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={"filter-tab" + (activeTab === cat ? " active" : "")}
                  onClick={() => setActiveTab(cat)}
                >
                  {cat === "all" ? t("blog.tabAll") : (lang === "hy" ? (posts.find(p => p.category === cat)?.category_hy || cat) : cat)}
                </button>
              ))}
            </div>
          )}

          <div className="blog-grid">
            {visible.map(post => (
              <Link className="blog-card reveal" to={`/blog/${post.slug}`} key={post.slug}>
                <div className="blog-thumb">
                  <img src={post.cover_url} alt={localized(post, "title", lang)} loading="lazy" />
                  <span className="blog-category">{localized(post, "category", lang)}</span>
                </div>
                <h3>{localized(post, "title", lang)}</h3>
                <p>{localized(post, "excerpt", lang)}</p>
                <div className="blog-meta">
                  <span>{fmtDate(post.published_at)}</span>
                </div>
                <span className="blog-card-link">{t("common.readArticle")} <ArrowIcon size={15} /></span>
              </Link>
            ))}
          </div>

          {!loading && !posts.length && (
            <div className="no-results">
              <h3>{t("blog.noPostsTitle")}</h3>
              <p>{t("blog.noPostsDesc")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
