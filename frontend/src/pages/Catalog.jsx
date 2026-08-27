import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import useReveal from "../lib/useReveal";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../lib/api";
import { localized } from "../lib/localized";
import { ArrowIcon, SearchIcon, GlobeIcon, WrenchIcon, ClockIcon } from "../lib/icons";

export default function Catalog() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  useSEO({ title: t("seo.catalog.title"), description: t("seo.catalog.description"), path: "/catalog" });
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("cat") || "all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const finalCtaRef = useRef(null);

  const TABS = [
    { key: "all", label: t("catalog.tabAll") },
    { key: "profiles", label: t("catalog.tabProfiles") },
    { key: "hardware", label: t("catalog.tabHardware") },
    { key: "sheets", label: t("catalog.tabSheets") },
    { key: "doors", label: t("catalog.tabDoors") },
    { key: "facades", label: t("catalog.tabFacades") },
  ];

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat && TABS.some(t => t.key === cat)) setActiveTab(cat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function selectTab(key) {
    setActiveTab(key);
    setSearchParams(key === "all" ? {} : { cat: key });
  }

  const visible = useMemo(() => {
    let list = products;
    if (activeTab !== "all") list = list.filter(p => p.category === activeTab);
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      list = list.filter(p =>
        localized(p, "name", lang).toLowerCase().includes(needle) ||
        localized(p, "spec", lang).toLowerCase().includes(needle)
      );
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") sorted.sort((a, b) => localized(a, "name", lang).localeCompare(localized(b, "name", lang)));
    return sorted;
  }, [products, activeTab, search, sort, lang]);

  useReveal([loading]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".cat-hero .section-tag", { opacity: 0, y: 14, duration: 0.6 }, 0.1)
        .from(".cat-hero h1", { opacity: 0, y: 22, duration: 0.8 }, 0.2)
        .from(".cat-hero .sub", { opacity: 0, y: 16, duration: 0.7 }, 0.35)
        .from(".search-row", { opacity: 0, y: 16, duration: 0.7 }, 0.45)
        .from(".trust-strip .trust-item", { opacity: 0, y: 10, duration: 0.5, stagger: 0.06 }, 0.6);
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
      <section className="cat-hero">
        <div className="cat-hero-inner">
          <div className="section-tag">{t("catalog.tag")}</div>
          <h1>{t("catalog.title")}</h1>
          <p className="sub">{t("catalog.sub")}</p>

          <div className="search-row">
            <label className="search-box">
              <SearchIcon />
              <input
                type="text"
                placeholder={t("catalog.searchPlaceholder")}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </label>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">{t("catalog.sortFeatured")}</option>
              <option value="price-asc">{t("catalog.sortPriceAsc")}</option>
              <option value="price-desc">{t("catalog.sortPriceDesc")}</option>
              <option value="name-asc">{t("catalog.sortNameAsc")}</option>
            </select>
          </div>

          <div className="trust-strip">
            <div className="trust-item"><span className="ic">֏</span>{t("catalog.trustPricing")}</div>
            <div className="trust-item"><span className="ic"><GlobeIcon size={15} /></span>{t("catalog.trustEu")}</div>
            <div className="trust-item"><span className="ic"><WrenchIcon size={15} /></span>{t("catalog.trustInstall")}</div>
            <div className="trust-item"><span className="ic"><ClockIcon size={15} /></span>{t("catalog.trustQuotes")}</div>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="filter-bar">
            <div className="filter-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={"filter-tab" + (activeTab === tab.key ? " active" : "")}
                  onClick={() => selectTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="result-count">
              {loading ? t("common.loading") : t("catalog.productCount", { count: visible.length })}
            </div>
          </div>

          <div className="product-grid">
            {!loading && visible.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          {!loading && visible.length === 0 && (
            <div className="no-results">
              <h3>{t("catalog.noResultsTitle")}</h3>
              <p>{t("catalog.noResultsDesc")}</p>
            </div>
          )}
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="final-cta reveal" id="finalCta" ref={finalCtaRef}>
            <h2>{t("catalog.finalCtaTitle")}</h2>
            <p>{t("catalog.finalCtaDesc")}</p>
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
