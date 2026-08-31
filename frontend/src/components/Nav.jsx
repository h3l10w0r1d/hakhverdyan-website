import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MagnetButton from "./MagnetButton";
import LanguageSwitch from "./LanguageSwitch";
import { useQuoteCart } from "../context/QuoteCartContext";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { UserIcon } from "../lib/icons";

export default function Nav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { setPanelOpen } = useQuoteCart();
  const { isAuthenticated, customer } = useCustomerAuth();

  const LINKS = [
    { to: "/about", label: t("nav.about") },
    { to: "/catalog", label: t("nav.catalog") },
    { to: "/services", label: t("nav.services") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/contacts", label: t("nav.contacts") },
  ];

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header>
      <div className="nav-inner" id="navInner">
        <Link className="logo" to="/">
          <img className="logo-mark" src="/brand/logo-full.png" alt="Hakhverdyan Holding" width="55" height="46" />
        </Link>
        <nav>
          <ul>
            {LINKS.map(link => (
              <li key={link.to}>
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to={link.to}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-right">
          <LanguageSwitch />
          <Link className="nav-account-link" to={isAuthenticated ? "/account" : "/login"} aria-label={isAuthenticated ? customer?.name : t("nav.login")}>
            <UserIcon size={19} />
          </Link>
          <MagnetButton as="button" className="nav-cta" onClick={() => setPanelOpen(true)}>{t("nav.requestQuote")}</MagnetButton>
          <button className="nav-burger" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(o => !o)}>
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            )}
          </button>
        </div>
      </div>

      <div className={"mobile-menu" + (open ? " open" : "")} aria-hidden={!open} inert={!open}>
        {LINKS.map(link => (
          <NavLink key={link.to} className={({ isActive }) => "mobile-menu-link" + (isActive ? " active" : "")} to={link.to}>
            {link.label}
          </NavLink>
        ))}
        <NavLink className={({ isActive }) => "mobile-menu-link" + (isActive ? " active" : "")} to={isAuthenticated ? "/account" : "/login"}>
          {isAuthenticated ? customer?.name : t("nav.login")}
        </NavLink>
        <LanguageSwitch className="mobile-menu-lang" align="center" />
        <MagnetButton as="button" className="nav-cta mobile-menu-cta" onClick={() => setPanelOpen(true)}>{t("nav.requestQuote")}</MagnetButton>
      </div>
    </header>
  );
}
