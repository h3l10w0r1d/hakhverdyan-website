import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import useReveal from "../lib/useReveal";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import PhoneInput from "../components/PhoneInput";
import YandexMap from "../components/YandexMap";
import { submitContactMessage, fetchSettings, fetchLocations } from "../lib/api";
import { loadSavedContact, saveContact } from "../lib/userPrefs";
import { localized } from "../lib/localized";
import { ArrowIcon, PhoneIcon, ClockIcon, PinIcon, FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from "../lib/icons";

export default function Contacts() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  useSEO({ title: t("seo.contacts.title"), description: t("seo.contacts.description"), path: "/contacts" });
  useReveal([]);
  const [searchParams] = useSearchParams();

  const [settings, setSettings] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
    fetchLocations().then(setLocations).catch(() => {});
  }, []);

  const phone = settings?.phone || "+374 60 770 700";
  const phoneHref = "tel:" + phone.replace(/[^\d+]/g, "");
  const whatsappHref = "https://wa.me/" + (settings?.whatsapp || phone).replace(/[^\d]/g, "");
  const hoursWeekday = settings ? localized(settings, "hours_weekday", lang) : "";
  const hoursSaturday = settings ? localized(settings, "hours_saturday", lang) : "";
  const hoursValue = [hoursWeekday, hoursSaturday].filter(Boolean).join(", ");
  const locationsValue = locations.map(l => localized(l, "name", lang)).join(" & ");

  const [form, setForm] = useState(() => {
    const saved = loadSavedContact();
    const service = searchParams.get("service");
    const subject = searchParams.get("subject");
    const message = service
      ? t("contacts.serviceInquiryPrefill", { service })
      : subject === "careers"
        ? t("contacts.careersPrefill")
        : "";
    return { name: saved?.name || "", phone: saved?.phone || "", email: saved?.email || "", message };
  });
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".contacts-hero .section-tag", { opacity: 0, y: 14, duration: 0.6 }, 0.1)
        .from(".contacts-hero h1", { opacity: 0, y: 22, duration: 0.8 }, 0.2)
        .from(".contacts-hero .sub", { opacity: 0, y: 16, duration: 0.7 }, 0.35)
        .from(".contact-method", { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.5)
        .from(".contact-form", { opacity: 0, y: 20, duration: 0.7 }, 0.55);
    });
    return () => ctx.revert();
  }, []);

  function updateField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setStatus({ type: "error", text: t("contacts.errRequired") });
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setStatus({ type: "error", text: t("contacts.errContact") });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const result = await submitContactMessage(form);
      setStatus({ type: "success", text: t("contacts.successMsg", { id: result.id }) });
      saveContact({ name: form.name, phone: form.phone, email: form.email });
      setForm(f => ({ ...f, message: "" }));
    } catch (err) {
      setStatus({ type: "error", text: t("contacts.errSubmit") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="services-hero contacts-hero">
        <div className="services-hero-inner">
          <div className="section-tag">{t("contacts.tag")}</div>
          <h1>{t("contacts.title")}</h1>
          <p className="sub">{t("contacts.sub")}</p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="contact-grid">
            <div>
              <div className="contact-methods">
                <a className="contact-method reveal" href={phoneHref}>
                  <div className="ic"><PhoneIcon size={20} /></div>
                  <div><div className="label">{t("contacts.callUs")}</div><div className="value">{phone}</div></div>
                </a>
                <a className="contact-method reveal" href={whatsappHref} target="_blank" rel="noreferrer">
                  <div className="ic"><WhatsappIcon size={20} /></div>
                  <div><div className="label">{t("contacts.whatsapp")}</div><div className="value">{settings?.whatsapp || phone}</div></div>
                </a>
                <div className="contact-method reveal">
                  <div className="ic"><ClockIcon size={20} /></div>
                  <div><div className="label">{t("contacts.hours")}</div><div className="value">{hoursValue}</div></div>
                </div>
                <div className="contact-method reveal">
                  <div className="ic"><PinIcon size={20} /></div>
                  <div><div className="label">{t("contacts.locations")}</div><div className="value">{locationsValue}</div></div>
                </div>
              </div>

              <div className="footer-social">
                {settings?.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>}
                {settings?.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>}
                {settings?.tiktok_url && <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TiktokIcon /></a>}
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsappIcon /></a>
              </div>
            </div>

            <form className="contact-form reveal" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="name">{t("contacts.formName")}</label>
                  <input id="name" type="text" value={form.name} onChange={e => updateField("name", e.target.value)} placeholder={t("contacts.formNamePlaceholder")} />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">{t("contacts.formPhone")}</label>
                  <PhoneInput id="phone" value={form.phone} onChange={v => updateField("phone", v)} placeholder={t("contacts.formPhonePlaceholder")} />
                </div>
                <div className="form-field full">
                  <label htmlFor="email">{t("contacts.formEmail")}</label>
                  <input id="email" type="email" value={form.email} onChange={e => updateField("email", e.target.value)} placeholder={t("contacts.formEmailPlaceholder")} />
                </div>
                <div className="form-field full">
                  <label htmlFor="message">{t("contacts.formMessage")}</label>
                  <textarea id="message" rows="5" value={form.message} onChange={e => updateField("message", e.target.value)} placeholder={t("contacts.formMessagePlaceholder")} />
                </div>
              </div>

              <MagnetButton as="button" type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? t("contacts.sending") : t("contacts.sendMessage")} <ArrowIcon size={16} />
              </MagnetButton>
              <div className="form-note">{t("contacts.formNote")}</div>

              {status && <div className={"form-status " + status.type}>{status.text}</div>}
            </form>
          </div>
        </div>
      </section>

      <section className="block" id="locations" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">{t("contacts.locationsTag")}</div>
              <h2 className="section-title">{t("contacts.locationsTitle")}</h2>
            </div>
          </div>
          <div className="locations-grid">
            {locations.map(loc => (
              <div className="location-card reveal" key={loc.id}>
                <YandexMap lat={loc.lat} lng={loc.lng} label={localized(loc, "name", lang)} />
                <h3>{localized(loc, "name", lang)}</h3>
                <div className="addr">{localized(loc, "address", lang)}</div>
                <div className="meta">
                  <span>{hoursWeekday}</span>
                  <span>{hoursSaturday}</span>
                  <a href={phoneHref}>{phone}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
