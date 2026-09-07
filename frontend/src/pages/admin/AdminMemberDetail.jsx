import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminGetCustomer } from "../../lib/adminApi";
import { ArrowIcon } from "../../lib/icons";
import { useAdminT } from "../../context/AdminI18nContext";

const fmt = n => n.toLocaleString("en-US") + "֏";
const fmtDate = iso => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminMemberDetail() {
  const { t } = useAdminT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    adminGetCustomer(id).then(setMember).catch(() => setError(t("memberDetail.couldntLoad"))).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="admin-empty">{t("common.loading")}</div>;
  if (error || !member) return <div className="admin-error-banner">{error || t("memberDetail.notFound")}</div>;

  const totalSpent = member.quotes.reduce((sum, q) => sum + q.total, 0);

  return (
    <div>
      <button type="button" className="ghost-back admin-editor-back" onClick={() => navigate("/admin/members")}>
        {t("memberDetail.backToMembers")}
      </button>

      <div className="admin-page-head" style={{ marginTop: 6 }}>
        <h1 className="admin-page-title">{member.name}</h1>
      </div>

      <div className="adm-stat-bar" style={{ marginBottom: 24 }}>
        <div className="adm-stat-col">
          <div className="adm-stat-bar-label">{t("memberDetail.statBookings")}</div>
          <div className="adm-stat-bar-value">{member.bookings_count}</div>
        </div>
        <div className="adm-stat-col">
          <div className="adm-stat-bar-label">{t("memberDetail.statTotalBooked")}</div>
          <div className="adm-stat-bar-value">{fmt(totalSpent)}</div>
        </div>
        <div className="adm-stat-col">
          <div className="adm-stat-bar-label">{t("memberDetail.statMessages")}</div>
          <div className="adm-stat-bar-value">{member.messages_count}</div>
        </div>
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">{t("memberDetail.profileTitle")}</h2>
        <div className="admin-member-profile">
          <div><span className="admin-table-sub">{t("common.email")}</span><div>{member.email}</div></div>
          <div><span className="admin-table-sub">{t("common.phone")}</span><div>{member.phone || "—"}</div></div>
          <div><span className="admin-table-sub">{t("memberDetail.profileMemberSince")}</span><div>{fmtDate(member.created_at)}</div></div>
        </div>
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">{t("memberDetail.bookingsTitle", { count: member.quotes.length })}</h2>
        {member.quotes.length === 0 ? (
          <div className="admin-empty">{t("memberDetail.bookingsEmpty")}</div>
        ) : (
          <div className="admin-member-list">
            {member.quotes.map(q => (
              <div key={q.id} className="admin-member-row">
                <div className="admin-member-row-head">
                  <span className="admin-table-title">{t("memberDetail.bookingLabel", { id: q.id })}</span>
                  <span className={"admin-badge status-" + q.status}>{t(`memberDetail.status.${q.status}`)}</span>
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
                <div className="admin-member-row-total">{t("memberDetail.bookingTotal", { amount: fmt(q.total) })}</div>
                {q.note && <div className="admin-booking-note"><strong>{t("memberDetail.bookingNoteLabel")}</strong> {q.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">{t("memberDetail.messagesTitle", { count: member.messages.length })}</h2>
        {member.messages.length === 0 ? (
          <div className="admin-empty">{t("memberDetail.messagesEmpty")}</div>
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
