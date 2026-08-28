import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import MagnetButton from "./MagnetButton";
import LanguageSwitch from "./LanguageSwitch";

export default function Nav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const LINKS = [
    { to: "/about", label: t("nav.about") },
    { to: "/catalog", label: t("nav.catalog") },
    { to: "/services", label: t("nav.services") },
    { to: "/blog", label: t("nav.blog") },
    { to: "/contacts", label: t("nav.contacts") },
  ];

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!menuRef.current) return;
    if (open) {
      gsap.fromTo(menuRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
    }
  }, [open]);

  return (
    <header>
      <div className="nav-inner" id="navInner">
        <Link className="logo" to="/">
          <img className="logo-mark" src="/brand/logo-icon.png" alt="" width="20" height="28" />HAKHVERDYAN
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
          <MagnetButton as="button" className="nav-cta">{t("nav.requestQuote")}</MagnetButton>
          <button className="nav-burger" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(o => !o)}>
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu" ref={menuRef}>
          {LINKS.map(link => (
            <NavLink key={link.to} className={({ isActive }) => "mobile-menu-link" + (isActive ? " active" : "")} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          <LanguageSwitch className="mobile-menu-lang" align="center" />
          <MagnetButton as="button" className="nav-cta mobile-menu-cta">{t("nav.requestQuote")}</MagnetButton>
        </div>
      )}
    </header>
  );
}
