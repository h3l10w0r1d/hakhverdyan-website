import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import PhoneInput from "../components/PhoneInput";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { ArrowIcon } from "../lib/icons";

export default function Register() {
  const { t } = useTranslation();
  useSEO({ title: t("auth.registerTitle"), description: t("auth.registerSub"), path: "/register" });
  const { register, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/account", { replace: true });
  }, [isAuthenticated, navigate]);

  function updateField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone || null, password: form.password });
      navigate("/account");
    } catch (err) {
      setError(err.status === 409 ? t("auth.emailTaken") : t("auth.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="block auth-block">
      <div className="container">
        <div className="auth-wrap">
          <div className="auth-head">
            <div className="section-tag">{t("auth.tag")}</div>
            <h1>{t("auth.registerHeading")}</h1>
            <p className="sub">{t("auth.registerSub")}</p>
          </div>
          <form className="contact-form auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="name">{t("auth.name")}</label>
                <input id="name" type="text" required autoComplete="name" value={form.name} onChange={e => updateField("name", e.target.value)} />
              </div>
              <div className="form-field full">
                <label htmlFor="email">{t("auth.email")}</label>
                <input id="email" type="email" required autoComplete="email" value={form.email} onChange={e => updateField("email", e.target.value)} />
              </div>
              <div className="form-field full">
                <label htmlFor="phone">{t("auth.phoneOptional")}</label>
                <PhoneInput id="phone" value={form.phone} onChange={v => updateField("phone", v)} />
              </div>
              <div className="form-field">
                <label htmlFor="password">{t("auth.password")}</label>
                <input
                  id="password" type="password" required autoComplete="new-password" minLength={8}
                  value={form.password} onChange={e => updateField("password", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="confirmPassword">{t("auth.confirmPassword")}</label>
                <input
                  id="confirmPassword" type="password" required autoComplete="new-password" minLength={8}
                  value={form.confirmPassword} onChange={e => updateField("confirmPassword", e.target.value)}
                />
              </div>
            </div>

            <MagnetButton as="button" type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? t("auth.creatingAccount") : t("auth.registerCta")} <ArrowIcon size={16} />
            </MagnetButton>

            {error && <div className="form-status error">{error}</div>}
          </form>
          <p className="auth-switch">{t("auth.haveAccount")} <Link to="/login">{t("auth.loginLink")}</Link></p>
        </div>
      </div>
    </section>
  );
}
