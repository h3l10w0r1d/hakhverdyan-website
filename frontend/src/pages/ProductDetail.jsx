import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import MagnetButton from "../components/MagnetButton";
import ProductCard from "../components/ProductCard";
import { fetchProduct, fetchProducts, fetchCategories } from "../lib/api";
import { localized } from "../lib/localized";
import { productPhotos } from "../lib/productPhotos";
import useSEO from "../lib/useSEO";
import useReveal from "../lib/useReveal";
import { useQuoteCart } from "../context/QuoteCartContext";
import { ArrowIcon, PlusIcon, GlobeIcon, WrenchIcon, ClockIcon } from "../lib/icons";

const fmt = n => n.toLocaleString("en-US") + "֏";

export default function ProductDetail() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPanelOpen, addItem } = useQuoteCart();

  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [categories, setCategories] = useState([]);
  const [related, setRelated] = useState([]);
  const [slide, setSlide] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const thumbRef = useRef(null);
  const finalCtaRef = useRef(null);

  useEffect(() => {
    setProduct(null);
    setNotFound(false);
    setSlide(0);
    setQty(1);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchProduct(id).then(setProduct).catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!product) return;
    fetchProducts({ category: product.category })
      .then(all => setRelated(all.filter(p => p.id !== product.id).slice(0, 3)))
      .catch(() => setRelated([]));
  }, [product]);

  useReveal([related]);

  useEffect(() => {
    if (!product) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".product-page-back", { opacity: 0, y: 10, duration: 0.5 }, 0)
        .from(".product-page-media", { opacity: 0, scale: 0.97, duration: 0.7 }, 0.1)
        .from(".product-page-info > *", { opacity: 0, y: 16, duration: 0.6, stagger: 0.07 }, 0.2);
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
  }, [product]);

  const name = product ? localized(product, "name", lang) : "";
  const spec = product ? localized(product, "spec", lang) : "";
  const badge = product ? localized(product, "badge", lang) : "";
  const description = product ? localized(product, "description", lang) : "";
  const category = categories.find(c => c.id === product?.category);
  const categoryLabel = category ? localized(category, "label", lang) : "";

  const seoTitle = product
    ? localized(product, "seo_title", lang) || `${name} — Hakhverdyan Shinmontazh`
    : undefined;
  const seoDescription = product
    ? localized(product, "seo_description", lang) || description || spec
    : undefined;
  useSEO({ title: seoTitle, description: seoDescription, path: `/catalog/${id}` });

  if (notFound) {
    return (
      <section className="services-hero">
        <div className="services-hero-inner">
          <div className="section-tag">{t("catalog.tag")}</div>
          <h1>{t("catalog.productNotFoundTitle")}</h1>
          <p className="sub">{t("catalog.productNotFoundDesc")}</p>
          <MagnetButton as="button" className="btn-secondary" onClick={() => navigate("/catalog")} style={{ marginTop: 24 }}>
            {t("catalog.backToCatalog")}
          </MagnetButton>
        </div>
      </section>
    );
  }

  if (!product) return <section className="services-hero" />;

  const photos = product.images && product.images.length > 0 ? product.images : productPhotos(product.icon);

  function handleAdd() {
    const rect = thumbRef.current.getBoundingClientRect();
    addItem({ ...product, name }, qty, rect);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1100);
  }

  function prevSlide() { setSlide(s => (s - 1 + photos.length) % photos.length); }
  function nextSlide() { setSlide(s => (s + 1) % photos.length); }

  return (
    <>
      <section className="block product-page" style={{ paddingTop: 150 }}>
        <div className="container">
          <Link className="article-back product-page-back" to="/catalog">
            <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}><ArrowIcon size={14} /></span> {t("catalog.backToCatalog")}
          </Link>

          <div className="product-page-grid">
            <div className="product-page-media" ref={thumbRef}>
              <img key={slide} className="product-page-photo" src={photos[slide]} alt={name} />
              {badge && <span className={"product-badge" + (product.is_promo ? " is-promo" : "")}>{badge}</span>}
              {photos.length > 1 && (
                <>
                  <button className="qv-nav prev" onClick={prevSlide} aria-label="Previous photo">
                    <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}><ArrowIcon size={15} /></span>
                  </button>
                  <button className="qv-nav next" onClick={nextSlide} aria-label="Next photo"><ArrowIcon size={15} /></button>
                  <div className="qv-dots">
                    {photos.map((_, i) => (
                      <button
                        key={i} className={"qv-dot" + (i === slide ? " active" : "")}
                        onClick={() => setSlide(i)} aria-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="product-page-info">
              {categoryLabel && <div className="section-tag">{categoryLabel}</div>}
              <h1>{name}</h1>
              <p className="product-page-spec">{spec}</p>
              {description && (
                <div className="product-page-description">
                  {description.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
                </div>
              )}
              <div className="trust-strip">
                <div className="trust-item"><span className="ic">֏</span>{t("catalog.trustPricing")}</div>
                <div className="trust-item"><span className="ic"><GlobeIcon size={15} /></span>{t("catalog.trustEu")}</div>
                <div className="trust-item"><span className="ic"><WrenchIcon size={15} /></span>{t("catalog.trustInstall")}</div>
                <div className="trust-item"><span className="ic"><ClockIcon size={15} /></span>{t("catalog.trustQuotes")}</div>
              </div>
              <div className="product-price-row">
                {product.old_price && <span className="product-price-old">{fmt(product.old_price)}</span>}
                <span className="product-price">{fmt(product.price)}</span>
                <span className="product-unit">{product.unit}</span>
              </div>
              <div className="product-page-footer">
                <div className="qty-stepper">
                  <button aria-label="Decrease" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button aria-label="Increase" onClick={() => setQty(q => Math.min(99, q + 1))}>+</button>
                </div>
                <button className={"add-quote-btn" + (added ? " added" : "")} onClick={handleAdd}>
                  {added ? t("common.added") : (<><PlusIcon />{t("common.addToQuote")}</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="block" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-tag">{t("catalog.moreLikeThis", { category: categoryLabel })}</div>
            <div className="product-grid" style={{ marginTop: 20 }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="block" style={{ paddingTop: related.length > 0 ? 0 : undefined }}>
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
