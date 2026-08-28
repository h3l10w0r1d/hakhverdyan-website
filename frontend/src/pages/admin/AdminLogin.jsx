import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLogin() {
  const { login, isAuthenticated, loading } = useAdminAuth();
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
      setError(err.status === 401 ? "Invalid email or password." : "Couldn't sign in — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-screen">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <div className="admin-login-logo"><span className="dot"></span>HAKHVERDYAN</div>
        <h1>Admin sign in</h1>
        <label className="quote-field">
          <span>Email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus required />
        </label>
        <label className="quote-field">
          <span>Password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <div className="admin-login-error">{error}</div>}
        <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
