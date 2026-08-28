import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Select({ value, onChange, options, placeholder = "Select…", className = "" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  function place() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  }

  function toggle() {
    if (!open) place();
    setOpen(o => !o);
  }

  useEffect(() => {
    if (!open) return;
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

  const current = options.find(o => o.value === value);

  return (
    <div className={"adm-select " + className} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={"adm-select-trigger" + (open ? " open" : "")}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={current ? "" : "adm-select-placeholder"}>{current ? current.label : placeholder}</span>
        <svg className="adm-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {createPortal(
        <div
          ref={menuRef}
          className={"adm-select-menu" + (open ? " open" : "")}
          role="listbox"
          style={pos ? { top: pos.top, left: pos.left, width: pos.width } : undefined}
        >
          {options.map(o => (
            <button
              type="button"
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={"adm-select-option" + (o.value === value ? " active" : "")}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span>{o.label}</span>
              {o.value === value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
