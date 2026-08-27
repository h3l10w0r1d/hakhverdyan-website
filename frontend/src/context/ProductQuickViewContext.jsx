import { createContext, useContext, useRef, useState } from "react";

const ProductQuickViewContext = createContext(null);
const HOVER_OPEN_DELAY = 380;

export function ProductQuickViewProvider({ children }) {
  const [product, setProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef(null);

  function openQuickView(p) {
    clearTimeout(hoverTimer.current);
    setProduct(p);
    setOpen(true);
  }

  // Desktop hover-intent: only opens if the pointer lingers on the card, so
  // casually scanning the grid doesn't spawn a popup on every pass.
  function hoverIntent(p) {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setProduct(p);
      setOpen(true);
    }, HOVER_OPEN_DELAY);
  }

  function cancelHoverIntent() {
    clearTimeout(hoverTimer.current);
  }

  function closeQuickView() {
    setOpen(false);
  }

  const value = { product, open, openQuickView, hoverIntent, cancelHoverIntent, closeQuickView };
  return <ProductQuickViewContext.Provider value={value}>{children}</ProductQuickViewContext.Provider>;
}

export function useProductQuickView() {
  const ctx = useContext(ProductQuickViewContext);
  if (!ctx) throw new Error("useProductQuickView must be used within a ProductQuickViewProvider");
  return ctx;
}
