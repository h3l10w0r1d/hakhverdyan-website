import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = n => String(n).padStart(2, "0");
const toIso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = iso => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const stripTime = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const fmtLabel = iso => (iso ? fromIso(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");

function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const gridStart = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export default function DatePicker({ value, onChange, min, max, className = "" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [viewDate, setViewDate] = useState(() => stripTime(value ? fromIso(value) : new Date()));
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  function place() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ top: r.bottom + 6, left: r.left });
  }

  function toggle() {
    if (!open) {
      place();
      setViewDate(stripTime(value ? fromIso(value) : new Date()));
    }
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

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const grid = buildGrid(year, month);
  const minDate = min ? stripTime(fromIso(min)) : null;
  const maxDate = max ? stripTime(fromIso(max)) : null;
  const today = stripTime(new Date());

  function isDisabled(d) {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  }

  function selectDay(d) {
    if (isDisabled(d)) return;
    onChange(toIso(d));
    setOpen(false);
  }

  return (
    <div className={"adm-datepicker " + className} ref={rootRef}>
      <button type="button" ref={triggerRef} className={"adm-datepicker-trigger" + (open ? " open" : "")} onClick={toggle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span>{fmtLabel(value)}</span>
      </button>

      {createPortal(
        <div
          ref={menuRef}
          className={"adm-datepicker-menu" + (open ? " open" : "")}
          style={pos ? { top: pos.top, left: pos.left } : undefined}
        >
          <div className="adm-datepicker-head">
            <button type="button" className="adm-datepicker-nav" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Previous month">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <span className="adm-datepicker-title">{MONTH_NAMES[month]} {year}</span>
            <button type="button" className="adm-datepicker-nav" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label="Next month">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
          <div className="adm-datepicker-weekdays">
            {WEEKDAYS.map((w, i) => <span key={i}>{w}</span>)}
          </div>
          <div className="adm-datepicker-grid">
            {grid.map((d, i) => {
              const iso = toIso(d);
              return (
                <button
                  type="button" key={i}
                  className={
                    "adm-datepicker-day" +
                    (d.getMonth() === month ? "" : " outside") +
                    (iso === value ? " selected" : "") +
                    (iso === toIso(today) ? " today" : "") +
                    (isDisabled(d) ? " disabled" : "")
                  }
                  disabled={isDisabled(d)}
                  onClick={() => selectDay(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <div className="adm-datepicker-foot">
            <button type="button" className="adm-datepicker-today" disabled={isDisabled(today)} onClick={() => selectDay(today)}>
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
