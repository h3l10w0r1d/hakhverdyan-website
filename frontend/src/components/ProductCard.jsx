import { useRef, useState } from "react";
import { useQuoteCart } from "../context/QuoteCartContext";
import { PlusIcon } from "../lib/icons";
import { productPhoto } from "../lib/productPhotos";

const fmt = n => n.toLocaleString("en-US") + "֏";

export default function ProductCard({ product, reveal = true }) {
  const { addItem } = useQuoteCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const thumbRef = useRef(null);

  function handleAdd() {
    const rect = thumbRef.current.getBoundingClientRect();
    addItem(product, qty, rect);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1100);
  }

  return (
    <div className={"product-card" + (reveal ? " reveal" : "")}>
      <div className="product-thumb" ref={thumbRef}>
        <img className="product-photo" src={productPhoto(product.icon)} alt={product.name} loading="lazy" />
        <span className={"product-badge" + (product.is_promo ? " promo" : "")}>{product.badge}</span>
      </div>
      <div className="product-name">{product.name}</div>
      <div className="product-spec">{product.spec}</div>
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
          {added ? "Added ✓" : (<><PlusIcon />Add to quote</>)}
        </button>
      </div>
    </div>
  );
}
