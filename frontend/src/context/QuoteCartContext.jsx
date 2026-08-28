import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { submitQuote } from "../lib/api";
import { loadSavedContact, saveContact } from "../lib/userPrefs";

const CART_KEY = "hakhverdyan_quote_v1";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QuoteCartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadForm() {
  const saved = loadSavedContact();
  return { name: saved?.name || "", email: saved?.email || "", phone: saved?.phone || "", note: "" };
}

export function QuoteCartProvider({ children }) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState(loadCart);
  const [panelOpen, setPanelOpen] = useState(false);
  const [step, setStep] = useState("cart"); // 'cart' | 'form' | 'success'
  const [form, setForm] = useState(loadForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [toast, setToast] = useState(null);
  const [flyEvent, setFlyEvent] = useState(null); // { fromRect } — consumed by the FAB for the fly-to-cart animation

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
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

  function goToForm() {
    if (!items.length) {
      setToast(t("quoteCart.addFirstProduct"));
      return;
    }
    setStep("form");
  }

  function backToCart() {
    setStep("cart");
  }

  function updateForm(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setFormErrors(e => (e[field] ? { ...e, [field]: undefined } : e));
  }

  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = t("quoteCart.errRequired");
    if (!form.phone.trim()) errors.phone = t("quoteCart.errRequired");
    if (!form.email.trim()) errors.email = t("quoteCart.errRequired");
    else if (!EMAIL_RE.test(form.email.trim())) errors.email = t("quoteCart.errEmail");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submitBooking() {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        items: items.map(i => ({ product_id: i.id, qty: i.qty })),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        note: form.note.trim() || undefined,
        lang: i18n.resolvedLanguage,
      };
      const result = await submitQuote(payload);
      saveContact({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      setConfirmation(result);
      setItems([]);
      setStep("success");
    } catch {
      setToast(t("quoteCart.errorToast"));
    } finally {
      setSubmitting(false);
    }
  }

  function finishBooking() {
    setPanelOpen(false);
    setStep("cart");
    setForm(f => ({ ...f, note: "" }));
    setFormErrors({});
    setConfirmation(null);
  }

  const value = {
    items, totalCount, totalPrice,
    addItem, removeItem,
    panelOpen, setPanelOpen,
    step, goToForm, backToCart,
    form, updateForm, formErrors, submitting, submitBooking, finishBooking,
    confirmation,
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
