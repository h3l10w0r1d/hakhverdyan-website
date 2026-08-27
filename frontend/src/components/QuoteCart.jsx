import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useQuoteCart } from "../context/QuoteCartContext";
import { CartIcon, ArrowIcon, CheckIcon } from "../lib/icons";

const fmt = n => n.toLocaleString("en-US") + "֏";

export default function QuoteCart() {
  const { t } = useTranslation();
  const {
    items, totalCount, totalPrice, removeItem,
    panelOpen, setPanelOpen,
    step, goToForm, backToCart,
    form, updateForm, formErrors, submitting, submitBooking, finishBooking,
    confirmation,
    toast, flyEvent, clearFlyEvent,
  } = useQuoteCart();
  const fabRef = useRef(null);
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  const toastRef = useRef(null);
  const prevStep = useRef(step);

  useEffect(() => {
    gsap.set(panelRef.current, { opacity: 0, scale: 0.92, y: 12, transformOrigin: "bottom right", pointerEvents: "none" });
  }, []);

  useEffect(() => {
    gsap.to(panelRef.current, panelOpen
      ? { opacity: 1, scale: 1, y: 0, pointerEvents: "auto", duration: 0.35, ease: "back.out(1.6)" }
      : { opacity: 0, scale: 0.92, y: 12, pointerEvents: "none", duration: 0.25, ease: "power2.in" });
  }, [panelOpen]);

  // Smooth crossfade between the cart / details-form / success steps.
  useEffect(() => {
    if (!bodyRef.current) return;
    if (prevStep.current === step) return;
    prevStep.current = step;
    gsap.fromTo(bodyRef.current, { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.32, ease: "power3.out" });
  }, [step]);

  useEffect(() => {
    if (!toast) return;
    gsap.killTweensOf(toastRef.current);
    gsap.fromTo(toastRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" });
    const id = setTimeout(() => gsap.to(toastRef.current, { opacity: 0, y: 16, duration: 0.4, ease: "power2.in" }), 2900);
    return () => clearTimeout(id);
  }, [toast]);

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

  function onSubmit(e) {
    e.preventDefault();
    submitBooking();
  }

  const title = step === "cart" ? t("quoteCart.title") : step === "form" ? t("quoteCart.detailsTitle") : t("quoteCart.successTitle");

  return (
    <>
      <div className="quote-panel" id="quotePanel" ref={panelRef}>
        <div className="quote-panel-head">
          {step === "form" ? (
            <button className="quote-panel-back" aria-label={t("quoteCart.back")} onClick={backToCart}>
              <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}><ArrowIcon size={15} /></span>
            </button>
          ) : <span />}
          <h4>{title}</h4>
          <button aria-label="Close" onClick={() => setPanelOpen(false)}>&times;</button>
        </div>

        <div className="quote-panel-body" ref={bodyRef}>
          {step === "cart" && (
            <div className="quote-list">
              {items.length === 0 ? (
                <div className="quote-empty">{t("quoteCart.emptyLine1")}<br />{t("quoteCart.emptyLine2")}</div>
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
          )}

          {step === "form" && (
            <form className="quote-form" onSubmit={onSubmit}>
              <label className="quote-field">
                <span>{t("quoteCart.firstNameLabel")}</span>
                <input
                  type="text" value={form.name} placeholder={t("quoteCart.firstNamePlaceholder")}
                  onChange={e => updateForm("name", e.target.value)}
                  className={formErrors.name ? "has-error" : ""}
                />
                {formErrors.name && <em>{formErrors.name}</em>}
              </label>
              <label className="quote-field">
                <span>{t("quoteCart.emailLabel")}</span>
                <input
                  type="email" value={form.email} placeholder={t("quoteCart.emailPlaceholder")}
                  onChange={e => updateForm("email", e.target.value)}
                  className={formErrors.email ? "has-error" : ""}
                />
                {formErrors.email && <em>{formErrors.email}</em>}
              </label>
              <label className="quote-field">
                <span>{t("quoteCart.phoneLabel")}</span>
                <input
                  type="tel" value={form.phone} placeholder={t("quoteCart.phonePlaceholder")}
                  onChange={e => updateForm("phone", e.target.value)}
                  className={formErrors.phone ? "has-error" : ""}
                />
                {formErrors.phone && <em>{formErrors.phone}</em>}
              </label>
              <label className="quote-field">
                <span>{t("quoteCart.noteLabel")}</span>
                <textarea
                  rows={2} value={form.note} placeholder={t("quoteCart.notePlaceholder")}
                  onChange={e => updateForm("note", e.target.value)}
                />
              </label>
            </form>
          )}

          {step === "success" && confirmation && (
            <div className="quote-success">
              <div className="quote-success-icon"><CheckIcon size={22} /></div>
              <p className="quote-success-desc">{t("quoteCart.successDesc", { id: confirmation.id })}</p>
              {confirmation.confirmation_email && (
                <div className="email-preview">
                  <div className="email-preview-label">
                    {t("quoteCart.emailPreviewLabel", { email: confirmation.confirmation_email.to_email })}
                  </div>
                  <div className="email-preview-card">
                    <div className="email-preview-subject">{confirmation.confirmation_email.subject}</div>
                    <div className="email-preview-body">{confirmation.confirmation_email.body}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="quote-panel-foot">
          {step === "cart" && (
            <>
              <div className="total"><span>{t("quoteCart.estimatedTotal")}</span><span>{fmt(totalPrice)}</span></div>
              <button className="btn-primary" onClick={goToForm}>
                {t("quoteCart.continueBtn")} <ArrowIcon size={16} />
              </button>
            </>
          )}
          {step === "form" && (
            <button className="btn-primary" onClick={onSubmit} disabled={submitting}>
              {submitting ? t("quoteCart.submittingBtn") : <>{t("quoteCart.confirmBookingBtn")} <ArrowIcon size={16} /></>}
            </button>
          )}
          {step === "success" && (
            <button className="btn-primary" onClick={finishBooking}>{t("quoteCart.doneBtn")}</button>
          )}
        </div>
      </div>

      <button className="quote-fab" ref={fabRef} onClick={() => setPanelOpen(!panelOpen)}>
        <CartIcon />
        <span className="label">{t("quoteCart.label")}</span>
        <span className="badge" style={{ display: totalCount > 0 ? "flex" : "none" }}>{totalCount}</span>
      </button>

      <div className="toast" ref={toastRef} style={{ opacity: 0 }}>{toast}</div>
    </>
  );
}
