import { useEffect, useState } from "react";
import {
  adminListPartners, adminCreatePartner, adminUpdatePartner, adminDeletePartner, adminReorderPartners,
} from "../../lib/adminApi";
import ImageDropzone from "../../components/admin/ImageDropzone";
import DragHandleIcon from "../../components/admin/DragHandleIcon";
import useDragReorder from "../../lib/useDragReorder";

const EMPTY = { name: "", logo: null, url: "", active: true };

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminListPartners().then(setPartners).catch(() => setError("Couldn't load partners.")).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function persistOrder(next) {
    setPartners(next);
    try {
      await adminReorderPartners(next.map(p => p.id));
    } catch {
      setError("Couldn't save the new order — reloading.");
      load();
    }
  }

  const { dragIndex, overIndex, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(partners, persistOrder);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY });
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({ name: p.name, logo: p.logo, url: p.url || "", active: p.active });
  }

  function closeForm() {
    setForm(null);
    setEditingId(null);
  }

  function updateField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.logo) { setError("Add a logo image first."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, url: form.url.trim() || null };
      if (editingId) {
        await adminUpdatePartner(editingId, payload);
      } else {
        await adminCreatePartner(payload);
      }
      closeForm();
      load();
    } catch (err) {
      setError(err.message || "Couldn't save partner.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Remove this partner? This can't be undone.")) return;
    try {
      await adminDeletePartner(id);
      load();
    } catch (err) {
      setError(err.message || "Couldn't remove partner.");
    }
  }

  async function toggleActive(p) {
    const updated = await adminUpdatePartner(p.id, { active: !p.active });
    setPartners(ps => ps.map(x => (x.id === p.id ? updated : x)));
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Partners</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New partner</button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : partners.length === 0 ? (
          <div className="admin-empty">No partners yet.</div>
        ) : (
          <table className="admin-table admin-table-reorderable">
            <thead>
              <tr><th></th><th></th><th>Name</th><th>Website</th><th>Shown on site</th><th></th></tr>
            </thead>
            <tbody>
              {partners.map((p, i) => (
                <tr
                  key={p.id}
                  draggable
                  onDragStart={onDragStart(i)}
                  onDragOver={onDragOver(i)}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  className={
                    (dragIndex === i ? "admin-row-dragging" : "") +
                    (overIndex === i && dragIndex !== i ? " admin-row-drop-target" : "")
                  }
                >
                  <td className="admin-drag-handle" title="Drag to reorder"><DragHandleIcon /></td>
                  <td><img className="admin-table-thumb admin-table-thumb-contain" src={p.logo} alt="" /></td>
                  <td className="admin-table-title">{p.name}</td>
                  <td className="admin-table-sub">{p.url || "—"}</td>
                  <td>
                    <button className={"admin-btn admin-btn-sm" + (p.active ? "" : " admin-btn-muted")} onClick={() => toggleActive(p)}>
                      {p.active ? "Visible" : "Hidden"}
                    </button>
                  </td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {form && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>
          <form className="admin-modal" onSubmit={onSubmit}>
            <div className="admin-modal-head">
              <h2>{editingId ? "Edit partner" : "New partner"}</h2>
              <button type="button" className="admin-modal-close" onClick={closeForm}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <label className="quote-field">
                <span>Logo</span>
                <ImageDropzone value={form.logo} onChange={img => updateField("logo", img)} />
              </label>
              <label className="quote-field">
                <span>Name</span>
                <input value={form.name} onChange={e => updateField("name", e.target.value)} required />
              </label>
              <label className="quote-field">
                <span>Website (optional — leave blank if the logo shouldn't be clickable)</span>
                <input type="url" value={form.url} onChange={e => updateField("url", e.target.value)} placeholder="https://example.com" />
              </label>
              <label className="admin-checkbox-field">
                <input type="checkbox" checked={form.active} onChange={e => updateField("active", e.target.checked)} />
                <span>Shown on the site</span>
              </label>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save partner"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
