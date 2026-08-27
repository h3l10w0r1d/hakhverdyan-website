import { createContext, useContext, useEffect, useRef, useState } from "react";

const ProductQuickViewContext = createContext(null);
const HOVER_OPEN_DELAY = 650;

export function ProductQuickViewProvider({ children }) {
  const [product, setProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef(null);
  const openedViaHover = useRef(false);

  function openQuickView(p) {
    clearTimeout(hoverTimer.current);
    openedViaHover.current = false;
    setProduct(p);
    setOpen(true);
  }

  // Desktop hover-intent: only opens if the pointer lingers on the card, so
  // casually scanning the grid doesn't spawn a popup on every pass.
  function hoverIntent(p) {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      openedViaHover.current = true;
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

  // Scrolling moves new cards under a stationary cursor, which fires the same
  // hover events as a real hover — cancel any pending intent, and dismiss a
  // hover-opened popup outright (an explicit click-opened one stays put).
  useEffect(() => {
    function onScroll() {
      clearTimeout(hoverTimer.current);
      if (openedViaHover.current) setOpen(false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const value = { product, open, openQuickView, hoverIntent, cancelHoverIntent, closeQuickView };
  return <ProductQuickViewContext.Provider value={value}>{children}</ProductQuickViewContext.Provider>;
}

export function useProductQuickView() {
  const ctx = useContext(ProductQuickViewContext);
  if (!ctx) throw new Error("useProductQuickView must be used within a ProductQuickViewProvider");
  return ctx;
}
