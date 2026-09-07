import { useEffect, useState } from "react";
import { adminListMessages, adminUpdateMessageStatus } from "../../lib/adminApi";
import Select from "../../components/admin/Select";
import { downloadCsv } from "../../lib/csvExport";
import { useAdminT } from "../../context/AdminI18nContext";

const fmtDate = iso => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminMessages() {
  const { t } = useAdminT();
  const STATUS_OPTIONS = [
    { value: "new", label: t("messages.statusNew") },
    { value: "replied", label: t("messages.statusReplied") },
    { value: "spam", label: t("messages.statusSpam") },
  ];
  const STATUS_FILTER_OPTIONS = [{ value: "all", label: t("messages.allStatuses") }, ...STATUS_OPTIONS];
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  function load() {
    setLoading(true);
    adminListMessages().then(setMessages).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function changeStatus(id, status) {
    const updated = await adminUpdateMessageStatus(id, status);
    setMessages(ms => ms.map(m => (m.id === id ? updated : m)));
  }

  const query = search.trim().toLowerCase();
  const filtered = messages.filter(m => {
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (!query) return true;
    return (
      m.name.toLowerCase().includes(query) ||
      (m.email || "").toLowerCase().includes(query) ||
      (m.phone || "").toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query)
    );
  });

  function exportCsv() {
    downloadCsv(
      `messages-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "date", label: "Date", value: m => new Date(m.created_at).toISOString() },
        { key: "name", label: "Name", value: m => m.name },
        { key: "email", label: "Email", value: m => m.email || "" },
        { key: "phone", label: "Phone", value: m => m.phone || "" },
        { key: "message", label: "Message", value: m => m.message },
        { key: "status", label: "Status", value: m => m.status },
      ],
      filtered
    );
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t("messages.title")}</h1>
        <button className="admin-btn" onClick={exportCsv} disabled={filtered.length === 0}>{t("common.exportCsv")}</button>
      </div>

      <div className="admin-search-row">
        <input
          type="text" className="admin-search-input" placeholder={t("messages.searchPlaceholder")}
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <Select className="adm-select-sm" value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER_OPTIONS} />
        {(search || statusFilter !== "all") && <span className="admin-search-count">{t("messages.countOf", { filtered: filtered.length, total: messages.length })}</span>}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">{t("common.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">{messages.length === 0 ? t("messages.emptyState") : t("messages.noMatch")}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>{t("common.date")}</th><th>{t("messages.colFrom")}</th><th>{t("messages.colMessage")}</th><th>{t("common.status")}</th></tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>{fmtDate(m.created_at)}</td>
                  <td>
                    <div className="admin-table-title">{m.name}</div>
                    <div className="admin-table-sub">{m.email || m.phone || "—"}</div>
                  </td>
                  <td className="admin-table-message">{m.message}</td>
                  <td>
                    <Select value={m.status} onChange={v => changeStatus(m.id, v)} options={STATUS_OPTIONS} className="adm-select-sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
