import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import useReveal from "../lib/useReveal";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import ProductCard from "../components/ProductCard";
import Select from "../components/admin/Select";
import { fetchProducts, fetchCategories } from "../lib/api";
import { localized } from "../lib/localized";
import { useQuoteCart } from "../context/QuoteCartContext";
import { ArrowIcon, SearchIcon, GlobeIcon, WrenchIcon, ClockIcon, CategoryIcon, FilterIcon, CloseIcon } from "../lib/icons";

// Filters shared by both the category counts and the final product list — every
// facet except category itself, so a category's count reflects "how many would
// match if I also picked this category", the standard e-commerce facet behavior.
function applyCommonFilters(products, { search, priceMin, priceMax, onSaleOnly, lang }) {
  let list = products;
  if (search.trim()) {
    const needle = search.trim().toLowerCase();
    list = list.filter(p =>
      localized(p, "name", lang).toLowerCase().includes(needle) ||
      localized(p, "spec", lang).toLowerCase().includes(needle)
    );
  }
  if (priceMin !== "") list = list.filter(p => p.price >= Number(priceMin));
  if (priceMax !== "") list = list.filter(p => p.price <= Number(priceMax));
  if (onSaleOnly) list = list.filter(p => p.is_promo);
  return list;
}

function FilterPanel({
  t, lang, categories, categoryCounts, selectedCategories, toggleCategory,
  priceMin, priceMax, setPriceMin, setPriceMax, priceBounds, onSaleOnly, setOnSaleOnly,
  hasActiveFilters, onClear,
}) {
  return (
    <>
      <div className="filter-group">
        <h3 className="filter-group-title">{t("catalog.filterCategory")}</h3>
        <div className="filter-checklist">
          {categories.map(c => (
            <label className="filter-checkbox" key={c.id}>
              <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={() => toggleCategory(c.id)} />
              <CategoryIcon id={c.id} size={16} />
              <span>{localized(c, "label", lang)}</span>
              <span className="filter-count">{categoryCounts[c.id] || 0}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group-title">{t("catalog.filterPrice")}</h3>
        <div className="price-range-row">
          <input
            type="number" min="0" inputMode="numeric"
            placeholder={priceBounds ? String(priceBounds.min) : t("catalog.priceMin")}
            value={priceMin} onChange={e => setPriceMin(e.target.value)}
          />
          <span className="price-range-sep">–</span>
          <input
            type="number" min="0" inputMode="numeric"
            placeholder={priceBounds ? String(priceBounds.max) : t("catalog.priceMax")}
            value={priceMax} onChange={e => setPriceMax(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-checkbox">
          <input type="checkbox" checked={onSaleOnly} onChange={e => setOnSaleOnly(e.target.checked)} />
          <span>{t("catalog.filterOnSale")}</span>
        </label>
      </div>

      {hasActiveFilters && (
        <button type="button" className="filter-clear-btn" onClick={onClear}>{t("catalog.clearFilters")}</button>
      )}
    </>
  );
}

export default function Catalog() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const { setPanelOpen } = useQuoteCart();
  useSEO({ title: t("seo.catalog.title"), description: t("seo.catalog.description"), path: "/catalog" });
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cat = searchParams.get("cat");
    return cat ? cat.split(",").filter(Boolean) : [];
  });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const finalCtaRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setSearchParams(selectedCategories.length ? { cat: selectedCategories.join(",") } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setMobileFiltersOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function toggleCategory(id) {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setPriceMin("");
    setPriceMax("");
    setOnSaleOnly(false);
  }

  const priceBounds = useMemo(() => {
    if (!products.length) return null;
    const prices = products.map(p => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const commonFiltered = useMemo(
    () => applyCommonFilters(products, { search, priceMin, priceMax, onSaleOnly, lang }),
    [products, search, priceMin, priceMax, onSaleOnly, lang]
  );

  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach(c => { counts[c.id] = commonFiltered.filter(p => p.category === c.id).length; });
    return counts;
  }, [commonFiltered, categories]);

  const visible = useMemo(() => {
    let list = commonFiltered;
    if (selectedCategories.length) list = list.filter(p => selectedCategories.includes(p.category));
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") sorted.sort((a, b) => localized(a, "name", lang).localeCompare(localized(b, "name", lang)));
    return sorted;
  }, [commonFiltered, selectedCategories, sort, lang]);

  const hasActiveFilters = selectedCategories.length > 0 || priceMin !== "" || priceMax !== "" || onSaleOnly;
  const activeFilterCount = selectedCategories.length + (priceMin !== "" || priceMax !== "" ? 1 : 0) + (onSaleOnly ? 1 : 0);

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

  const filterPanelProps = {
    t, lang, categories, categoryCounts, selectedCategories, toggleCategory,
    priceMin, priceMax, setPriceMin, setPriceMax, priceBounds, onSaleOnly, setOnSaleOnly,
    hasActiveFilters, onClear: clearFilters,
  };

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
            <Select
              className="sort-select"
              value={sort}
              onChange={setSort}
              options={[
                { value: "default", label: t("catalog.sortFeatured") },
                { value: "price-asc", label: t("catalog.sortPriceAsc") },
                { value: "price-desc", label: t("catalog.sortPriceDesc") },
                { value: "name-asc", label: t("catalog.sortNameAsc") },
              ]}
            />
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
          <div className="catalog-layout">
            <aside className="catalog-sidebar">
              <FilterPanel {...filterPanelProps} />
            </aside>

            <div className="catalog-main">
              <div className="filter-bar">
                <button type="button" className="catalog-filters-toggle" onClick={() => setMobileFiltersOpen(true)}>
                  <FilterIcon size={16} /> {t("catalog.filtersBtn")}
                  {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
                </button>
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
          </div>
        </div>
      </section>

      <div className={"catalog-filters-backdrop" + (mobileFiltersOpen ? " open" : "")} onClick={() => setMobileFiltersOpen(false)}>
        <div className="catalog-filters-drawer" onClick={e => e.stopPropagation()}>
          <div className="catalog-filters-drawer-head">
            <h3>{t("catalog.filtersBtn")}</h3>
            <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label={t("common.close")}><CloseIcon size={18} /></button>
          </div>
          <div className="catalog-filters-drawer-body">
            <FilterPanel {...filterPanelProps} />
          </div>
          <div className="catalog-filters-drawer-foot">
            <button type="button" className="btn-primary" onClick={() => setMobileFiltersOpen(false)}>
              {t("catalog.showResults", { count: visible.length })}
            </button>
          </div>
        </div>
      </div>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="final-cta reveal" id="finalCta" ref={finalCtaRef}>
            <h2>{t("catalog.finalCtaTitle")}</h2>
            <p>{t("catalog.finalCtaDesc")}</p>
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
