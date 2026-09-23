import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSEO from "../lib/useSEO";
import MagnetButton from "../components/MagnetButton";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { ArrowIcon } from "../lib/icons";

export default function VerifyEmail() {
  const { t } = useTranslation();
  useSEO({ title: t("auth.verifyingTitle"), path: "/verify-email" });
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useCustomerAuth();
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode/dev double-invoke would otherwise burn the single-use token
    ran.current = true;
    if (!token) { setStatus("error"); return; }
    verifyEmail(token).then(() => setStatus("success")).catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
