import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuoteCart } from "../context/QuoteCartContext";
import { useProductQuickView } from "../context/ProductQuickViewContext";
import { PlusIcon } from "../lib/icons";
import { productPhoto } from "../lib/productPhotos";
import { localized } from "../lib/localized";

const fmt = n => n.toLocaleString("en-US") + "֏";
const INTERACTIVE_SELECTOR = ".qty-stepper, .add-quote-btn";

export default function ProductCard({ product, reveal = true }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const navigate = useNavigate();
  const { addItem } = useQuoteCart();
  const { hoverIntent, cancelHoverIntent } = useProductQuickView();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const thumbRef = useRef(null);

  function handleAdd() {
    const rect = thumbRef.current.getBoundingClientRect();
    addItem({ ...product, name: localized(product, "name", lang) }, qty, rect);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1100);
  }

  // A click opens the product's own page (real URL, shareable, indexable);
  // the hover-intent preview above still gives desktop users a fast peek
  // without leaving the grid.
  function handleCardClick(e) {
    if (e.target.closest(INTERACTIVE_SELECTOR)) return;
    navigate(`/catalog/${product.id}`);
  }

  const name = localized(product, "name", lang);
  const spec = localized(product, "spec", lang);
  const badge = localized(product, "badge", lang);

  return (
    <div
      className={"product-card" + (reveal ? " reveal" : "")}
      onClick={handleCardClick}
      onMouseEnter={() => hoverIntent(product)}
      onMouseLeave={cancelHoverIntent}
    >
      <div className="product-thumb" ref={thumbRef}>
        <img className="product-photo" src={product.image || productPhoto(product.icon)} alt={name} loading="lazy" />
        <span className={"product-badge" + (product.is_promo ? " is-promo" : "")}>{badge}</span>
      </div>
      <div className="product-name">{name}</div>
      <div className="product-spec">{spec}</div>
      <div className="product-price-row">
        {product.old_price && <span className="product-price-old">{fmt(product.old_price)}</span>}
        <span className="product-price">{fmt(product.price)}</span>
        <span className="product-unit">{product.unit}</span>
      </div>
      <div className="product-footer">
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
  );
}
