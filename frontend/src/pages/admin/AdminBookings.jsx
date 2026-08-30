import { Fragment, useEffect, useState } from "react";
import { adminListQuotes, adminUpdateQuoteStatus, adminUpdateQuoteNote } from "../../lib/adminApi";
import Select from "../../components/admin/Select";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];
const STATUS_FILTER_OPTIONS = [{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS];
const fmt = n => n.toLocaleString("en-US") + "֏";
const fmtDate = iso => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminBookings() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  function load() {
    setLoading(true);
    adminListQuotes().then(setQuotes).finally(() => setLoading(false));
  }

  useEffect(load, []);

  const query = search.trim().toLowerCase();
  const filtered = quotes.filter(item => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (!query) return true;
    return item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query) || item.phone.toLowerCase().includes(query);
  });

  const open = quotes.find(q => q.id === openId) || null;

  function toggleOpen(q) {
    if (openId === q.id) { setOpenId(null); return; }
    setOpenId(q.id);
    setNoteDraft(q.admin_note || "");
  }

  async function changeStatus(id, status) {
    const updated = await adminUpdateQuoteStatus(id, status);
    setQuotes(qs => qs.map(q => (q.id === id ? updated : q)));
  }

  async function saveNote(id) {
    setSavingNote(true);
    try {
      const updated = await adminUpdateQuoteNote(id, noteDraft);
      setQuotes(qs => qs.map(q => (q.id === id ? updated : q)));
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div>
      <h1 className="admin-page-title">Bookings</h1>

      <div className="admin-search-row">
        <input
          type="text" className="admin-search-input" placeholder="Search by name, email, or phone…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <Select className="adm-select-sm" value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER_OPTIONS} />
        {(search || statusFilter !== "all") && <span className="admin-search-count">{filtered.length} of {quotes.length}</span>}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">{quotes.length === 0 ? "No booking requests yet." : "No bookings match your search."}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <Fragment key={q.id}>
                  <tr className="admin-table-row-clickable" onClick={() => toggleOpen(q)}>
                    <td>{fmtDate(q.created_at)}</td>
                    <td>
                      <div className="admin-table-title">{q.name}</div>
                      <div className="admin-table-sub">{q.email} · {q.phone}</div>
                    </td>
                    <td>{q.items.length} item{q.items.length !== 1 ? "s" : ""}</td>
                    <td>{fmt(q.total)}</td>
                    <td><span className={"admin-badge status-" + q.status}>{q.status}</span></td>
                    <td>{openId === q.id ? "▲" : "▼"}</td>
                  </tr>
                  {openId === q.id && (
                    <tr className="admin-table-detail-row" key={q.id + "-detail"}>
                      <td colSpan={6}>
                        <div className="admin-booking-detail">
                          <div className="admin-booking-items">
                            {q.items.map((it, i) => (
                              <div className="admin-booking-item" key={i}>
                                <span>{it.qty} × {it.product_name}</span>
                                <span>{fmt(it.price_at_time * it.qty)}</span>
                              </div>
                            ))}
                          </div>
                          {q.note && <div className="admin-booking-note"><strong>Customer note:</strong> {q.note}</div>}

                          <div className="admin-form-row">
                            <label className="quote-field">
                              <span>Status</span>
                              <Select value={q.status} onChange={v => changeStatus(q.id, v)} options={STATUS_OPTIONS} />
                            </label>
                          </div>

                          <label className="quote-field">
                            <span>Internal note</span>
                            <textarea rows={2} value={noteDraft} onChange={e => setNoteDraft(e.target.value)} />
                          </label>
                          <button className="admin-btn admin-btn-sm" disabled={savingNote} onClick={() => saveNote(q.id)}>
                            {savingNote ? "Saving…" : "Save note"}
                          </button>

                          {q.confirmation_email && (
                            <div className="email-preview" style={{ marginTop: 14 }}>
                              <div className="email-preview-label">Confirmation email sent</div>
                              <div className="email-preview-card">
                                <div className="email-preview-subject">{q.confirmation_email.subject}</div>
                                <div className="email-preview-body">{q.confirmation_email.body}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
