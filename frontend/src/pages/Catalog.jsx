import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import gsap from "gsap";
import useReveal from "../lib/useReveal";
import MagnetButton from "../components/MagnetButton";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../lib/api";
import { ArrowIcon, SearchIcon, GlobeIcon, WrenchIcon, ClockIcon } from "../lib/icons";

const TABS = [
  { key: "all", label: "All" },
  { key: "profiles", label: "Profiles" },
  { key: "hardware", label: "Hardware" },
  { key: "sheets", label: "Sheets" },
  { key: "doors", label: "Doors & Gates" },
  { key: "facades", label: "Facades" },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("cat") || "all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const finalCtaRef = useRef(null);

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
      list = list.filter(p => p.name.toLowerCase().includes(needle) || p.spec.toLowerCase().includes(needle));
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, activeTab, search, sort]);

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
          <div className="section-tag">Catalog</div>
          <h1>Every profile, panel, and fitting we stock.</h1>
          <p className="sub">Search, filter, and add straight to your quote — same fixed pricing, same 48-hour turnaround.</p>

          <div className="search-row">
            <label className="search-box">
              <SearchIcon />
              <input
                type="text"
                placeholder='Search products — e.g. "aluminum", "handle", "ABS"'
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </label>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
            </select>
          </div>

          <div className="trust-strip">
            <div className="trust-item"><span className="ic">֏</span>Fixed pricing</div>
            <div className="trust-item"><span className="ic"><GlobeIcon size={15} /></span>EU-sourced</div>
            <div className="trust-item"><span className="ic"><WrenchIcon size={15} /></span>Full installation</div>
            <div className="trust-item"><span className="ic"><ClockIcon size={15} /></span>48h quotes</div>
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
              {loading ? "Loading…" : `${visible.length} product${visible.length === 1 ? "" : "s"}`}
            </div>
          </div>

          <div className="product-grid">
            {!loading && visible.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          {!loading && visible.length === 0 && (
            <div className="no-results">
              <h3>No products match that search.</h3>
              <p>Try a different keyword or clear the category filter.</p>
            </div>
          )}
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="final-cta reveal" id="finalCta" ref={finalCtaRef}>
            <h2>Can't find a spec you need?</h2>
            <p>Call +374&nbsp;60&nbsp;770&nbsp;700 or send your drawings — we source most items on request.</p>
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
