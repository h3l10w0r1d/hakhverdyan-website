import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminListCustomers } from "../../lib/adminApi";
import { downloadCsv } from "../../lib/csvExport";
import { useAdminT } from "../../context/AdminI18nContext";

const fmtDate = iso => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AdminMembers() {
  const { t } = useAdminT();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    adminListCustomers().then(setMembers).catch(() => setError(t("members.couldntLoad"))).finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? members.filter(m =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.phone || "").toLowerCase().includes(q)
      )
    : members;

  function exportCsv() {
    downloadCsv(
      `members-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: "ID", value: m => m.id },
        { key: "name", label: "Name", value: m => m.name },
        { key: "email", label: "Email", value: m => m.email },
        { key: "phone", label: "Phone", value: m => m.phone || "" },
        { key: "joined", label: "Joined", value: m => new Date(m.created_at).toISOString() },
        { key: "bookings", label: "Bookings", value: m => m.bookings_count },
        { key: "messages", label: "Messages", value: m => m.messages_count },
      ],
      filtered
    );
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t("members.title")}</h1>
        <button className="admin-btn" onClick={exportCsv} disabled={filtered.length === 0}>{t("common.exportCsv")}</button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-search-row">
        <input
          type="text" className="admin-search-input" placeholder={t("members.searchPlaceholder")}
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {q && <span className="admin-search-count">{t("members.searchCount", { count: filtered.length, total: members.length })}</span>}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">{t("common.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">{members.length === 0 ? t("members.emptyNoMembers") : t("members.emptyNoMatch")}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>{t("common.personName")}</th><th>{t("members.colContact")}</th><th>{t("members.colJoined")}</th><th>{t("members.colBookings")}</th><th>{t("members.colMessages")}</th></tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="admin-table-row-clickable" onClick={() => navigate(`/admin/members/${m.id}`)}>
                  <td className="admin-table-title">{m.name}</td>
                  <td>
                    <div>{m.email}</div>
                    {m.phone && <div className="admin-table-sub">{m.phone}</div>}
                  </td>
                  <td>{fmtDate(m.created_at)}</td>
                  <td>{m.bookings_count}</td>
                  <td>{m.messages_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
