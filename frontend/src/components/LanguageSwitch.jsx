import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

const LANGS = [
  { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
  { code: "hy", label: "Հայերեն", short: "ՀԱՅ", flag: "🇦🇲" },
];

export default function LanguageSwitch({ className = "", align = "right" }) {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage?.startsWith("hy") ? "hy" : "en";
  const currentLang = LANGS.find(l => l.code === current) || LANGS[0];
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    gsap.set(menuRef.current, {
      opacity: 0, scale: 0.9, y: -8, pointerEvents: "none",
      transformOrigin: align === "right" ? "top right" : "top center",
    });
  }, [align]);

  useEffect(() => {
    gsap.to(menuRef.current, open
      ? { opacity: 1, scale: 1, y: 0, pointerEvents: "auto", duration: 0.32, ease: "back.out(1.7)" }
      : { opacity: 0, scale: 0.9, y: -8, pointerEvents: "none", duration: 0.2, ease: "power2.in" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = e => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function select(code) {
    if (code !== current) i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div className={"lang-switch " + className} ref={rootRef}>
      <button
        type="button"
        className={"lang-switch-trigger" + (open ? " open" : "")}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lang-flag">{currentLang.flag}</span>
        <span className="lang-code">{currentLang.short}</span>
        <svg className="lang-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className={"lang-switch-menu align-" + align} ref={menuRef} role="listbox">
        {LANGS.map(l => (
          <button
            key={l.code}
            type="button"
            role="option"
            aria-selected={current === l.code}
            className={"lang-option" + (current === l.code ? " active" : "")}
            onClick={() => select(l.code)}
          >
            <span className="lang-flag">{l.flag}</span>
            <span className="lang-option-label">{l.label}</span>
            {current === l.code && (
              <svg className="lang-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
