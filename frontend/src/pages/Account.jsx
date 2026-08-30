import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import PhoneInput from "../components/PhoneInput";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { customerMyQuotes } from "../lib/customerApi";
import { ArrowIcon } from "../lib/icons";

const fmtPrice = n => n.toLocaleString("en-US") + "֏";

export default function Account() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  useSEO({ title: t("auth.accountTitle"), description: t("auth.accountSub"), path: "/account" });
  const { customer, loading, updateProfile, logout } = useCustomerAuth();

  const fmtDate = iso => new Date(iso).toLocaleDateString(lang === "hy" ? "hy-AM" : "en-US", { month: "long", day: "numeric", year: "numeric" });
  const STATUS_LABELS = {
    new: t("auth.statusNew"),
    contacted: t("auth.statusContacted"),
    closed: t("auth.statusClosed"),
  };

  const [form, setForm] = useState({ name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(true);

  useEffect(() => {
    if (customer) setForm({ name: customer.name, phone: customer.phone || "" });
  }, [customer]);

  useEffect(() => {
    if (!customer) return;
    customerMyQuotes()
      .then(setQuotes)
      .catch(() => setQuotes([]))
      .finally(() => setQuotesLoading(false));
  }, [customer]);

  if (loading) return <section className="block auth-block" />;
  if (!customer) return <Navigate to="/login" replace />;

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileStatus(null);
    try {
      await updateProfile({ name: form.name, phone: form.phone });
      setProfileStatus({ type: "success", text: t("auth.profileSaved") });
    } catch {
      setProfileStatus({ type: "error", text: t("auth.genericError") });
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <section className="block auth-block">
      <div className="container">
        <div className="account-grid">
          <div>
            <div className="auth-head">
              <div className="section-tag">{t("auth.tag")}</div>
              <h1>{t("auth.accountHeading", { name: customer.name })}</h1>
              <p className="sub">{customer.email}</p>
            </div>

            <form className="contact-form auth-form" onSubmit={handleProfileSubmit}>
              <div className="form-row">
                <div className="form-field full">
                  <label htmlFor="name">{t("auth.name")}</label>
                  <input id="name" type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-field full">
                  <label htmlFor="phone">{t("auth.phoneOptional")}</label>
                  <PhoneInput id="phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
                </div>
              </div>
              <MagnetButton as="button" type="submit" className="btn-secondary" disabled={savingProfile}>
                {savingProfile ? t("auth.saving") : t("auth.saveProfile")}
              </MagnetButton>
              {profileStatus && <div className={"form-status " + profileStatus.type}>{profileStatus.text}</div>}
            </form>

            <button className="btn-secondary auth-logout" onClick={logout}>{t("auth.logout")}</button>
          </div>

          <div>
            <div className="auth-head">
              <h2 className="section-title">{t("auth.quotesHeading")}</h2>
              <p className="section-sub">{t("auth.quotesSub")}</p>
            </div>

            {quotesLoading ? (
              <div className="no-results"><p>{t("common.loading")}</p></div>
            ) : quotes.length === 0 ? (
              <div className="no-results">
                <h3>{t("auth.noQuotesTitle")}</h3>
                <p>{t("auth.noQuotesDesc")}</p>
              </div>
            ) : (
              <div className="account-quotes">
                {quotes.map(q => (
                  <div className="account-quote-card" key={q.id}>
                    <div className="account-quote-head">
                      <div>
                        <div className="account-quote-id">{t("auth.quoteNumber", { id: q.id })}</div>
                        <div className="account-quote-date">{fmtDate(q.created_at)}</div>
                      </div>
                      <span className={"quote-status-badge status-" + q.status}>{STATUS_LABELS[q.status] || q.status}</span>
                    </div>
                    <ul className="account-quote-items">
                      {q.items.map(item => (
                        <li key={item.product_id}>
                          <span>{item.qty} × {item.product_name}</span>
                          <span>{fmtPrice(item.price_at_time * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="account-quote-total">
                      <span>{t("auth.quoteTotal")}</span>
                      <strong>{fmtPrice(q.total)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
