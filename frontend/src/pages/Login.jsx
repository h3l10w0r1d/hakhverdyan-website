import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import AuthVisual from "../components/AuthVisual";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { ArrowIcon } from "../lib/icons";

export default function Login() {
  const { t } = useTranslation();
  useSEO({ title: t("auth.loginTitle"), description: t("auth.loginSub"), path: "/login" });
  const { login, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/account", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".auth-visual-photo", { scale: 1.1 });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".auth-visual-photo", { scale: 1, duration: 1.6, ease: "power2.out" }, 0)
        .from(".auth-visual-logo", { opacity: 0, y: -12, duration: 0.6 }, 0.1)
        .from(".auth-visual-copy > *", { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.25)
        .from(".auth-visual-stats", { opacity: 0, y: 14, duration: 0.6 }, 0.5)
        .from(".auth-panel > *", { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, 0.2);
    });
    return () => ctx.revert();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/account");
    } catch (err) {
      setError(err.status === 401 ? t("auth.invalidCredentials") : t("auth.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-split-page">
      <AuthVisual
        title={t("auth.visualLoginTitle")}
        sub={t("auth.visualLoginSub")}
        bullets={[t("auth.visualBullet1"), t("auth.visualBullet2"), t("auth.visualBullet3")]}
      />

      <div className="auth-form-col">
        <div className="auth-panel">
          <div className="auth-head">
            <div className="section-tag">{t("auth.tag")}</div>
            <h1>{t("auth.loginHeading")}</h1>
            <p className="sub">{t("auth.loginSub")}</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field full">
              <label htmlFor="email">{t("auth.email")}</label>
              <input
                id="email" type="email" required autoComplete="email"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="form-field full">
              <label htmlFor="password">{t("auth.password")}</label>
              <input
                id="password" type="password" required autoComplete="current-password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <MagnetButton as="button" type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? t("auth.loggingIn") : t("auth.loginCta")} <ArrowIcon size={16} />
            </MagnetButton>

            {error && <div className="form-status error">{error}</div>}
          </form>
          <p className="auth-switch">{t("auth.noAccount")} <Link to="/register">{t("auth.registerLink")}</Link></p>
        </div>
      </div>
    </section>
  );
}
