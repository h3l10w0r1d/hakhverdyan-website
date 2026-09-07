import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useAdminT } from "../../context/AdminI18nContext";
import AdminLangSwitch from "../../components/admin/AdminLangSwitch";

export default function AdminLogin() {
  const { login, isAuthenticated, loading } = useAdminAuth();
  const { t } = useAdminT();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) return <Navigate to="/admin" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.status === 401 ? t("login.invalidCredentials") : t("login.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-screen">
      <AdminLangSwitch className="admin-login-lang" />
      <form className="admin-login-card" onSubmit={onSubmit}>
        <div className="admin-login-logo"><img src="/brand/logo-icon.png" alt="" />HAKHVERDYAN</div>
        <h1>{t("login.title")}</h1>
        <label className="quote-field">
          <span>{t("login.email")}</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus required />
        </label>
        <label className="quote-field">
          <span>{t("login.password")}</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <div className="admin-login-error">{error}</div>}
        <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
          {submitting ? t("login.signingIn") : t("login.signIn")}
        </button>
      </form>
    </div>
  );
}
