import { useEffect, useState } from "react";
import { adminListMessages, adminUpdateMessageStatus } from "../../lib/adminApi";
import Select from "../../components/admin/Select";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "spam", label: "Spam" },
];
const fmtDate = iso => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    adminListMessages().then(setMessages).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function changeStatus(id, status) {
    const updated = await adminUpdateMessageStatus(id, status);
    setMessages(ms => ms.map(m => (m.id === id ? updated : m)));
  }

  return (
    <div>
      <h1 className="admin-page-title">Messages</h1>
      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="admin-empty">No contact messages yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>From</th><th>Message</th><th>Status</th></tr>
            </thead>
            <tbody>
              {messages.map(m => (
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
