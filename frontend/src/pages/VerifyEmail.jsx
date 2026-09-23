import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { ArrowIcon, MailIcon } from "../lib/icons";

export default function VerifyEmail() {
  const { t } = useTranslation();
  useSEO({ title: t("auth.verifyingTitle"), path: "/verify-email" });
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { customer, loading, isAuthenticated, verifyEmail, resendVerification } = useCustomerAuth();
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [resendStatus, setResendStatus] = useState(null); // null | 'sending' | 'sent' | 'error' | 'rate-limited'
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return; // StrictMode/dev double-invoke would otherwise burn the single-use token
    ran.current = true;
    verifyEmail(token).then(() => setStatus("success")).catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleResend() {
    setResendStatus("sending");
    try {
      await resendVerification();
      setResendStatus("sent");
    } catch (err) {
      setResendStatus(err.status === 429 ? "rate-limited" : "error");
    }
  }

  // No token in the URL: this isn't someone who clicked the emailed link —
  // it's the mandatory gate a logged-in-but-unverified customer lands on
  // whenever they try to reach their account or submit a quote.
  if (!token) {
    if (loading) return <section className="services-hero" />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (customer.email_verified) return <Navigate to="/account" replace />;
    return (
      <section className="services-hero verify-pending">
        <div className="services-hero-inner">
          <div className="verify-pending-icon"><MailIcon size={26} /></div>
          <div className="section-tag">{t("auth.tag")}</div>
          <h1>{t("auth.verifyPendingTitle")}</h1>
          <p className="sub">{t("auth.verifyPendingDesc", { email: customer.email })}</p>
          <div className="cta-row" style={{ marginTop: 8 }}>
            <MagnetButton as="button" className="btn-primary" onClick={handleResend} disabled={resendStatus === "sending"}>
              {resendStatus === "sending" ? t("auth.saving") : t("auth.resendVerification")}
            </MagnetButton>
          </div>
          {resendStatus === "sent" && <p className="verify-banner-status success">{t("auth.resendSent")}</p>}
          {resendStatus === "error" && <p className="verify-banner-status error">{t("auth.resendError")}</p>}
          {resendStatus === "rate-limited" && <p className="verify-banner-status error">{t("auth.resendRateLimited")}</p>}
        </div>
      </section>
    );
  }

  // Token present: this is someone who clicked the emailed link.
  return (
    <section className="services-hero">
      <div className="services-hero-inner">
        <div className="section-tag">{t("auth.tag")}</div>
        {status === "verifying" && <h1>{t("auth.verifyingTitle")}</h1>}
        {status === "success" && (
          <>
            <h1>{t("auth.verifySuccessTitle")}</h1>
            <p className="sub">{t("auth.verifySuccessDesc")}</p>
            <MagnetButton as={Link} to="/account" className="btn-primary" style={{ marginTop: 24 }}>
              {t("auth.goToAccount")} <ArrowIcon size={16} />
            </MagnetButton>
          </>
        )}
        {status === "error" && (
          <>
            <h1>{t("auth.verifyErrorTitle")}</h1>
            <p className="sub">{t("auth.verifyErrorDesc")}</p>
            <MagnetButton as={Link} to="/account" className="btn-secondary" style={{ marginTop: 24 }}>
              {t("auth.goToAccount")}
            </MagnetButton>
          </>
        )}
      </div>
    </section>
  );
}
