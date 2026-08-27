import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import MagnetButton from "./MagnetButton";

const LINKS = [
  { to: "/about", label: "About" },
  { to: "/catalog", label: "Catalog" },
  { to: "/services", label: "Services" },
  { to: "/blog", label: "Blog" },
  { to: "/contacts", label: "Contacts" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

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
          <span className="dot"></span>HAKHVERDYAN
        </Link>
        <nav>
          <ul>
            {LINKS.map(link => (
              <li key={link.label}>
                <NavLink className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} to={link.to}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-right">
          <MagnetButton as="button" className="nav-cta">Request Quote</MagnetButton>
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
            <NavLink key={link.label} className={({ isActive }) => "mobile-menu-link" + (isActive ? " active" : "")} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          <MagnetButton as="button" className="nav-cta mobile-menu-cta">Request Quote</MagnetButton>
        </div>
      )}
    </header>
  );
}
