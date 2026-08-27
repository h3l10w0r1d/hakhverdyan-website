import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { submitQuote } from "../lib/api";

const CART_KEY = "hakhverdyan_quote_v1";
const QuoteCartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function QuoteCartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [flyEvent, setFlyEvent] = useState(null); // { fromRect } — consumed by the FAB for the fly-to-cart animation

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const totalCount = useMemo(() => items.reduce((a, i) => a + i.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((a, i) => a + i.qty * i.price, 0), [items]);

  function addItem(product, qty, fromRect) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { id: product.id, name: product.name, unit: product.unit, price: product.price, qty }];
    });
    if (fromRect) setFlyEvent({ fromRect, key: Date.now() });
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function sendQuote() {
    if (!items.length) {
      setToast("Add at least one product first.");
      return;
    }
    try {
      const payload = { items: items.map(i => ({ product_id: i.id, qty: i.qty })) };
      const result = await submitQuote(payload);
      setToast(`Quote request #${result.id} sent — we'll reply within 48h.`);
      setItems([]);
      setPanelOpen(false);
    } catch (err) {
      setToast("Couldn't send the request — please try again or call us.");
    }
  }

  const value = {
    items, totalCount, totalPrice,
    addItem, removeItem, sendQuote,
    panelOpen, setPanelOpen,
    toast, setToast,
    flyEvent, clearFlyEvent: () => setFlyEvent(null),
  };

  return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>;
}

export function useQuoteCart() {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error("useQuoteCart must be used within a QuoteCartProvider");
  return ctx;
}
