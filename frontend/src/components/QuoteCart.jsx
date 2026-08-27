import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useQuoteCart } from "../context/QuoteCartContext";
import { CartIcon, ArrowIcon } from "../lib/icons";

const fmt = n => n.toLocaleString("en-US") + "֏";

export default function QuoteCart() {
  const { items, totalCount, totalPrice, removeItem, sendQuote, panelOpen, setPanelOpen, toast, flyEvent, clearFlyEvent } = useQuoteCart();
  const fabRef = useRef(null);
  const panelRef = useRef(null);
  const toastRef = useRef(null);
  const mounted = useRef(false);

  // Initial panel state (hidden, ready to animate in)
  useEffect(() => {
    gsap.set(panelRef.current, { opacity: 0, scale: 0.92, y: 12, transformOrigin: "bottom right", pointerEvents: "none" });
  }, []);

  useEffect(() => {
    gsap.to(panelRef.current, panelOpen
      ? { opacity: 1, scale: 1, y: 0, pointerEvents: "auto", duration: 0.35, ease: "back.out(1.6)" }
      : { opacity: 0, scale: 0.92, y: 12, pointerEvents: "none", duration: 0.25, ease: "power2.in" });
  }, [panelOpen]);

  useEffect(() => {
    if (!toast) return;
    gsap.killTweensOf(toastRef.current);
    gsap.fromTo(toastRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" });
    const t = setTimeout(() => gsap.to(toastRef.current, { opacity: 0, y: 16, duration: 0.4, ease: "power2.in" }), 2900);
    return () => clearTimeout(t);
  }, [toast]);

  // Fly-to-cart dot animation, fired whenever a product is added
  useEffect(() => {
    if (!flyEvent || !fabRef.current) return;
    const r2 = fabRef.current.getBoundingClientRect();
    const dot = document.createElement("div");
    dot.style.cssText = `position:fixed; left:${flyEvent.fromRect.left + flyEvent.fromRect.width / 2}px; top:${flyEvent.fromRect.top + flyEvent.fromRect.height / 2}px; width:12px; height:12px; margin:-6px; border-radius:50%; background:var(--red); z-index:400; pointer-events:none;`;
    document.body.appendChild(dot);
    gsap.to(dot, {
      left: r2.left + r2.width / 2, top: r2.top + r2.height / 2, scale: 0.3, opacity: 0.5,
      duration: 0.65, ease: "power2.in",
      onComplete: () => {
        dot.remove();
        gsap.fromTo(fabRef.current, { scale: 1 }, { scale: 1.14, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" });
      },
    });
    clearFlyEvent();
  }, [flyEvent, clearFlyEvent]);

  return (
    <>
      <div className="quote-panel" id="quotePanel" ref={panelRef}>
        <div className="quote-panel-head">
          <h4>Your quote list</h4>
          <button aria-label="Close" onClick={() => setPanelOpen(false)}>&times;</button>
        </div>
        <div className="quote-list">
          {items.length === 0 ? (
            <div className="quote-empty">No products added yet.<br />Browse the catalog and add items to build your quote.</div>
          ) : (
            items.map(i => (
              <div className="quote-item" key={i.id}>
                <div style={{ flex: 1 }}>
                  <div className="qi-name">{i.name}</div>
                  <div className="qi-meta">{i.qty} × {fmt(i.price)} {i.unit}</div>
                </div>
                <button className="qi-remove" aria-label="Remove" onClick={() => removeItem(i.id)}>&times;</button>
              </div>
            ))
          )}
        </div>
        <div className="quote-panel-foot">
          <div className="total"><span>Estimated total</span><span>{fmt(totalPrice)}</span></div>
          <button className="btn-primary" onClick={sendQuote}>
            Send Quote Request <ArrowIcon size={16} />
          </button>
        </div>
      </div>

      <button className="quote-fab" ref={fabRef} onClick={() => setPanelOpen(!panelOpen)}>
        <CartIcon />
        <span className="label">Quote list</span>
        <span className="badge" style={{ display: totalCount > 0 ? "flex" : "none" }}>{totalCount}</span>
      </button>

      <div className="toast" ref={toastRef} style={{ opacity: 0 }}>{toast}</div>
    </>
  );
}
