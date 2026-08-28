import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { COUNTRIES, DEFAULT_COUNTRY_CODE, flagEmoji } from "../lib/countries";

export default function CountrySelect({ value, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  function place() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ top: r.bottom + 6, left: r.left, width: Math.max(280, r.width) });
  }

  function toggle() {
    if (!open) { place(); setQuery(""); }
    setOpen(o => !o);
  }

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onDocClick(e) {
      if (rootRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    function onReflow() { place(); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [open]);

  const current = COUNTRIES.find(c => c.code === value) || COUNTRIES.find(c => c.code === DEFAULT_COUNTRY_CODE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase() === q
    );
  }, [query]);

  return (
    <div className="country-select" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={"phone-country-trigger" + (open ? " open" : "")}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("countrySelect.label")}
      >
        <span className="flag">{flagEmoji(current.code)}</span>
        <span className="dial">{current.dial}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {createPortal(
        <div
          ref={menuRef}
          className={"country-select-menu" + (open ? " open" : "")}
          style={pos ? { top: pos.top, left: pos.left, width: pos.width } : undefined}
        >
          <div className="country-select-search">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t("countrySelect.searchPlaceholder")}
            />
          </div>
          <div className="country-select-list" role="listbox">
            {filtered.length === 0 && <div className="country-select-empty">{t("countrySelect.noMatches")}</div>}
            {filtered.map(c => (
              <button
                type="button"
                key={c.code}
                role="option"
                aria-selected={c.code === current.code}
                className={"country-select-option" + (c.code === current.code ? " active" : "")}
                onClick={() => { onChange(c.code); setOpen(false); }}
              >
                <span className="flag">{flagEmoji(c.code)}</span>
                <span className="name">{c.name}</span>
                <span className="dial">{c.dial}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
