import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGetCustomer } from "../../lib/adminApi";
import { ArrowIcon } from "../../lib/icons";

const fmt = n => n.toLocaleString("en-US") + "֏";
const fmtDate = iso => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    adminGetCustomer(id).then(setMember).catch(() => setError("Couldn't load this member.")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="admin-empty">Loading…</div>;
  if (error || !member) return <div className="admin-error-banner">{error || "Member not found."}</div>;

  const totalSpent = member.quotes.reduce((sum, q) => sum + q.total, 0);

  return (
    <div>
      <button type="button" className="ghost-back admin-editor-back" onClick={() => navigate("/admin/members")}>
        ← Members
      </button>

      <div className="admin-page-head" style={{ marginTop: 6 }}>
        <h1 className="admin-page-title">{member.name}</h1>
      </div>

      <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{member.bookings_count}</div>
          <div className="admin-stat-label">Bookings</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{fmt(totalSpent)}</div>
          <div className="admin-stat-label">Total booked value</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{member.messages_count}</div>
          <div className="admin-stat-label">Messages</div>
        </div>
      </div>

      <div className="admin-card admin-settings-card" style={{ marginBottom: 20 }}>
        <h2 className="admin-card-title">Profile</h2>
        <div className="admin-member-profile">
          <div><span className="admin-table-sub">Email</span><div>{member.email}</div></div>
          <div><span className="admin-table-sub">Phone</span><div>{member.phone || "—"}</div></div>
          <div><span className="admin-table-sub">Member since</span><div>{fmtDate(member.created_at)}</div></div>
        </div>
      </div>

      <div className="admin-card admin-settings-card" style={{ marginBottom: 20 }}>
        <h2 className="admin-card-title">Bookings ({member.quotes.length})</h2>
        {member.quotes.length === 0 ? (
          <div className="admin-empty">No bookings yet.</div>
        ) : (
          <div className="admin-member-list">
            {member.quotes.map(q => (
              <div key={q.id} className="admin-member-row">
                <div className="admin-member-row-head">
                  <span className="admin-table-title">Booking #{q.id}</span>
                  <span className={"admin-badge status-" + q.status}>{q.status}</span>
                  <span className="admin-table-sub">{fmtDate(q.created_at)}</span>
                </div>
                <div className="admin-booking-items">
                  {q.items.map((it, i) => (
                    <div className="admin-booking-item" key={i}>
                      <span>{it.qty} × {it.product_name}</span>
                      <span>{fmt(it.price_at_time * it.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="admin-member-row-total">Total: {fmt(q.total)}</div>
                {q.note && <div className="admin-booking-note"><strong>Note:</strong> {q.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">Messages ({member.messages.length})</h2>
        {member.messages.length === 0 ? (
          <div className="admin-empty">No messages yet.</div>
        ) : (
          <div className="admin-member-list">
            {member.messages.map(m => (
              <div key={m.id} className="admin-member-row">
                <div className="admin-member-row-head">
                  <span className={"admin-badge status-" + (m.status === "new" ? "new" : m.status === "spam" ? "spam" : "contacted")}>{m.status}</span>
                  <span className="admin-table-sub">{fmtDate(m.created_at)}</span>
                </div>
                <div className="admin-table-message">{m.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
