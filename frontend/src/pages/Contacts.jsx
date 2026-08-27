import { useEffect, useState } from "react";
import gsap from "gsap";
import useReveal from "../lib/useReveal";
import MagnetButton from "../components/MagnetButton";
import { submitContactMessage } from "../lib/api";
import { ArrowIcon, PhoneIcon, ClockIcon, PinIcon, FacebookIcon, InstagramIcon, WhatsappIcon } from "../lib/icons";

export default function Contacts() {
  useReveal([]);

  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
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
      setStatus({ type: "error", text: "Name and message are required." });
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setStatus({ type: "error", text: "Add a phone number or email so we can reply." });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const result = await submitContactMessage(form);
      setStatus({ type: "success", text: `Message received (#${result.id}) — we'll reply within 48h.` });
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", text: "Couldn't send that — please try again or call us directly." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="services-hero contacts-hero">
        <div className="services-hero-inner">
          <div className="section-tag">Contacts</div>
          <h1>Talk to a real person, not a ticket queue.</h1>
          <p className="sub">Call, message, or send your specs below — every request gets a reply within 48 hours, usually much sooner.</p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="contact-grid">
            <div>
              <div className="contact-methods">
                <a className="contact-method reveal" href="tel:+37460770700">
                  <div className="ic"><PhoneIcon size={20} /></div>
                  <div><div className="label">Call us</div><div className="value">+374 60 770 700</div></div>
                </a>
                <a className="contact-method reveal" href="https://wa.me/37460770700" target="_blank" rel="noreferrer">
                  <div className="ic"><WhatsappIcon size={20} /></div>
                  <div><div className="label">WhatsApp</div><div className="value">+374 60 770 700</div></div>
                </a>
                <div className="contact-method reveal">
                  <div className="ic"><ClockIcon size={20} /></div>
                  <div><div className="label">Hours</div><div className="value">Mon–Fri 9:00–18:00, Sat 9:00–16:00</div></div>
                </div>
                <div className="contact-method reveal">
                  <div className="ic"><PinIcon size={20} /></div>
                  <div><div className="label">Locations</div><div className="value">Griboedov 56 &amp; Tevosyan 7/11, Yerevan</div></div>
                </div>
              </div>

              <div className="footer-social">
                <a href="#" aria-label="Facebook"><FacebookIcon /></a>
                <a href="#" aria-label="Instagram"><InstagramIcon /></a>
                <a href="#" aria-label="WhatsApp"><WhatsappIcon /></a>
              </div>
            </div>

            <form className="contact-form reveal" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="name">Name *</label>
                  <input id="name" type="text" value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="Your name" />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" type="tel" value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+374 XX XXX XXX" />
                </div>
                <div className="form-field full">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="form-field full">
                  <label htmlFor="message">Message *</label>
                  <textarea id="message" rows="5" value={form.message} onChange={e => updateField("message", e.target.value)} placeholder="Tell us what you need — dimensions, quantities, timeline, anything that helps." />
                </div>
              </div>

              <MagnetButton as="button" type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Sending…" : "Send Message"} <ArrowIcon size={16} />
              </MagnetButton>
              <div className="form-note">* Phone or email required — that's how we'll reach you.</div>

              {status && <div className={"form-status " + status.type}>{status.text}</div>}
            </form>
          </div>
        </div>
      </section>

      <section className="block" id="locations" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Find us</div>
              <h2 className="section-title">Two locations, one team.</h2>
            </div>
          </div>
          <div className="locations-grid">
            {[
              { name: "Griboedov Location", addr: "Griboedov 56 st., Yerevan, Armenia" },
              { name: "Tevosyan Location", addr: "Tevosyan 7/11 st., Yerevan, Armenia" },
            ].map(loc => (
              <div className="location-card reveal" key={loc.name}>
                <div className="location-map">
                  <div className="location-map-grid"></div>
                  <span className="pin"><PinIcon /></span>
                </div>
                <h3>{loc.name}</h3>
                <div className="addr">{loc.addr}</div>
                <div className="meta">
                  <span>Mon–Fri 9:00–18:00</span>
                  <span>Sat 9:00–16:00</span>
                  <a href="tel:+37460770700">+374 60 770 700</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
