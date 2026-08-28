import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useProductQuickView } from "../context/ProductQuickViewContext";
import { useQuoteCart } from "../context/QuoteCartContext";
import { productPhotos } from "../lib/productPhotos";
import { localized } from "../lib/localized";
import { ArrowIcon, PlusIcon } from "../lib/icons";

const fmt = n => n.toLocaleString("en-US") + "֏";
const SWIPE_THRESHOLD = 40;

export default function ProductQuickView() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const { product, open, closeQuickView } = useProductQuickView();
  const { addItem } = useQuoteCart();
  const [slide, setSlide] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const mediaRef = useRef(null);
  const touchX = useRef(null);

  const isTouch = useMemo(
    () => typeof window !== "undefined" && !window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    []
  );

  useEffect(() => {
    setSlide(0);
    setQty(1);
    setAdded(false);
  }, [product]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!backdropRef.current || !cardRef.current) return;
    if (open) {
      gsap.to(backdropRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.28, ease: "power2.out" });
      gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.94, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.36, ease: "back.out(1.5)" });
    } else {
      gsap.to(backdropRef.current, { opacity: 0, pointerEvents: "none", duration: 0.22, ease: "power2.in" });
      gsap.to(cardRef.current, { opacity: 0, scale: 0.96, y: 10, duration: 0.2, ease: "power2.in" });
    }
  }, [open]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") closeQuickView(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeQuickView]);

  if (!product) return null;

  const photos = product.image ? [product.image, ...productPhotos(product.icon)] : productPhotos(product.icon);
  const name = localized(product, "name", lang);
  const spec = localized(product, "spec", lang);
  const badge = localized(product, "badge", lang);

  function handleAdd() {
    const rect = mediaRef.current.getBoundingClientRect();
    addItem({ ...product, name }, qty, rect);
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  }

  function prevSlide() { setSlide(s => (s - 1 + photos.length) % photos.length); }
  function nextSlide() { setSlide(s => (s + 1) % photos.length); }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > SWIPE_THRESHOLD) prevSlide();
    else if (dx < -SWIPE_THRESHOLD) nextSlide();
    touchX.current = null;
  }

  return (
    <div
      className="qv-backdrop" ref={backdropRef} style={{ opacity: 0, pointerEvents: "none" }}
      onClick={e => { if (e.target === backdropRef.current) closeQuickView(); }}
    >
      <div className="qv-card" ref={cardRef} style={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={name}>
        <button className={"qv-close" + (isTouch ? " is-back" : "")} onClick={closeQuickView} aria-label={t("quoteCart.back")}>
          {isTouch
            ? <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}><ArrowIcon size={16} /></span>
            : "×"}
        </button>

        <div className="qv-media" ref={mediaRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <img key={slide} className="qv-photo" src={photos[slide]} alt={name} />
          {badge && <span className={"product-badge" + (product.is_promo ? " promo" : "")}>{badge}</span>}
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

        <div className="qv-panel">
          <div className="qv-body">
            <div className="qv-name">{name}</div>
            <div className="qv-spec">{spec}</div>
            <div className="qv-trust">
              <span>{t("catalog.trustPricing")}</span>
              <span>{t("catalog.trustEu")}</span>
              <span>{t("catalog.trustInstall")}</span>
              <span>{t("catalog.trustQuotes")}</span>
            </div>
            <div className="product-price-row">
              {product.old_price && <span className="product-price-old">{fmt(product.old_price)}</span>}
              <span className="product-price">{fmt(product.price)}</span>
              <span className="product-unit">{product.unit}</span>
            </div>
          </div>

          <div className="qv-footer">
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
  );
}
